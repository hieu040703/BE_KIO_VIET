import { config } from "@/shared/config/env";
import { Request } from "express";
import { injectable } from "inversify";
import { BaseEntity } from "./BaseEntity";
import { BaseRepository } from "./BaseRepository";
import { ApiResponseHandler } from "../utils/response.utils";
import { ConflictError, IError, NotFoundError, ValidationError } from "../types/errors";
import { ApiResponse, IEntityManager, IFindOptions, IService } from "@/shared/types/interfaces";
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
} from "typeorm";
import { ErrorsMessages } from "../constants/errors";
import { FileHelper } from "../utils/file.helper";
@injectable()
export abstract class BaseService<T extends BaseEntity> implements IService<T> {
  protected translate: boolean = config.TRANSLATE;
  protected enableFileAttachment: boolean = true; // Auto-attach files từ MasterFile

  protected repository: BaseRepository<T>;
  // Optional unique fields and scope for DB-level uniqueness checks
  protected uniqueFields?: (keyof T)[];
  protected uniqueScope?: (keyof T)[];
  protected findOptions: FindOptionsWhere<T>;
  protected selectedFields: FindOptionsSelect<T>;
  protected selectedFieldsForList?: FindOptionsSelect<T>;
  protected relations: FindOptionsRelations<T>;
  protected relationsForList?: FindOptionsRelations<T>;

  // Optional searchable fields for text search (keyword)
  // If not set, repository will auto-detect string fields
  protected timeField?: keyof T & string;
  protected searchableFields?: (keyof T)[] & string[];
  protected summaryFields?: (keyof T)[] & string[];

  /**
   * Cho phép nhiều file cùng category cho 1 entity
   * - false (default): Mỗi entity chỉ được 1 file/category tại 1 thời điểm (giữ file mới nhất)
   * - true: Không giới hạn số file
   */
  protected multipleFile: boolean = false;

  /**
   * Danh sách các trường nested (object[] hoặc object) trên entity mà
   * repo con có thể khai báo để BaseRepository gắn files cho các phần tử con.
   * Ví dụ: ['variants'] để gắn file cho từng variant có `id`.
   * Nếu không khai báo, repository sẽ fallback quét mọi trường để phát hiện mảng object có `id`.
   *
   * ⚠️ LƯU Ý: Nested entities LUÔN chỉ giữ 1 file/category (bất kể multipleFile của parent)
   */
  protected nestedFileFields?: string[];

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  /**
   * Helper: Normalize date to Date object
   * Converts DeepPartial<Date>, string, number to Date
   */
  protected normalizeDate(date: DeepPartial<Date> | Date | string | number | null | undefined): Date | null {
    if (!date) return null;
    if (date instanceof Date) return date;
    return new Date(date as any);
  }

  // Method to set options after construction
  setOptions(
    findOptions?: FindOptionsWhere<T>,
    selectedFields?: FindOptionsSelect<T>,
    relations?: FindOptionsRelations<T>,
    selectedFieldsForList?: FindOptionsSelect<T>,
    relationsForList?: FindOptionsRelations<T>,
  ): void {
    if (findOptions) this.findOptions = findOptions;
    if (selectedFields) this.selectedFields = selectedFields;
    if (relations) this.relations = relations;
    if (selectedFieldsForList) this.selectedFieldsForList = selectedFieldsForList;
    if (relationsForList) this.relationsForList = relationsForList;
    // Đảm bảo repository cũng nhận selectedFields mới
    if (this.selectedFields || this.selectedFieldsForList) {
      this.repository.setOptions(
        this.selectedFields,
        this.relations,
        this.timeField,
        this.summaryFields,
        this.selectedFieldsForList,
        this.relationsForList,
      );
    }
  }

  async exists(value: string, field: string, manager?: IEntityManager): Promise<void> {
    return this.exits(value, field, manager);
  }

  async exits(value: string, field: string, manager?: IEntityManager): Promise<void> {
    if (!value) {
      throw new NotFoundError(`${field}.not_found`, [
        {
          field: field,
          code: ErrorsMessages.not_found,
        },
      ]);
    }

    const entity = await this.repository.findByOption(
      { where: { [field]: value } } as FindOptionsWhere<any>,
      manager ?? undefined,
    );
    if (entity) {
      throw new ConflictError(`${field}.exist`, [
        {
          field: field,
          code: ErrorsMessages.already_exists,
        },
      ]);
    }
  }

