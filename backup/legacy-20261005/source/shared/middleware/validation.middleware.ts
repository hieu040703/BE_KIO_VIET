import { Request, Response, NextFunction } from "express";
import z, { ZodError } from "zod";
import { ValidationError } from "@/shared/types/errors";
import { ErrorsMessages } from "../constants/errors";
import { BaseEntity } from "../base/BaseEntity";
import { BaseRepository } from "../base/BaseRepository";
import { DataSource, FindOptionsWhere } from "typeorm";

type WhereValidate = "body" | "query" | "params";

const trimStrings = (value: any): any => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(trimStrings);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, trimStrings(v)]));
  }
  return value;
};

export const getErrorsMessages = (error: z.ZodError): string[] => {
  const errorCodes: string[] = [];

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    let errorCode: string;

    switch (issue.code) {
      case "invalid_type":
        if (issue.message?.toLowerCase().includes("required")) {
          errorCode = ErrorsMessages.required;
        } else {
          errorCode = ErrorsMessages.invalid;
        }
        break;

      case "too_small":
        errorCode = ErrorsMessages.min;
        break;

      case "too_big":
        errorCode = ErrorsMessages.max;
        break;

      case "custom":
        errorCode = ErrorsMessages.incorrect;
        break;

      default:
        errorCode = ErrorsMessages.incorrect;
    }

    errorCodes.push(`${path}.${errorCode}`);
  });

  return [...new Set(errorCodes)]; // loại bỏ trùng lặp
};

export const zodValidate = (schema: z.ZodObject | z.ZodArray<any>, where: WhereValidate) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (where === "body") {
        console.log(`Validating body:`, req.body);
        if (req.body) {
          req.body = schema.parse(trimStrings(req.body));
        }
      } else if (where === "query") {
        //? nếu nhận được tham số có dạng như sau : 'shopIds[]': [ '1', '2' ] , thì chuyển thành shopIds: [ '1', '2' ]
        //? Tương tự: 'statuses[]': [ 'active', 'on_leave' ] → statuses: [ 'active', 'on_leave' ]
        //? Đồng thời wrap string đơn lẻ thành array cho các field kết thúc bằng 'Ids'
        const processedQuery: Record<string, any> = {};

        if (typeof req.query === "object" && req.query !== null) {
          for (const key of Object.keys(req.query)) {
            const value = (req.query as Record<string, any>)[key];
            const normalizedKey = key.endsWith("[]") ? key.slice(0, -2) : key;

            // Với các field kết thúc bằng 'Ids' (vd: branchIds, managerIds) hoặc 'Statuses' (vd: statuses)
            // mà giá trị là string đơn → wrap thành array
            const isArrayLikeKey = normalizedKey.endsWith("Ids") || normalizedKey.endsWith("Statuses");
            const normalizedValue = isArrayLikeKey && typeof value === "string" ? [value] : value;

            // Gán vào key mới (không ghi đè nếu key đã tồn tại từ trước)
            if (!(normalizedKey in processedQuery)) {
              processedQuery[normalizedKey] = normalizedValue;
            }
          }
        }

        console.log(`Processed query:`, processedQuery);

        // Validate the processed query
        const validatedQuery = schema.parse(trimStrings(processedQuery));

        // For Express compatibility, replace the query object using defineProperty
        Object.defineProperty(req, "query", {
          value: validatedQuery,
          writable: true,
          configurable: true,
        });
      } else if (where === "params") {
        console.log(`Validating params:`, req.params);
        // Instead of assigning to req.params, validate and store in locals
        const validatedParams = schema.parse(trimStrings(req.params));
        // For Express v5 compatibility, we extend the request object
        Object.defineProperty(req, "params", {
          value: validatedParams,
          writable: true,
          configurable: true,
        });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = getErrorsMessages(error);

        next(
          new ValidationError(
            `input.invalid`,
            errorMessages.map((msg) => ({ field: msg.split(".")[0], code: msg })),
          ),
        );
      } else {
        next(error);
      }
    }
  };
};