  /**
   * Override trong subclass để disable file attachment
   * @default true
   */
  protected shouldAttachFiles(): boolean {
    return true;
  }

  // Attach files vào 1 entity (tự động gọi nếu shouldAttachFiles = true)
  protected async attachFilesToEntity(entity: T | null) {
    if (!entity) return null;

    const grouped = await FileHelper.attachFilesToEntity({ id: entity.id });

    return {
      ...entity,
      ...grouped,
    };
  }

  // Attach files vào nhiều entities (optimized, 1 query)
  protected async attachFilesToEntities(entities: T[]) {
    if (!entities || entities.length === 0) return [];

    return await FileHelper.attachFilesToEntities(entities as any[]);
  }

  // Confirm files sau khi tạo entity (tempId → realId)
  protected async confirmEntityFiles(tempId: string, realId: string): Promise<void> {
    await FileHelper.confirmEntityFiles(tempId, realId);
  }

  protected async attachMoreDataToEntities(entities: T[], options: IFindOptions<T>, req?: Request): Promise<void> {
    // Override in subclass if needed
  }

  protected async attachMoreDataToEntity(entity: T, req?: Request): Promise<void> {
    // Override in subclass if needed
  }

  protected async attachMoreDataToSummary(summary: any, options: IFindOptions<T>, req?: Request): Promise<any> {
    // Override in subclass if needed
    return summary;
  }

  protected async actionAfterFindById(entity: T, req?: Request, manager?: IEntityManager): Promise<void> {
    // Override in subclass if needed
  }

  async findById(id: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<T>> {
    let dataRes = await this.repository.findById(id, manager, false, req);
    if (!dataRes) {
      throw new NotFoundError(`id.not_found`, [
        {
          field: "id",
          code: ErrorsMessages.not_found,
        },
      ]);
    }

    await this.attachMoreDataToEntity(dataRes, req);
    await this.actionAfterFindById(dataRes, req, manager);

    return ApiResponseHandler.getSuccess("OK", dataRes);
  }

  async findAll(): Promise<ApiResponse<T[]>> {
    let dataRes = await this.repository.findAll();
    await this.attachMoreDataToEntities(dataRes, {});
    return ApiResponseHandler.getSuccess("OK", dataRes);
  }

  async findByOption(
    options: FindOneOptions<T>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<T | null>> {
    let dataRes = await this.repository.findByOption(options, manager);
    if (!dataRes) {
      return ApiResponseHandler.getSuccess("OK", null);
    }
    await this.attachMoreDataToEntity(dataRes, req);
    return ApiResponseHandler.getSuccess("OK", dataRes);
  }

  async findByOptions(options: FindManyOptions<T>, req?: Request, manager?: IEntityManager): Promise<ApiResponse<T[]>> {
    let dataRes = await this.repository.findByOptions(options, manager);
    await this.attachMoreDataToEntities(dataRes, options, req);
    return ApiResponseHandler.getSuccess("OK", dataRes);
  }

  async validateBeforeQuery(options: IFindOptions<T>, req?: Request, manager?: IEntityManager): Promise<void> {}
  async actionAfterQuery(
    data: T[],
    req?: Request,
    options?: IFindOptions<T>,
    manager?: IEntityManager,
  ): Promise<void> {}

  /**
   *  Phương thức này dùng để tìm kiếm với phân trang và các điều kiện khác nhau
   *  như type, status, khoảng thời gian, và từ khóa tìm kiếm.
   *  - Nếu có type thì chỉ lấy những field tương ứng với type đó
   *  - Nếu có status thì chỉ lấy những field tương ứng với status đó
   *  - Nếu có khoảng thời gian thì chỉ lấy những field tương ứng với khoảng thời gian đó
   *  - Nếu có keyword thì tìm kiếm theo các field có thể tìm kiếm
   *  - Nếu không có keyword thì trả về tất cả các field
   * @param options
   * @returns
   */
  async findAllWithPagination(
    options: IFindOptions<T>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<T[]>> {
    await this.validateBeforeQuery(options, req, manager);

    let page = options.page || 1;
    const size = options.size || 20;

    const optionData: IFindOptions<T> = {
      ...options,
      relations: options.relations || this.relationsForList || this.relations,
      select: options.select || this.selectedFieldsForList || this.selectedFields,
      page: page,
      size: size,
      order: {},
      keyword: options.keyword,
      searchFields: this.searchableFields, // Use configured searchableFields
      summaryFields: this.summaryFields,
      dateFilter: this.timeField,
      type: options.type,
      status: options.status,
      startAt: options.startAt,
      endAt: options.endAt,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      isFinished: options.isFinished,
      moreQuery: {
        ...options,
      },
    };

    let dataRes = await this.repository.findWithPagination(optionData, manager, false, req);

    const totalPages = Math.ceil(dataRes.total / size);
    if (page > totalPages && totalPages > 0) {
      page = totalPages;

      dataRes = await this.repository.findWithPagination(
        {
          ...optionData,
          page: page,
        },
        manager,
      );
    }

    let data = dataRes.data;
    let summary = dataRes.summary || {};

    await this.attachMoreDataToEntities(data, options);
    await this.actionAfterQuery(data, req, options, manager);
    summary = await this.attachMoreDataToSummary(summary, options);

    return ApiResponseHandler.getSuccess(
      "OK",
      data,
      {
        totalRecords: dataRes.total,
        size: size,
        currentPage: page,
        totalPages: Math.ceil(dataRes.total / size),
      },
      summary,
    );
  }

  /**
   * Validate data before create: Logic business riêng cho từng entity hoặc đắp thêm dữ liệu
   * @param data
   * @param manager
   * @param req
   */
  async validateBeforeCreate(data: DeepPartial<T>, req?: Request, manager?: IEntityManager): Promise<void> {
    // Override in subclass if needed
  }

  /**
   * Sau khi tạo record thành công, thực hiện các hành động bổ sung
   * VD: Gửi thông báo, tính lại dữ liệu entity liên quan, v.v.
   * @param data
   * @param manager
   * @param req
   */
  async actionAfterCreate(data: T, req?: Request, manager?: IEntityManager): Promise<void> {
    // Override in subclass if needed
  }

  async create(data: DeepPartial<T>, req?: Request, manager?: IEntityManager): Promise<ApiResponse<T>> {
    await this.validateBeforeCreate(data, req, manager);

    // perform unique check if configured
    if (this.uniqueFields && this.uniqueFields.length > 0) {
      const errs = await this.checkExistInDb(
        data as any,
        this.uniqueFields as any,
        (this.uniqueScope as any) || [],
        manager,
      );
      if (errs.length > 0) throw new ValidationError("input.invalid", errs);
    }

    // perform reference existence check if applicable
    // const refErrs = await this.checkReferencesInDb?.(data, manager);
    // if (refErrs && refErrs.length > 0) throw new ValidationError("input.invalid", refErrs);

    if (manager) {
      // Nếu có manager được truyền vào (đang trong transaction), sử dụng nó
      const dataRes = await this.repository.create(data, manager);

      const fullData = await this.repository.findById(dataRes.id, manager, false, req);
      // Hook hậu tạo phải chạy trên entity vừa lưu kể cả khi query có scope theo user không trả về fullData.
      await this.actionAfterCreate(fullData || dataRes, req, manager);
      return ApiResponseHandler.createSuccess("OK", fullData || dataRes);
    }

    const dataRes = await this.repository.create(data);

    const fullData = await this.repository.findById(dataRes.id, manager, false, req);
    // Hook hậu tạo phải chạy trên entity vừa lưu kể cả khi query có scope theo user không trả về fullData.
    await this.actionAfterCreate(fullData || dataRes, req, manager);

    return ApiResponseHandler.createSuccess("OK", fullData);
  }

  async createMany(data: DeepPartial<T>[], req?: Request, manager?: IEntityManager): Promise<ApiResponse<T[]>> {
    if (data.length === 0) {
      throw new NotFoundError(`data.empty`, [
        {
          field: "data",
          code: ErrorsMessages.required,
        },
      ]);
    }
    if (manager) {
      // Nếu có manager được truyền vào (đang trong transaction), sử dụng nó
      const dataRes = await this.repository.createMany(data, manager);
      return ApiResponseHandler.createSuccess("OK", dataRes);
    }
    const dataRes = await this.repository.createMany(data);
    return ApiResponseHandler.createSuccess("OK", dataRes);
  }

  /**
   * Validate data before update: Logic business riêng cho từng entity hoặc đắp thêm dữ liệu
   * @param id
   * @param data
   * @param manager
   * @param req
   */
  async validateBeforeUpdate(id: string, data: Partial<T>, req?: Request, manager?: IEntityManager): Promise<void> {
    // Override in subclass if needed
  }

  /**
   * Sau khi cập nhật record thành công, thực hiện các hành động bổ sung
   * VD: Gửi thông báo, tính lại dữ liệu entity liên quan, v.v.
   * @param data
   * @param manager
   * @param req
   */
  async actionAfterUpdate(data: T, req?: Request, manager?: IEntityManager): Promise<void> {
    // Override in subclass if needed
  }

  async update(id: string, data: Partial<T>, req?: Request, manager?: IEntityManager): Promise<ApiResponse<T>> {
    await this.validateBeforeUpdate(id, data, req, manager);
    const exist = await this.repository.findById(id, manager);
    if (!exist) {
      throw new NotFoundError(`id.not_found`, [
        {
          field: "id",
          code: ErrorsMessages.not_found,
        },
      ]);
    }

    // perform unique check if configured (exclude self by id)
    if (this.uniqueFields && this.uniqueFields.length > 0) {
      const item = { ...(data as any), id } as any;
      const errs = await this.checkExistInDb(item, this.uniqueFields as any, (this.uniqueScope as any) || [], manager);
      if (errs.length > 0) throw new ValidationError("input.invalid", errs);
    }

    // perform reference existence check for update
    // Truyền `exist` để bỏ qua check cho các FK có giá trị KHÔNG đổi so với DB.
    // Lý do: nếu entity được tham chiếu đã bị soft-delete sau khi liên kết được tạo,
    // user vẫn cần update các field khác mà không bị fail bởi FK cũ (vd: recruiterId
    // trỏ tới nhân viên đã nghỉ nhưng vẫn lưu lịch sử).
    const refErrs = await this.checkReferencesInDb(
      {
        ...data,
        id,
      },
      manager,
      exist,
    );

    if (refErrs && refErrs.length > 0) throw new ValidationError("input.invalid", refErrs);

    const dataRes = await this.repository.update(id, data, manager);
    if (!dataRes) {
      throw new NotFoundError(`id.not_found`, [
        {
          field: "id",
          code: ErrorsMessages.not_found,
        },
      ]);
    }

    await this.actionAfterUpdate(dataRes, req, manager);

    const fullData = await this.repository.findById(dataRes.id, manager);
    return ApiResponseHandler.updateSuccess("OK", fullData);
  }

  async updateMany(ids: string[], data: Partial<T>, manager?: IEntityManager): Promise<ApiResponse<T[]>> {
    if (ids.length === 0) {
      throw new NotFoundError(`ids.empty`, [
        {
          field: "ids",
          code: ErrorsMessages.required,
        },
      ]);
    }
    const exist = await this.repository.findByOptions({
      where: {
        id: In(ids),
      } as any,
    });
    if (exist.length === 0) {
      throw new NotFoundError(`ids.not_found`, [
        {
          field: "ids",
          code: ErrorsMessages.not_found,
        },
      ]);
    }
    const dataRes = await this.repository.updateMany(ids, data, manager);
    return ApiResponseHandler.updateSuccess("OK", dataRes);
  }

  async updateOptions(
    options: Partial<T>,
    where: FindOptionsWhere<T>,
    manager?: IEntityManager,
  ): Promise<ApiResponse<T>> {
    const dataRes = await this.repository.updateOptions(options, where, manager);
    if (!dataRes) {
      throw new NotFoundError(`id.not_found`, [
        {
          field: "id",
          code: ErrorsMessages.not_found,
        },
      ]);
    }
    return ApiResponseHandler.updateSuccess("OK", dataRes);
  }

  async delete(id: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<Boolean>> {
    await this.validateBeforeDelete(id, req, manager);
    const exist = await this.repository.findById(id, manager);
    if (!exist) {
      throw new NotFoundError(`id.not_found`, [
        {
          field: "id",
          code: ErrorsMessages.not_found,
        },
      ]);
    }
    const dataRes = await this.repository.delete(id, manager, req);
    if (dataRes) await this.actionAfterDelete(exist, req, manager);
    return ApiResponseHandler.deleteSuccess("OK", id);
  }

  async restoreRecord(id: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<T>> {
    const exist = await this.repository.findById(id, manager);
    if (!exist) {
      throw new NotFoundError(`id.not_found`, [
        {
          field: "id",
          code: ErrorsMessages.not_found,
        },
      ]);
    }

    const dataRes = await this.repository.restore(id, manager);
    if (!dataRes) {
      throw new NotFoundError(`id.not_found`, [
        {
          field: "id",
          code: ErrorsMessages.not_found,
        },
      ]);
    }
    return ApiResponseHandler.restoreSuccess("OK", dataRes);
  }

  /**
   * Validate data before delete: Logic business riêng cho từng entity hoặc đắp thêm dữ liệu
   * @param id
   * @param manager
   * @param req
   */
  async validateBeforeDelete(id: string, req?: Request, manager?: IEntityManager): Promise<void> {
    // Override in subclass if needed
  }

  /**
   * Check existence in DB for given fields with optional scope fields.
   * Example: fields = ["email","phone"], scope = ["partnerId"]
   * Will query (email AND partnerId) OR (phone AND partnerId)
   * Returns an array of IError (empty when no conflicts)
   */
  protected async checkExistInDb(
    items: T | T[],
    fields: (keyof T)[],
    scopeFields: (keyof T)[] = [],
    manager?: IEntityManager,
  ): Promise<IError[]> {
    const itemArray = Array.isArray(items) ? items : [items];
    const errors: IError[] = [];

    for (let i = 0; i < itemArray.length; i++) {
      const item = itemArray[i];

      const whereConditions: any[] = [];

      for (const field of fields) {
        const value = (item as any)[field as string];
        if (value === undefined || value === null || value === "") continue;

        const condition: any = { [field as string]: value };
        // attach scope fields as AND conditions
        for (const s of scopeFields) {
          const scopeVal = (item as any)[s as string];
          if (scopeVal === undefined || scopeVal === null) {
            // if scope value is missing, skip adding it to this condition
            continue;
          }
          condition[s as string] = scopeVal;
        }

        condition.deletedAt = null;
        whereConditions.push(condition);
      }

      if (whereConditions.length === 0) continue;

      let found: any[] = [];
      try {
        found = await this.repository.findByOptions({ where: whereConditions } as any, manager);
      } catch (err) {
        throw err;
      }

      if (found.length > 0) {
        for (const field of fields) {
          const val = (item as any)[field as string];
          if (val === undefined || val === null || val === "") continue;

          const conflict = found.some((entity: any) => {
            const scopeMatch = scopeFields.every((s) => {
              const expected = (item as any)[s as string];
              return expected === undefined || expected === null
                ? true
                : String(entity[s as string]) === String(expected);
            });
            if (!scopeMatch) return false;
            return (
              String(entity[field as string]) === String(val) &&
              (!(item as any).id || String(entity.id) !== String((item as any).id))
            );
          });

          if (conflict) {
            errors.push({
              field: String(field),
              code: ErrorsMessages.already_exists,
              index: Array.isArray(items) ? i : undefined,
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Check foreign-key references in DB for non-tenant entities.
   * Batches checks per related-entity to minimize queries (1 query per related entity).
   *
   * @param items     Dữ liệu cần check (payload create/update)
   * @param manager   Optional transaction manager
   * @param existingItems  (Optional) Record hiện có trong DB - dùng cho luồng UPDATE.
   *                       Nếu giá trị FK trong `items` khớp với giá trị FK trong `existingItems`
   *                       (tức user không đổi FK), sẽ BỎ QUA check tồn tại cho FK đó.
   *                       Mục đích: cho phép update các field khác khi FK cũ trỏ tới
   *                       entity đã soft-delete (vd: recruiterId trỏ tới nhân viên đã nghỉ).
   */
  protected async checkReferencesInDb(
    items: DeepPartial<T> | Partial<T> | Partial<T>[],
    manager?: IEntityManager,
    existingItems?: T | T[] | null,
  ): Promise<IError[]> {
    const itemArray = Array.isArray(items) ? items : [items];
    const existingArray = Array.isArray(existingItems)
      ? existingItems
      : existingItems
        ? [existingItems]
        : [];
    const errors: IError[] = [];

    // get root repo metadata
    const rootRepo = this.repository.getRepository(manager);
    const entityMetadata = rootRepo.metadata;

    // map possible fk keys -> related entity name and target
    const relationIdToEntityMap: Record<string, string> = {};
    const relationTargetMap: Record<string, any> = {};

    entityMetadata.relations.forEach((relation: any) => {
      const joinColumn = relation.joinColumns?.[0];
      const propKey = `${relation.propertyName}Id`;
      const relatedName = relation.inverseEntityMetadata.name;
      relationTargetMap[relatedName] = relation.inverseEntityMetadata.target;
      if (joinColumn?.databaseName) relationIdToEntityMap[joinColumn.databaseName] = relatedName;
      relationIdToEntityMap[propKey] = relatedName;
    });

    // collect ids per related entity and track occurrences
    const occurrences: Record<string, Map<string, Array<{ index: number; field: string }>>> = {};

    for (let i = 0; i < itemArray.length; i++) {
      const item: any = itemArray[i];
      // Lấy record DB tương ứng (nếu có) để so sánh giá trị FK cũ/mới
      const existing: any = existingArray[i] ?? (existingArray.length === 1 ? existingArray[0] : undefined);

      for (const key of Object.keys(item)) {
        if (!key.endsWith("Id")) continue;
        const relatedEntity = relationIdToEntityMap[key];
        if (!relatedEntity) continue;
        const idValue = item[key];
        if (!idValue) continue;

        // Nếu là luồng UPDATE và FK không đổi so với DB thì bỏ qua check tồn tại.
        // Tránh fail khi entity được tham chiếu đã bị soft-delete sau thời điểm tạo liên kết.
        if (
          existing &&
          existing[key] !== undefined &&
          existing[key] !== null &&
          String(existing[key]) === String(idValue)
        ) {
          continue;
        }

        occurrences[relatedEntity] = occurrences[relatedEntity] || new Map();
        const mapForEntity = occurrences[relatedEntity];
        const idStr = String(idValue);
        if (!mapForEntity.has(idStr)) mapForEntity.set(idStr, []);
        mapForEntity.get(idStr)!.push({ index: i, field: key });
      }
    }

    if (Object.keys(occurrences).length === 0) return errors;

    // For each related entity, batch check IDs
    await Promise.all(
      Object.keys(occurrences).map(async (relatedEntity) => {
        const idMap = occurrences[relatedEntity];
        const ids = Array.from(idMap.keys());

        const target = relationTargetMap[relatedEntity];
        if (!target) {
          idMap.forEach((arr) => {
            arr.forEach((occ) =>
              errors.push({
                field: occ.field,
                code: ErrorsMessages.not_found,
                index: occ.index,
              }),
            );
          });
          return;
        }

        const repo = (manager ?? rootRepo.manager).getRepository(target as any);

        const found = await repo.find({
          where: { id: In(ids as any), deletedAt: null } as any,
        });

        const foundIds = new Set(found.map((f: any) => String(f.id)));

        idMap.forEach((arr, id) => {
          if (!foundIds.has(id)) {
            arr.forEach((occ) =>
              errors.push({
                field: occ.field,
                code: ErrorsMessages.not_found,
                index: occ.index,
              }),
            );
          }
        });
      }),
    );

    return errors;
  }

  /**
   * Sau khi xoá record thành công, thực hiện các hành động bổ sung
   * VD: Gửi thông báo, tính lại dữ liệu entity liên quan, v.v.
   * @param data
   * @param manager
   * @param req
   */
  async actionAfterDelete(data: T, req?: Request, manager?: IEntityManager): Promise<void> {
    // Override in subclass if needed
  }
}