export const zodValidateData = (data: any, schema: z.ZodObject) => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((err) => {
        return `${data.code} : ${err.message}`;
      }) as string[];

      throw new ValidationError(
        error.message || `input.invalid`,
        errorMessages.map((msg) => ({ field: data.code, code: msg })),
      );
    } else {
      throw error;
    }
  }
};

export const checkDuplicate = <T extends BaseEntity>(repo: BaseRepository<T>, fields: (keyof T)[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const whereConditions: FindOptionsWhere<T>[] = [];
    const checkedFields: (keyof T)[] = [];

    for (const key of fields) {
      const value = req.body?.[key as string];
      if (value !== undefined && value !== null) {
        whereConditions.push({ [key]: value, deletedAt: null } as any);
        checkedFields.push(key);
      }
    }

    if (whereConditions.length === 0) return next();

    try {
      const entities = await repo.findByOptions({
        where: whereConditions.length === 1 ? whereConditions[0] : whereConditions,
      });

      const currentId = req.params?.id;

      if (entities.length > 0) {
        const errorMessages: string[] = [];

        for (const field of checkedFields) {
          const value = req.body?.[field as string];
          const isDuplicate = entities.some(
            (entity) => entity[field] === value && (!currentId || String(entity.id) !== String(currentId)),
          );

          if (isDuplicate) {
            errorMessages.push(`${String(field)}.${ErrorsMessages.already_exists}`);
          }
        }

        if (errorMessages.length > 0) {
          return next(
            new ValidationError(
              "input.invalid",
              errorMessages.map((msg) => ({ field: msg.split(".")[0], code: msg })),
            ),
          );
        }
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const checkDuplicateCombo = (
  repo: {
    findByOption: (options: any, manager?: any) => Promise<any>;
  },
  comboFields: string[],
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const fields = Object.fromEntries(comboFields.map((key) => [key, data[key]]));

      if (Object.values(fields).some((val) => val === undefined)) {
        return next();
      }

      // thêm điều kiện deletedAt: null
      const exists = await repo.findByOption({
        where: { ...fields, deletedAt: null },
      });

      const currentId = req.params?.id;

      if (exists && (!currentId || String(exists.id) !== String(currentId))) {
        const key = comboFields.join("_");
        const errorMessage = `${key}.${ErrorsMessages.already_exists}`;
        return next(new ValidationError(`input.invalid`, { field: key, code: errorMessage }));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};

/**
 * Kiểm tra các field trong body có tồn tại trong DB không (dùng id).
 * @param fields - danh sách các field cần check với dạng { fieldName: EntityName }
 * @returns Middleware
 */
export const checkNotFound = (entityName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const repoMap = res.locals.fullRepo;
    const dataSource: DataSource = res.locals.dataSource; // đảm bảo cái này được gắn vào res.locals

    if (!repoMap || !dataSource) {
      return res.status(500).json({ message: "Repositories or datasource not initialized." });
    }

    const body = req.body;
    const errors: string[] = [];

    const entityMetadata = dataSource.getMetadata(entityName);
    const relationIdToEntityMap: Record<string, string> = {};

    // Duyệt các quan hệ để map từ "jobPositionId" => "Attribute"
    entityMetadata.relations.forEach((relation) => {
      const joinColumn = relation.joinColumns?.[0];
      if (joinColumn?.databaseName) {
        relationIdToEntityMap[joinColumn.databaseName] = relation.inverseEntityMetadata.name;
      }
    });

    // Duyệt body để check các trường ID
    for (const key of Object.keys(body)) {
      if (key.endsWith("Id")) {
        const idValue = body[key];
        const relatedEntity = relationIdToEntityMap[key];

        if (!relatedEntity) {
          // Không phải quan hệ, bỏ qua
          continue;
        }

        const repo = repoMap[relatedEntity];
        if (!repo) {
          errors.push(`Repository for ${relatedEntity} not found.`);
          continue;
        }

        // Chỉ tìm bản ghi chưa bị soft delete
        const found = await repo.findOne({
          where: { id: idValue, deletedAt: null } as any,
        });

        if (!found) {
          errors.push(`${key}.not_found`);
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError("reference.invalid"));
    }

    next();
  };
};
