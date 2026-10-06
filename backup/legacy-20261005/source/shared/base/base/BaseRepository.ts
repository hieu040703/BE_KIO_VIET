import {
  Repository,
  EntityTarget,
  FindOptionsWhere,
  DeepPartial,
  EntityManager,
  FindManyOptions,
  IsNull,
  Not,
  DataSource,
  FindOneOptions,
  FindOptionsSelect,
  FindOptionsRelations,
  In,
  SelectQueryBuilder,
  Brackets,
} from "typeorm";
import { IFindOptions, IRepository } from "@/shared/types/interfaces";
import { NotFoundError } from "@/shared/types/errors";
import { injectable } from "inversify";
import { BaseEntity } from "./BaseEntity";
import { FileStatusEnum } from "../constants/constance";
import logger from "../utils/logger";
import { config } from "../config/env";
import fs from "fs/promises";
import { Utils } from "../utils/utils";
import { Request } from "express";
import DatabaseConfig from "@/database/database";

@injectable()
export abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  protected abstract entityClass: EntityTarget<T>;
  protected repository: Repository<T>;
  protected dataSource: DataSource;
  protected selectedFields: FindOptionsSelect<T>;
  protected selectedFieldsForList?: FindOptionsSelect<T>;
  protected relations: FindOptionsRelations<T>;
  protected relationsForList?: FindOptionsRelations<T>;
  protected entityName: string;
  protected timeField: keyof T | undefined;
  protected summaryFields: (keyof T)[] | undefined;
  protected searchFields: (keyof T)[] | undefined;
  protected hiddenPasswordField: boolean = true; // mặc định ẩn trường password khi lấy dữ liệu

  protected joinAllRelations: boolean = false; // mặc định không join tất cả relations

  protected enableFileAttachment: boolean = true; // Auto-attach files từ MasterFile
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

  private getObjectsFromPath(source: unknown, path: string): Array<Record<string, any>> {
    if (!source || typeof source !== "object" || !path) {
      return [];
    }

    const segments = path
      .split(".")
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.length === 0) {
      return [];
    }

    let currentLevel: unknown[] = [source];

    for (const segment of segments) {
      const nextLevel: unknown[] = [];

      for (const node of currentLevel) {
        if (Array.isArray(node)) {
          for (const item of node) {
            if (item && typeof item === "object") {
              nextLevel.push((item as Record<string, unknown>)[segment]);
            }
          }
          continue;
        }

        if (node && typeof node === "object") {
          nextLevel.push((node as Record<string, unknown>)[segment]);
        }
      }

      currentLevel = nextLevel
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is Record<string, any> => !!value && typeof value === "object");

      if (currentLevel.length === 0) {
        break;
      }
    }

    return currentLevel as Array<Record<string, any>>;
  }

  private getNestedObjects(source: unknown, fallbackToDirectScan: boolean = true): Array<Record<string, any>> {
    if (!source || typeof source !== "object") {
      return [];
    }

    if (this.nestedFileFields && this.nestedFileFields.length > 0) {
      return this.nestedFileFields.flatMap((path) => this.getObjectsFromPath(source, path));
    }

    if (!fallbackToDirectScan) {
      return [];
    }

    const directObjects: Array<Record<string, any>> = [];
    Object.keys(source as Record<string, unknown>).forEach((key) => {
      const value = (source as Record<string, unknown>)[key];
      if (Utils.isArrayOfObjectsWithId(value)) {
        directObjects.push(...(value as Record<string, any>[]));
      } else if (value && typeof value === "object" && "id" in value) {
        directObjects.push(value as Record<string, any>);
      }
    });

    return directObjects;
  }

  private collectNestedIds(source: unknown, fallbackToDirectScan: boolean = true): string[] {
    const ids = this.getNestedObjects(source, fallbackToDirectScan)
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    return Array.from(new Set(ids));
  }

  private attachGroupedFilesToNestedTargets(
    source: Record<string, any>,
    filesByEntity: Record<string, Record<string, any[]>>,
  ): void {
    if (this.nestedFileFields && this.nestedFileFields.length > 0) {
      const nestedTargets = this.getNestedObjects(source, false);
      nestedTargets.forEach((target) => {
        if (!target?.id) return;
        Object.assign(target, filesByEntity[target.id] || {});
      });
      return;
    }

    Object.keys(source).forEach((key) => {
      const value = source[key];
      if (Utils.isArrayOfObjectsWithId(value)) {
        source[key] = value.map((item: Record<string, any>) => {
          if (!item?.id) return item;
          return { ...item, ...(filesByEntity[item.id] || {}) };
        });
      } else if (value && typeof value === "object" && "id" in value) {
        const child = value as Record<string, any>;
        source[key] = { ...child, ...(filesByEntity[child.id] || {}) };
      }
    });
  }

  private async activatePendingFilesForNestedEntity(fileRepo: Repository<any>, nestedEntityId: string): Promise<void> {
    const pendingFiles = await fileRepo.find({
      where: {
        entityId: nestedEntityId,
        status: FileStatusEnum.PENDING,
        deletedAt: null,
      } as any,
    });

    const pendingByCategory: Record<string, any[]> = {};
    for (const file of pendingFiles) {
      const category = (file as any).category || "default";
      if (!pendingByCategory[category]) {
        pendingByCategory[category] = [];
      }
      pendingByCategory[category].push(file);
    }

    for (const [category] of Object.entries(pendingByCategory)) {
      await fileRepo
        .createQueryBuilder()
        .softDelete()
        .where("entityId = :entityId", { entityId: nestedEntityId })
        .andWhere("category = :category", { category })
        .andWhere("status = :status", {
          status: FileStatusEnum.ACTIVE,
        })
        .andWhere("deletedAt IS NULL")
        .execute();
    }

    await fileRepo
      .createQueryBuilder()
      .update()
      .set({
        status: FileStatusEnum.ACTIVE,
        expiresAt: null,
      })
      .where("entityId = :entityId", { entityId: nestedEntityId })
      .andWhere("status = :status", {
        status: FileStatusEnum.PENDING,
      })
      .andWhere("deletedAt IS NULL")
      .execute();
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<T>,
    options: IFindOptions<T>,
    req?: Request,
  ): Promise<void> {
    // mặc định không làm gì — repo con override khi cần join/group/select thêm
  }

  protected async extendSummaryFields(
    summary: any,
    qb: SelectQueryBuilder<T>,
    options: IFindOptions<T>,
    req?: Request,
  ): Promise<void> {
    // mặc định không làm gì — repo con override khi cần
  }

  private extractEntityIdFromRaw(raw: Record<string, any>): unknown {
    if (!raw || typeof raw !== "object") {
      return undefined;
    }

    if (raw.entity_id !== undefined && raw.entity_id !== null) {
      return raw.entity_id;
    }

    if (raw.id !== undefined && raw.id !== null) {
      return raw.id;
    }

    for (const key of Object.keys(raw)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("entity") && lowerKey.includes("id") && raw[key] !== undefined && raw[key] !== null) {
        return raw[key];
      }
    }

    return undefined;
  }

  // sửa trong BaseRepository
  protected mapRawEntities(rawAndEntities: { entities: T[]; raw: any[] }): any[] {
    const repository = this.getRepository();
    const metadata = repository.metadata;
    const rawByEntityId = new Map<unknown, Record<string, any>>();

    rawAndEntities.raw.forEach((raw) => {
      const entityId = this.extractEntityIdFromRaw(raw);
      if (entityId !== undefined && !rawByEntityId.has(entityId)) {
        rawByEntityId.set(entityId, raw);
      }
    });

    return rawAndEntities.entities.map((entity) => {
      // CRITICAL FIX: Match entity with correct raw row by ID instead of index
      // When using leftJoinAndSelect with OneToMany/ManyToMany relations,
      // TypeORM creates multiple raw rows (1 per relation item) but deduplicates entities
      // This causes index mismatch between entities and raw arrays
      const entityId = (entity as any).id;
      const raw =
        rawByEntityId.get(entityId) ??
        rawAndEntities.raw.find((r) => {
          return this.extractEntityIdFromRaw(r) === entityId;
        });

      if (!raw) {
        // Fallback: if no raw found by ID, entity data is already hydrated by TypeORM
        // Still convert varchar/text/char fields from number to string
        metadata.columns.forEach((column) => {
          const propertyName = column.propertyName;
          const columnType = column.type;

          if (
            (columnType === "varchar" || columnType === "text" || columnType === "char") &&
            propertyName in entity &&
            typeof (entity as any)[propertyName] === "number"
          ) {
            (entity as any)[propertyName] = String((entity as any)[propertyName]);
          }
        });
        return entity;
      }

      const extras: any = {};

      // Override entity values with raw values for varchar/text/char columns to preserve leading zeros.
      // IMPORTANT: Only use "entity_{propertyName}" prefixed keys — never bare keys like "code" or "name".
      // Bare keys without prefix may collide with same-named columns from joined tables (e.g. user.code,
      // branch.code) and silently overwrite the main entity fields with incorrect values.
      metadata.columns.forEach((column) => {
        const propertyName = column.propertyName;
        const columnType = column.type;

        if (columnType === "varchar" || columnType === "text" || columnType === "char") {
          const strictKey = `entity_${propertyName}`;
          const strictKeyLower = `entity_${propertyName.toLowerCase()}`;

          if (strictKey in raw && raw[strictKey] !== null && raw[strictKey] !== undefined) {
            (entity as any)[propertyName] = String(raw[strictKey]);
          } else if (strictKeyLower in raw && raw[strictKeyLower] !== null && raw[strictKeyLower] !== undefined) {
            (entity as any)[propertyName] = String(raw[strictKeyLower]);
          } else if (propertyName in entity && typeof (entity as any)[propertyName] === "number") {
            // Fallback: chỉ khi entity value đang là number (cần convert sang string)
            (entity as any)[propertyName] = String((entity as any)[propertyName]);
          }
        }
      });

      // Process relations recursively - get values from raw data to preserve leading zeros
      // NOTE: Only process single relations (OneToOne, ManyToOne)
      // Array relations (OneToMany, ManyToMany) are already correctly hydrated by TypeORM
      metadata.relations.forEach((relation) => {
        const relationPropertyName = relation.propertyName;
        const relationEntity = (entity as any)[relationPropertyName];

        if (relationEntity) {
          // Get relation metadata
          const relationMetadata = relation.inverseEntityMetadata;

          // Only transform single relations, NOT arrays
          // Array relations contain multiple entities with different raw values
          // Transforming them would incorrectly apply the same raw value to all items
          if (!Array.isArray(relationEntity)) {
            // Handle single relation only
            this.transformEntityStringFieldsFromRaw(relationEntity, relationMetadata, raw, relationPropertyName);
          }
        }
      });

      // auto map các alias có prefix entity_
      Object.keys(raw).forEach((key) => {
        if (key.startsWith("entity_") && !key.includes("entity_id")) {
          const field = key.replace("entity_", "");
          // Only add to extras if not already present in entity (entity values take precedence)
          if (!(field in entity)) {
            extras[field] = raw[key];
          }
        }
      });

      // Map các field được thêm bằng addSelect (không có prefix entity_ và không có underscore trong tên)
      // IMPORTANT: chỉ thêm vào extras nếu field KHÔNG có sẵn trong entity để tránh override.
      Object.keys(raw).forEach((key) => {
        if (!key.startsWith("entity_") && !key.includes("_") && raw[key] !== undefined) {
          if (!(key in entity)) {
            extras[key] = raw[key];
          }
        }
      });

      return { ...entity, ...extras };
    });
  }

  /**
   * Transform entity fields that should be strings (varchar/text/char) from raw data
   * This preserves leading zeros by getting values directly from raw query result
   */
  private transformEntityStringFieldsFromRaw(entity: any, metadata: any, raw: any, relationName?: string): void {
    if (!entity || !metadata) return;

    metadata.columns.forEach((column: any) => {
      const propertyName = column.propertyName;
      const columnType = column.type;

      // Only process varchar/text/char columns
      if (columnType === "varchar" || columnType === "text" || columnType === "char") {
        // Try to get value from raw data
        let rawValue = null;

        if (relationName) {
          // For relations, try keys like: relationName_propertyName, relationName_propertyname
          const possibleKeys = [
            `${relationName}_${propertyName}`,
            `${relationName}_${propertyName.toLowerCase()}`,
            `${relationName.toLowerCase()}_${propertyName}`,
            `${relationName.toLowerCase()}_${propertyName.toLowerCase()}`,
          ];

          for (const key of possibleKeys) {
            if (key in raw && raw[key] !== null && raw[key] !== undefined) {
              rawValue = raw[key];
              break;
            }
          }
        }

        // If we found raw value, use it (convert to string to preserve leading zeros)
        if (rawValue !== null && rawValue !== undefined) {
          entity[propertyName] = String(rawValue);
        } else if (
          // Fallback: convert existing value if it's a number
          propertyName in entity &&
          entity[propertyName] !== null &&
          entity[propertyName] !== undefined &&
          typeof entity[propertyName] === "number"
        ) {
          entity[propertyName] = String(entity[propertyName]);
        }
      }
    });
  }

  /**
   * Transform entity values to match their column type definitions
   * Fixes issues where TypeORM auto-casts values (e.g., varchar numbers to number type)
   */
  protected transformEntityTypes(entity: any): any {
    if (!entity || typeof entity !== "object") return entity;

    try {
      const repository = this.getRepository();
      const metadata = repository.metadata;

      // Transform each column based on its type
      metadata.columns.forEach((column) => {
        const propertyName = column.propertyName;
        if (propertyName in entity && entity[propertyName] !== null && entity[propertyName] !== undefined) {
          const value = entity[propertyName];
          const columnType = column.type;

          // Convert to string for varchar/text types if value is number
          if (
            (columnType === "varchar" || columnType === "text" || columnType === "char") &&
            typeof value === "number"
          ) {
            entity[propertyName] = String(value);
          }
        }
      });

      // Also transform relations recursively
      metadata.relations.forEach((relation) => {
        const relationPropertyName = relation.propertyName;
        const relationEntity = entity[relationPropertyName];

        if (relationEntity) {
          const relationMetadata = relation.inverseEntityMetadata;

          if (Array.isArray(relationEntity)) {
            // Handle array relations (OneToMany, ManyToMany)
            relationEntity.forEach((relEntity) => {
              this.transformRelationEntityTypes(relEntity, relationMetadata);
            });
          } else {
            // Handle single relations (OneToOne, ManyToOne)
            this.transformRelationEntityTypes(relationEntity, relationMetadata);
          }
        }
      });

      return entity;
    } catch (error) {
      // If transformation fails, return original entity
      logger.warn("Failed to transform entity types:", error);
      return entity;
    }
  }

  /**
   * Transform relation entity types (helper method) — đệ quy vào tất cả nested relations
   */
  private transformRelationEntityTypes(entity: any, metadata: any, depth: number = 0): void {
    if (!entity || typeof entity !== "object" || !metadata || depth > 5) return;

    try {
      // Transform columns của relation này
      metadata.columns.forEach((column: any) => {
        const propertyName = column.propertyName;
        if (propertyName in entity && entity[propertyName] !== null && entity[propertyName] !== undefined) {
          const value = entity[propertyName];
          const columnType = column.type;

          // Convert to string for varchar/text types if value is number
          if (
            (columnType === "varchar" || columnType === "text" || columnType === "char") &&
            typeof value === "number"
          ) {
            entity[propertyName] = String(value);
          }
        }
      });

      // Đệ quy vào các nested relations (ví dụ: user.employee, user.permissionGroup...)
      if (metadata.relations) {
        metadata.relations.forEach((nestedRelation: any) => {
          const nestedPropertyName = nestedRelation.propertyName;
          const nestedEntity = entity[nestedPropertyName];

          if (nestedEntity) {
            const nestedMetadata = nestedRelation.inverseEntityMetadata;
            if (Array.isArray(nestedEntity)) {
              nestedEntity.forEach((item: any) => {
                this.transformRelationEntityTypes(item, nestedMetadata, depth + 1);
              });
            } else {
              this.transformRelationEntityTypes(nestedEntity, nestedMetadata, depth + 1);
            }
          }
        });
      }
    } catch (error) {
      // Silent fail for relations
      logger.warn("Failed to transform relation entity types:", error);
    }
  }

  /**
   * Transform array of entities to match their column type definitions
   */
  protected transformEntitiesTypes(entities: any[]): any[] {
    if (!Array.isArray(entities)) return entities;
    return entities.map((entity) => this.transformEntityTypes(entity));
  }

  constructor() {
    // Initialize repository in postConstruct or through method call
    this.dataSource = DatabaseConfig;
  }

  // Method to set options after construction
  setOptions(
    selectedFields?: FindOptionsSelect<T>,
    relations?: FindOptionsRelations<T>,
    timeField?: keyof T,
    summaryFields?: (keyof T)[],
    selectedFieldsForList?: FindOptionsSelect<T>,
    relationsForList?: FindOptionsRelations<T>,
  ): void {
    if (selectedFields) {
      this.selectedFields = selectedFields;
    }
    if (relations) {
      this.relations = relations;
    }
    if (timeField) {
      this.timeField = timeField;
    }
    if (summaryFields) {
      this.summaryFields = summaryFields;
    }
    if (selectedFieldsForList) {
      this.selectedFieldsForList = selectedFieldsForList;
    }
    if (relationsForList) {
      this.relationsForList = relationsForList;
    }
  }

  public getRepository(manager?: EntityManager): Repository<T> {
    if (manager) {
      return manager.getRepository(this.entityClass);
    }
    if (!this.repository) {
      if (this.dataSource.isInitialized) {
        this.repository = this.dataSource.getRepository(this.entityClass);
      } else {
        throw new Error("Database not initialized. Please initialize database connection first.");
      }
    }
    return this.repository;
  }

  // Allow setting custom repository for testing
  public setRepository(repository: Repository<T>): void {
    this.repository = repository;
  }

  // Allow setting custom data source for testing
  public setDataSource(dataSource: DataSource): void {
    this.dataSource = dataSource;
    this.repository = dataSource.getRepository(this.entityClass);
  }

  // findOneByField
  async findOneByField(field: keyof T, value: any, manager?: EntityManager): Promise<T | null> {
    const options: FindOneOptions = { where: { [field]: value } as FindOptionsWhere<T> };
    // Only add select and relations if they are defined to avoid undefined values
    if (this.selectedFields) {
      options.select = this.selectedFields;
    }
    if (this.relations) {
      options.relations = this.relations;
    }
    const result = await this.getRepository(manager).findOne(options);
    return result ? this.transformEntityTypes(result) : null;
  }

  // check field exists
  async fieldExists(field: keyof T, value: any, manager?: EntityManager): Promise<boolean> {
    const count = await this.getRepository(manager).count({ where: { [field]: value } as FindOptionsWhere<T> });
    return count > 0;
  }

  // check field exists excluding a specific id
  async fieldExistsExcludingId(
    field: keyof T,
    value: any,
    excludeId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.getRepository(manager).count({
      where: {
        [field]: value,
        id: Not(excludeId),
      } as FindOptionsWhere<T>,
    });
    return count > 0;
  }

  // Soft delete aware methods
  async findById(
    id: number | string,
    manager?: EntityManager,
    includeDeleted: boolean = false,
    req?: Request,
  ): Promise<T | null> {
    const repository = this.getRepository(manager);
    const qb = repository.createQueryBuilder("entity");

    // Apply where condition
    qb.where("entity.id = :id", { id });

    if (!includeDeleted) {
      qb.andWhere("entity.deletedAt IS NULL");
    }

    // Select các fields cụ thể cho entity chính
    if (this.selectedFields) {
      const entityFields: string[] = [];
      Object.keys(this.selectedFields).forEach((field) => {
        const value = (this.selectedFields as any)[field];
        // Chỉ select field nếu value là true (không phải object - object là relation)
        if (value === true) {
          entityFields.push(`entity.${field}`);
        }
      });

      if (entityFields.length > 0) {
        qb.select(entityFields);
      }
    }

    // Join relations với select fields cụ thể
    if (this.relations && this.selectedFields) {
      Object.keys(this.relations).forEach((relationKey) => {
        const relationSelectFields = (this.selectedFields as any)[relationKey];

        if (relationSelectFields && typeof relationSelectFields === "object") {
          // Dùng leftJoin + addSelect để chỉ select các fields cần thiết
          qb.leftJoin(`entity.${relationKey}`, relationKey);

          // Add select cho từng field của relation
          Object.keys(relationSelectFields).forEach((relationField) => {
            if (relationSelectFields[relationField] === true) {
              qb.addSelect(`${relationKey}.${relationField}`);
            } else if (typeof relationSelectFields[relationField] === "object") {
              // Nested relation (ví dụ: orderEmployees.employee)
              const nestedRelationKey = relationField;
              const nestedRelation = relationSelectFields[relationField];

              qb.leftJoin(`${relationKey}.${nestedRelationKey}`, `${relationKey}_${nestedRelationKey}`);

              Object.keys(nestedRelation).forEach((nestedField) => {
                if (nestedRelation[nestedField] === true) {
                  qb.addSelect(`${relationKey}_${nestedRelationKey}.${nestedField}`);
                }
              });
            }
          });
        } else {
          // Fallback: load toàn bộ relation
          qb.leftJoinAndSelect(`entity.${relationKey}`, relationKey);
        }
      });
    }

    await this.extendQueryBuilder(qb, {}, req);

    // Always use getRawAndEntities to preserve string formats (like leading zeros in varchar fields)
    const rawAndEntities = await qb.getRawAndEntities();
    if (rawAndEntities.entities.length === 0) {
      return null;
    }
    const mappedResults = this.mapRawEntities(rawAndEntities);
    let result = mappedResults[0] || null;

    // Transform varchar/text/char fields (kể cả nested relations) từ number → string
    if (result) {
      result = this.transformEntityTypes(result);
    }

    if (this.enableFileAttachment && result) {
      result = await this.attachFilesToEntity(result as T, manager);
    }

    return result || null;
  }

  async findAll(manager?: EntityManager, includeDeleted: boolean = false): Promise<T[]> {
    const options: FindManyOptions<T> = {
      select: this.selectedFieldsForList || this.selectedFields,
      relations: this.relationsForList || this.relations,
    };
    if (!includeDeleted) {
      options.where = { deletedAt: IsNull() } as any;
    } else {
      options.withDeleted = true;
    }
    const results = await this.getRepository(manager).find(options);
    return this.transformEntitiesTypes(results);
  }

  async findWithPagination(
    options: IFindOptions<T>,
    manager?: EntityManager,
    includeDeleted = false,
    req?: Request,
  ): Promise<{ data: T[]; total: number; summary?: any }> {
    const page = options.page || 1;
    const size = options.size || 20;
    const selectedFields = options.select || this.selectedFieldsForList || this.selectedFields;
    const queryRelations = options.relations || this.relationsForList || this.relations;

    const repository = this.getRepository(manager);
    const qb = repository.createQueryBuilder("entity");

    // ===== Profiling (gated bằng PERF_TRACE, mặc định no-op) =====
    const perfEnabled = config.PERF_TRACE;
    const perfStart = perfEnabled ? performance.now() : 0;
    let perfLast = perfStart;
    const perf: Record<string, number> = {};
    const lap = (label: string): void => {
      if (!perfEnabled) return;
      const now = performance.now();
      perf[label] = Number((now - perfLast).toFixed(1));
      perfLast = now;
    };

    // Select các fields cụ thể cho entity chính
    if (selectedFields) {
      const entityFields: string[] = [];
      Object.keys(selectedFields).forEach((field) => {
        const value = (selectedFields as any)[field];
        // Chỉ select field nếu value là true (không phải object - object là relation)
        if (value === true) {
          entityFields.push(`entity.${field}`);
        }
      });

      // Ensure sortBy field is included in select (required for DISTINCT queries with ORDER BY)
      if (options.sortBy && !options.sortBy.includes(".")) {
        const sortField = `entity.${options.sortBy}`;
        if (!entityFields.includes(sortField)) {
          entityFields.push(sortField);
        }
      }

      if (entityFields.length > 0) {
        qb.select(entityFields);
      }
    }

    // Join relations nếu có
    const joinedRelations: string[] = []; // Track relations that are actually joined
    if (queryRelations) {
      const processRelations = (relations: any, selectFields: any, parentAlias: string = "entity") => {
        Object.keys(relations).forEach((relationKey) => {
          const relationValue = relations[relationKey];
          const currentAlias = parentAlias === "entity" ? relationKey : `${parentAlias}_${relationKey}`;
          const joinPath = `${parentAlias}.${relationKey}`;

          // Kiểm tra xem có select fields cho relation này không
          const relationSelectFields = selectFields?.[relationKey];

          //? chỉ lấy những relation được chứa trong field kết thúc bằng Id
          let includeRelation = false;
          Object.keys(selectFields || {}).forEach((field) => {
            if (String(field).startsWith(relationKey) && String(field).endsWith("Id")) {
              includeRelation = true;
            }
          });

          // Kiểm tra: nếu relationSelectFields là undefined hoặc không phải object hợp lệ,
          // nhưng includeRelation = true → nên join toàn bộ relation
          if (relationSelectFields && typeof relationSelectFields === "object") {
            // Dùng leftJoin + addSelect để chỉ select các fields được khai báo trong selectedFields
            qb.leftJoin(joinPath, currentAlias);

            Object.keys(relationSelectFields).forEach((field) => {
              const fieldValue = (relationSelectFields as any)[field];
              if (fieldValue === true) {
                qb.addSelect(`${currentAlias}.${field}`);
              }
            });

            // Track that this relation is joined
            if (parentAlias === "entity") {
              joinedRelations.push(relationKey);
            }

            // Xử lý nested relations
            if (typeof relationValue === "object" && relationValue !== null) {
              processRelations(relationValue, relationSelectFields, currentAlias);
            }
          } else if (includeRelation) {
            // Nếu không có select fields cụ thể nhưng relation được yêu cầu
            // → join toàn bộ relation
            qb.leftJoinAndSelect(joinPath, currentAlias);

            // Track that this relation is joined
            if (parentAlias === "entity") {
              joinedRelations.push(relationKey);
            }
          }
        });
      };

      processRelations(queryRelations, selectedFields);
    }

    // Apply where conditions
    if (options.where) {
      const whereConditions = options.where;
      if (Array.isArray(whereConditions)) {
        // Handle OR conditions
        qb.where(
          new Brackets((subQb) => {
            whereConditions.forEach((condition, index) => {
              const method = index === 0 ? "where" : "orWhere";
              subQb[method](condition as any);
            });
          }),
        );
      } else {
        qb.where(whereConditions);
      }
    }

    if (options.keyword) {
      let textSearchableFields: string[] = [];
      if (options.searchFields && options.searchFields.length > 0) {
        // Nếu có searchFields, chỉ dùng đúng các trường này
        textSearchableFields = options.searchFields.map((field) => {
          const fieldStr = String(field);
          return fieldStr.includes(".") ? fieldStr : `entity.${fieldStr}`;
        });
      } else {
        // Nếu không có searchFields, auto-detect các trường text trực tiếp từ TypeORM metadata
        const autoDetectedFields = repository.metadata.columns
          .filter((column) => {
            const columnType = typeof column.type === "string" ? column.type : "";
            return (
              columnType === "string" || columnType === "text" || columnType === "varchar" || columnType === "char"
            );
          })
          .map((column) => `entity.${column.propertyName}`);
        textSearchableFields = [...autoDetectedFields];
        // Only add relation fields that are actually joined and have searchable text fields
        if (queryRelations && joinedRelations.length > 0) {
          joinedRelations.forEach((relationKey) => {
            // Get the relation metadata to check what fields exist
            const relation = repository.metadata.relations.find((rel) => rel.propertyName === relationKey);
            if (relation) {
              // Check for common searchable text fields in the relation
              const searchableFields = ["name", "code", "note"];
              searchableFields.forEach((field) => {
                const hasField = relation.inverseEntityMetadata.columns.find(
                  (col) =>
                    col.propertyName === field &&
                    (col.type === "varchar" || col.type === "text" || col.type === "string" || col.type === "char"),
                );
                if (hasField) {
                  textSearchableFields.push(`${relationKey}.${field}`);
                }
              });
            }
          });
        }
      }

      if (textSearchableFields.length > 0) {
        qb.andWhere(
          new Brackets((qb1) => {
            textSearchableFields.forEach((field, idx) => {
              // Get column metadata to check type
              const fieldName = field.split(".").pop() || field;
              const alias = field.includes(".") ? field.split(".")[0] : "entity";

              let columnMetadata;
              if (alias === "entity") {
                columnMetadata = repository.metadata.columns.find((col) => col.propertyName === fieldName);
              } else {
                // For relations, find the relation metadata
                const relation = repository.metadata.relations.find((rel) => rel.propertyName === alias);
                if (relation) {
                  columnMetadata = relation.inverseEntityMetadata.columns.find((col) => col.propertyName === fieldName);
                }
              }

              // Cast UUID to text before applying LOWER() and quote the field to preserve case
              let fieldExpression = field;
              const parts = field.split(".");

              if (columnMetadata?.type === "uuid") {
                if (parts.length === 2) {
                  // Quote both alias and column name to preserve case sensitivity
                  fieldExpression = `"${parts[0]}"."${parts[1]}"::text`;
                } else {
                  fieldExpression = `"${field}"::text`;
                }
              } else {
                // Always quote field parts to preserve case sensitivity (e.g., orderEmployees.name -> "orderEmployees"."name")
                if (parts.length === 2) {
                  fieldExpression = `"${parts[0]}"."${parts[1]}"`;
                } else {
                  fieldExpression = `"${field}"`;
                }
              }
              const condition = `unaccent(LOWER(${fieldExpression})) ILIKE unaccent(LOWER(:keyword))`;

              if (idx === 0) qb1.where(condition, { keyword: `%${options.keyword}%` });
              else qb1.orWhere(condition, { keyword: `%${options.keyword}%` });
            });
          }),
        );
      }
    }

    lap("buildQb");
    await this.extendQueryBuilder(qb, options, req!);
    lap("extendQueryBuilder");

    // ===== Filters =====

    // nếu trong options có tenantId thì và entity có tenantId thì filter theo tenantId
    if (options.tenantId) {
      const entityMetadata = repository.metadata;
      const hasTenantIdColumn = entityMetadata.columns.some((col) => col.propertyName === "tenantId");
      if (hasTenantIdColumn) {
        qb.andWhere("entity.tenantId = :tenantId", {
          tenantId: options.tenantId,
        });
      }
    }

    if (includeDeleted) {
      qb.andWhere("entity.deletedAt IS NOT NULL");
    } else {
      qb.andWhere("entity.deletedAt IS NULL");
    }

    if (
      options.status !== undefined &&
      Object.keys(selectedFields || {}).length > 0 &&
      "status" in (selectedFields as any)
    ) {
      qb.andWhere("entity.status = :status", { status: options.status });
    }

    if (
      options.type !== undefined &&
      Object.keys(selectedFields || {}).length > 0 &&
      "type" in (selectedFields as any)
    ) {
      qb.andWhere("entity.type = :type", { type: options.type });
    }

    if (
      options.isFinished !== undefined &&
      Object.keys(selectedFields || {}).length > 0 &&
      "isFinished" in (selectedFields as any)
    ) {
      qb.andWhere("entity.isFinished = :isFinished", {
        isFinished: options.isFinished,
      });
    }

    if (repository.metadata.name === "User") {
      qb.andWhere("entity.username != :adminUsername", {
        adminUsername: "admin",
      });
    }

    // BETWEEN createdAt
    if (options.startAt && options.endAt) {
      if (this.timeField !== undefined) {
        qb.andWhere(`entity.${String(this.timeField)} BETWEEN :start AND :end`, {
          start: new Date(options.startAt),
          end: new Date(options.endAt),
        });
      } else {
        qb.andWhere(`entity.createdAt BETWEEN :start AND :end`, {
          start: new Date(options.startAt),
          end: new Date(options.endAt),
        });
      }
    }

    // ===== Sorting =====
    if (options.sortBy && options.sortOrder) {
      const sortField = options.sortBy.includes(".") ? options.sortBy : `entity.${options.sortBy}`;
      qb.orderBy(sortField, options.sortOrder.toUpperCase() as "ASC" | "DESC");
    }

    // Tạo clone query cho summary (không có pagination)
    let summary: any = {};
    if (options.summaryFields && options.summaryFields.length > 0) {
      const summaryQb = qb.clone();

      // Xóa skip và take khỏi summary query
      summaryQb.skip(0).take(undefined as any);

      // Xóa order by để tối ưu performance
      (summaryQb as any).expressionMap.orderBys = [];

      // TẠM THỜI COMMENT dòng này để test
      // (summaryQb as any).expressionMap.joinAttributes = [];

      // Select sum cho các field cần tính tổng
      const sumSelects = options.summaryFields.map(
        (field) => `COALESCE(SUM(entity.${String(field)}), 0) as ${String(field)}_sum`,
      );

      summaryQb.select(sumSelects);

      const summaryResult = await summaryQb.getRawOne();

      // Map kết quả summary - xử lý lowercase keys
      options.summaryFields.forEach((field) => {
        const fieldStr = String(field);
        // PostgreSQL trả về lowercase key
        const summaryKey = `${fieldStr.toLowerCase()}_sum`;
        const value = summaryResult[summaryKey];

        summary[`total${fieldStr.charAt(0).toUpperCase() + fieldStr.slice(1)}`] = parseFloat(value) || 0;
      });
    }

    await this.extendSummaryFields(summary, qb.clone(), options, req);
    lap("summary");

    qb.skip((page - 1) * size).take(size);

    // In SQL của query data chính để copy chạy EXPLAIN ANALYZE thủ công.
    if (perfEnabled) {
      logger.info(`[perf][sql] entity=${repository.metadata.name} | ${qb.getSql()}`);
    }

    // ===== Execute ===== //
    // Always use getRawAndEntities to preserve string formats (like leading zeros in varchar fields)
    const dataPromise = (async () => {
      const t = perfEnabled ? performance.now() : 0;
      const res = await qb.getRawAndEntities();
      if (perfEnabled) perf["exec.data"] = Number((performance.now() - t).toFixed(1));
      return res;
    })();
    const countPromise = (async () => {
      const t = perfEnabled ? performance.now() : 0;
      const res = await qb.getCount();
      if (perfEnabled) perf["exec.count"] = Number((performance.now() - t).toFixed(1));
      return res;
    })();
    const [rawAndEntities, total] = await Promise.all([dataPromise, countPromise]);
    lap("mainExec");
    let data = this.mapRawEntities(rawAndEntities);

    // Always apply type transformation to ensure varchar/text/char fields are strings
    // This is safe even with GROUP BY or extra selects as it only converts number to string for text columns
    data = this.transformEntitiesTypes(data);

    if (this.enableFileAttachment && Array.isArray(data)) {
      data = await this.attachFilesToEntities(data as T[], manager);
    }
    lap("attachFiles");

    if (perfEnabled) {
      const totalMs = Number((performance.now() - perfStart).toFixed(1));
      logger.info(
        `[perf][findWithPagination] entity=${repository.metadata.name} total=${totalMs}ms ` +
          `rows=${rawAndEntities.entities.length} count=${total} breakdown=${JSON.stringify(perf)}`,
      );
    }

    return {
      data,
      total,
      summary: Object.keys(summary).length > 0 ? summary : undefined,
    };
  }

  async sumByOptions(
    sumField: keyof T,
    options: IFindOptions<T>,
    manager?: EntityManager,
    includeDeleted = false,
    req?: Request,
  ): Promise<number> {
    const selectedFields = options.select || this.selectedFieldsForList || this.selectedFields;
    const queryRelations = options.relations || this.relationsForList || this.relations;

    const repository = this.getRepository(manager);
    const qb = repository.createQueryBuilder("entity");

    // Select các fields cụ thể cho entity chính
    if (selectedFields) {
      const entityFields: string[] = [];
      Object.keys(selectedFields).forEach((field) => {
        const value = (selectedFields as any)[field];
        // Chỉ select field nếu value là true (không phải object - object là relation)
        if (value === true) {
          entityFields.push(`entity.${field}`);
        }
      });

      if (entityFields.length > 0) {
        qb.select(entityFields);
      }
    }

    // Join relations nếu có
    const joinedRelations: string[] = []; // Track relations that are actually joined
    if (queryRelations) {
      const processRelations = (relations: any, selectFields: any, parentAlias: string = "entity") => {
        Object.keys(relations).forEach((relationKey) => {
          const relationValue = relations[relationKey];
          const currentAlias = parentAlias === "entity" ? relationKey : `${parentAlias}_${relationKey}`;
          const joinPath = `${parentAlias}.${relationKey}`;

          // Kiểm tra xem có select fields cho relation này không
          const relationSelectFields = selectFields?.[relationKey];

          //? chỉ lấy những relation được chứa trong field kết thúc bằng Id
          let includeRelation = false;
          Object.keys(selectFields || {}).forEach((field) => {
            if (String(field).startsWith(relationKey) && String(field).endsWith("Id")) {
              includeRelation = true;
            }
          });

          // Kiểm tra: nếu relationSelectFields là undefined hoặc không phải object hợp lệ,
          // nhưng includeRelation = true → nên join toàn bộ relation
          if (relationSelectFields && typeof relationSelectFields === "object" && includeRelation) {
            // Dùng leftJoin + addSelect để chỉ select các fields cần thiết
            qb.leftJoin(joinPath, currentAlias);

            // Track that this relation is joined
            if (parentAlias === "entity") {
              joinedRelations.push(relationKey);
            }

            // Add select cho từng field của relation
            Object.keys(relationSelectFields).forEach((relationField) => {
              const fieldValue = relationSelectFields[relationField];
              if (fieldValue === true) {
                qb.addSelect(`${currentAlias}.${relationField}`);
              } else if (typeof fieldValue === "object") {
                // Nested relation: xử lý sau
              }
            });

            // Xử lý nested relations
            if (typeof relationValue === "object" && relationValue !== null) {
              processRelations(relationValue, relationSelectFields, currentAlias);
            }
          } else if (includeRelation) {
            // Nếu không có select fields cụ thể nhưng relation được yêu cầu
            // → join toàn bộ relation
            qb.leftJoinAndSelect(joinPath, currentAlias);

            // Track that this relation is joined
            if (parentAlias === "entity") {
              joinedRelations.push(relationKey);
            }
          }
        });
      };

      processRelations(queryRelations, selectedFields);
    }

    if (options.keyword) {
      let textSearchableFields: string[] = [];
      if (options.searchFields && options.searchFields.length > 0) {
        // Nếu có searchFields, chỉ dùng đúng các trường này
        textSearchableFields = options.searchFields.map((field) => {
          const fieldStr = String(field);
          return fieldStr.includes(".") ? fieldStr : `entity.${fieldStr}`;
        });
      } else {
        // Nếu không có searchFields, auto-detect các trường text trực tiếp từ TypeORM metadata
        const autoDetectedFields = repository.metadata.columns
          .filter((column) => {
            const columnType = typeof column.type === "string" ? column.type : "";
            return (
              columnType === "string" || columnType === "text" || columnType === "varchar" || columnType === "char"
            );
          })
          .map((column) => `entity.${column.propertyName}`);
        textSearchableFields = [...autoDetectedFields];
        // Only add relation fields that are actually joined and have searchable text fields
        if (queryRelations && joinedRelations.length > 0) {
          joinedRelations.forEach((relationKey) => {
            // Get the relation metadata to check what fields exist
            const relation = repository.metadata.relations.find((rel) => rel.propertyName === relationKey);
            if (relation) {
              // Check for common searchable text fields in the relation
              const searchableFields = ["name", "code", "note"];
              searchableFields.forEach((field) => {
                const hasField = relation.inverseEntityMetadata.columns.find(
                  (col) =>
                    col.propertyName === field &&
                    (col.type === "varchar" || col.type === "text" || col.type === "string" || col.type === "char"),
                );
                if (hasField) {
                  textSearchableFields.push(`${relationKey}.${field}`);
                }
              });
            }
          });
        }
      }

      if (textSearchableFields.length > 0) {
        qb.andWhere(
          new Brackets((qb1) => {
            textSearchableFields.forEach((field, idx) => {
              // Get column metadata to check type
              const fieldName = field.split(".").pop() || field;
              const alias = field.includes(".") ? field.split(".")[0] : "entity";

              let columnMetadata;
              if (alias === "entity") {
                columnMetadata = repository.metadata.columns.find((col) => col.propertyName === fieldName);
              } else {
                // For relations, find the relation metadata
                const relation = repository.metadata.relations.find((rel) => rel.propertyName === alias);
                if (relation) {
                  columnMetadata = relation.inverseEntityMetadata.columns.find((col) => col.propertyName === fieldName);
                }
              }

              // Cast UUID to text before applying LOWER() and quote the field to preserve case
              let fieldExpression = field;
              const parts = field.split(".");

              if (columnMetadata?.type === "uuid") {
                if (parts.length === 2) {
                  // Quote both alias and column name to preserve case sensitivity
                  fieldExpression = `"${parts[0]}"."${parts[1]}"::text`;
                } else {
                  fieldExpression = `"${field}"::text`;
                }
              } else {
                // Always quote field parts to preserve case sensitivity (e.g., orderEmployees.name -> "orderEmployees"."name")
                if (parts.length === 2) {
                  fieldExpression = `"${parts[0]}"."${parts[1]}"`;
                } else {
                  fieldExpression = `"${field}"`;
                }
              }
              const condition = `unaccent(LOWER(${fieldExpression})) ILIKE unaccent(LOWER(:keyword))`;

              if (idx === 0) qb1.where(condition, { keyword: `%${options.keyword}%` });
              else qb1.orWhere(condition, { keyword: `%${options.keyword}%` });
            });
          }),
        );
      }
    }

    await this.extendQueryBuilder(qb, options, req!);

    // ===== Filters =====

    // Apply where conditions
    if (options.where) {
      const whereConditions = options.where;
      if (Array.isArray(whereConditions)) {
        // Handle OR conditions
        qb.where(
          new Brackets((subQb) => {
            whereConditions.forEach((condition, index) => {
              const method = index === 0 ? "where" : "orWhere";
              subQb[method](condition as any);
            });
          }),
        );
      } else {
        qb.where(whereConditions);
      }
    }

    // nếu trong options có tenantId thì và entity có tenantId thì filter theo tenantId
    if (options.tenantId) {
      const entityMetadata = repository.metadata;
      const hasTenantIdColumn = entityMetadata.columns.some((col) => col.propertyName === "tenantId");
      if (hasTenantIdColumn) {
        qb.andWhere("entity.tenantId = :tenantId", {
          tenantId: options.tenantId,
        });
      }
    }

    if (includeDeleted) {
      qb.andWhere("entity.deletedAt IS NOT NULL");
    } else {
      qb.andWhere("entity.deletedAt IS NULL");
    }

    if (options.status !== undefined) {
      qb.andWhere("entity.status = :status", { status: options.status });
    }

    if (options.type !== undefined) {
      qb.andWhere("entity.type = :type", { type: options.type });
    }

    if (options.isFinished !== undefined) {
      qb.andWhere("entity.isFinished = :isFinished", {
        isFinished: options.isFinished,
      });
    }

    if (repository.metadata.name === "User") {
      qb.andWhere("entity.username != :adminUsername", {
        adminUsername: "admin",
      });
    }

    // BETWEEN createdAt
    if (options.startAt && options.endAt) {
      const dateField = options.dateFilter || "createdAt";
      qb.andWhere(`entity.${dateField} BETWEEN :start AND :end`, {
        start: new Date(options.startAt),
        end: new Date(options.endAt),
      });
    }

    // ===== Sorting =====
    if (options.sortBy && options.sortOrder) {
      const sortField = options.sortBy.includes(".") ? options.sortBy : `entity.${options.sortBy}`;
      qb.orderBy(sortField, options.sortOrder.toUpperCase() as "ASC" | "DESC");
    }

    // Clear selects, orderBys, and groupBys before doing SUM to avoid PostgreSQL GROUP BY errors
    (qb as any).expressionMap.selects = [];
    (qb as any).expressionMap.orderBys = [];
    (qb as any).expressionMap.groupBys = [];

    // Always use getRawAndEntities to preserve string formats (like leading zeros in varchar fields)
    const sum = await qb.select(`SUM(entity.${String(sumField)})`, "sum").getRawOne();
    const count = parseFloat(sum.sum) || 0;

    return count;
  }

  async findByOptions(
    options: FindManyOptions<T>,
    manager?: EntityManager,
    includeDeleted: boolean = false,
    req?: Request,
  ): Promise<T[]> {
    const repository = this.getRepository(manager);
    const qb = repository.createQueryBuilder("entity");

    // Select các fields cụ thể cho entity chính
    const selectedFields = options.select;
    if (selectedFields) {
      const entityFields: string[] = [];
      Object.keys(selectedFields).forEach((field) => {
        const value = (selectedFields as any)[field];
        if (value === true) {
          entityFields.push(`entity.${field}`);
        }
      });

      if (entityFields.length > 0) {
        qb.select(entityFields);
      }
    }

    // Join relations với select fields cụ thể.
    // PHẢI join trước where: nếu where có điều kiện lồng theo relation (vd: { order: { branchId } }),
    // TypeORM parse ngay tại qb.where và cần alias relation đã tồn tại.
    const relations = options.relations;
    if (relations && selectedFields) {
      Object.keys(relations).forEach((relationKey) => {
        const relationSelectFields = (selectedFields as any)[relationKey];

        if (relationSelectFields && typeof relationSelectFields === "object") {
          qb.leftJoin(`entity.${relationKey}`, relationKey);

          Object.keys(relationSelectFields).forEach((relationField) => {
            if (relationSelectFields[relationField] === true) {
              qb.addSelect(`${relationKey}.${relationField}`);
            } else if (typeof relationSelectFields[relationField] === "object") {
              const nestedRelationKey = relationField;
              const nestedRelation = relationSelectFields[relationField];

              qb.leftJoin(`${relationKey}.${nestedRelationKey}`, `${relationKey}_${nestedRelationKey}`);

              Object.keys(nestedRelation).forEach((nestedField) => {
                if (nestedRelation[nestedField] === true) {
                  qb.addSelect(`${relationKey}_${nestedRelationKey}.${nestedField}`);
                }
              });
            }
          });
        } else {
          qb.leftJoinAndSelect(`entity.${relationKey}`, relationKey);
        }
      });
    }

    // Apply where conditions (sau join để relation alias đã tồn tại)
    if (options.where) {
      const whereConditions = options.where;
      if (Array.isArray(whereConditions)) {
        // Handle OR conditions
        qb.where(
          new Brackets((subQb) => {
            whereConditions.forEach((condition, index) => {
              const method = index === 0 ? "where" : "orWhere";
              subQb[method](condition as any);
            });
          }),
        );
      } else {
        qb.where(whereConditions);
      }
    }

    // Apply soft delete filter
    if (!includeDeleted) {
      qb.andWhere("entity.deletedAt IS NULL");
    }

    // Apply order if specified
    if (options.order) {
      Object.entries(options.order).forEach(([field, direction]) => {
        const orderField = field.includes(".") ? field : `entity.${field}`;
        qb.addOrderBy(orderField, direction as "ASC" | "DESC");
      });
    }

    // Apply skip and take for pagination
    if (options.skip !== undefined) {
      qb.skip(options.skip);
    }
    if (options.take !== undefined) {
      qb.take(options.take);
    }

    // Call extendQueryBuilder hook
    // await this.extendQueryBuilder(qb, {}, req);

    // Execute query
    const rawAndEntities = await qb.getRawAndEntities();
    const mappedResults = this.mapRawEntities(rawAndEntities);
    let results = this.transformEntitiesTypes(mappedResults);

    // Attach files if enabled
    if (this.enableFileAttachment && Array.isArray(results)) {
      results = await this.attachFilesToEntities(results as T[], manager);
    }

    return results as T[];
  }

  async findByOption(
    options: FindOneOptions<T>,
    manager?: EntityManager,
    includeDeleted: boolean = false,
    req?: Request,
  ): Promise<T | null> {
    const repository = this.getRepository(manager);
    const qb = repository.createQueryBuilder("entity");

    // Select các fields cụ thể cho entity chính
    const selectedFields = options.select;
    if (selectedFields) {
      const entityFields: string[] = [];
      Object.keys(selectedFields).forEach((field) => {
        const value = (selectedFields as any)[field];
        if (value === true) {
          entityFields.push(`entity.${field}`);
        }
      });

      // Ensure order fields are included in select (required for DISTINCT queries with ORDER BY)
      if (options.order) {
        Object.keys(options.order).forEach((field) => {
          if (!field.includes(".")) {
            const orderField = `entity.${field}`;
            if (!entityFields.includes(orderField)) {
              entityFields.push(orderField);
            }
          }
        });
      }

      if (entityFields.length > 0) {
        qb.select(entityFields);
      }
    }

    // Join relations với select fields cụ thể
    // QUAN TRỌNG: phải join TRƯỚC khi apply `where`.
    // `qb.where({ relation: { field } })` cần alias của relation đã tồn tại trong query builder;
    // nếu join sau `where` thì TypeORM ném lỗi: "Cannot find alias for relation at <relation>".
    const relations = options.relations;
    if (relations && selectedFields) {
      Object.keys(relations).forEach((relationKey) => {
        const relationSelectFields = (selectedFields as any)[relationKey];

        if (relationSelectFields && typeof relationSelectFields === "object") {
          qb.leftJoin(`entity.${relationKey}`, relationKey);

          Object.keys(relationSelectFields).forEach((relationField) => {
            if (relationSelectFields[relationField] === true) {
              qb.addSelect(`${relationKey}.${relationField}`);
            } else if (typeof relationSelectFields[relationField] === "object") {
              const nestedRelationKey = relationField;
              const nestedRelation = relationSelectFields[relationField];

              qb.leftJoin(`${relationKey}.${nestedRelationKey}`, `${relationKey}_${nestedRelationKey}`);

              Object.keys(nestedRelation).forEach((nestedField) => {
                if (nestedRelation[nestedField] === true) {
                  qb.addSelect(`${relationKey}_${nestedRelationKey}.${nestedField}`);
                }
              });
            }
          });
        } else {
          qb.leftJoinAndSelect(`entity.${relationKey}`, relationKey);
        }
      });
    }

    // Apply where conditions
    if (options.where) {
      const whereConditions = options.where;
      if (Array.isArray(whereConditions)) {
        // Handle OR conditions
        qb.where(
          new Brackets((subQb) => {
            whereConditions.forEach((condition, index) => {
              const method = index === 0 ? "where" : "orWhere";
              subQb[method](condition as any);
            });
          }),
        );
      } else {
        qb.where(whereConditions);
      }
    }

    // Apply soft delete filter
    if (!includeDeleted) {
      qb.andWhere("entity.deletedAt IS NULL");
    }

    // Apply order if specified
    if (options.order) {
      Object.entries(options.order).forEach(([field, direction]) => {
        const orderField = field.includes(".") ? field : `entity.${field}`;
        qb.addOrderBy(orderField, direction as "ASC" | "DESC");
      });
    }

    // Execute query
    const rawAndEntities = await qb.getRawAndEntities();
    if (rawAndEntities.entities.length === 0) {
      return null;
    }

    const mappedResults = this.mapRawEntities(rawAndEntities);
    let result = mappedResults[0] || null;

    // Transform varchar/text/char fields (kể cả nested relations) từ number → string
    if (result) {
      result = this.transformEntityTypes(result);
    }

    // Attach files if enabled
    if (result && this.enableFileAttachment) {
      result = await this.attachFilesToEntity(result as any, manager);
    }

    return result;
  }

  async findAndCount(
    options: FindManyOptions<T>,
    manager?: EntityManager,
    includeDeleted: boolean = false,
  ): Promise<[T[], number]> {
    if (!includeDeleted) {
      // Handle array-based where clause (OR conditions)
      if (Array.isArray(options.where)) {
        options.where = options.where.map((condition) => ({
          ...condition,
          deletedAt: IsNull(),
        })) as any;
      } else {
        options.where = { ...options.where, deletedAt: IsNull() } as any;
      }
    } else {
      options.withDeleted = true;
    }
    const [data, total] = await this.getRepository(manager).findAndCount(options);
    return [this.transformEntitiesTypes(data), total];
  }

  async create(entityData: DeepPartial<T>, manager?: EntityManager, _genCode: boolean = false): Promise<T> {
    const repository = this.getRepository(manager);
    const entity = repository.create(entityData);

    const saved = await repository.save(entity);

    const tempId = (saved as any).tempId;
    const id = (saved as any).id;
    if (tempId && id) {
      await this.handleFilesOnCreate(id, tempId, saved, manager);
    }

    return saved;
  }

  /**
   * Update
   */
  async update(id: string, data: Partial<T>, manager?: EntityManager, req?: Request): Promise<T | null> {
    const repo = this.getRepository(manager);
    await repo.update(id, data as any);

    // Get updated entity để xử lý nested files
    const updatedEntity = await repo.findOne({
      where: { id } as any,
      relations: this.relations,
    });

    // Handle files after update: activate all files
    await this.handleFilesOnUpdate(id, manager, updatedEntity);

    if (manager) {
      if (updatedEntity && this.enableFileAttachment) {
        await this.attachFilesToEntity(updatedEntity as any, manager);
      }
      return updatedEntity || null;
    }

    return this.findByOption(
      {
        where: { id } as any,
        relations: this.relations,
        select: this.selectedFields,
      },
      manager,
      false,
      req,
    );
  }

  // update options for many records
  async updateOptions(
    options: Partial<T>,
    where: FindOptionsWhere<T>,
    manager?: EntityManager,
    req?: Request,
  ): Promise<T[]> {
    const repository = this.getRepository(manager);
    const entities = await repository.find({ where });

    if (entities.length === 0) {
      throw new NotFoundError("No entities found with provided options");
    }

    // Loại bỏ id và isDeleted để tránh ghi đè
    const { id: _, isDeleted, ...safeOptions } = options as any;
    entities.forEach((entity) => Object.assign(entity, safeOptions));
    return await repository.save(entities);
  }

  // Hard delete - permanently removes from database
  async delete(id: string, manager?: EntityManager, req?: Request): Promise<boolean> {
    // Load entity - không specify relations để eager loading tự động hoạt động
    const entity = await this.getRepository(manager).findOne({
      where: { id } as any,
    });

    if (!entity) {
      return false;
    }

    await this.handleFilesOnDelete(id, manager);

    // Dùng remove() thay vì delete() để trigger cascade
    await this.getRepository(manager).remove(entity);
    return true;
  }

  // Soft delete - sets deleted_at timestamp
  async softDelete(id: string, manager?: EntityManager, req?: Request): Promise<boolean> {
    const item = await this.findById(id, manager, true, req);
    if (!item) {
      throw new NotFoundError("Entity not found");
    }
    const result = await this.getRepository(manager).softRemove(item);
    return !!result;
  }

  // Restore soft deleted entity
  async restore(id: string, manager?: EntityManager, req?: Request): Promise<boolean> {
    const result = await this.getRepository(manager).restore(id);
    return result.affected! > 0;
  }

  // Find soft deleted entities only
  async findDeleted(manager?: EntityManager): Promise<T[]> {
    return await this.getRepository(manager).find({
      where: { deletedAt: Not(IsNull()) } as any,
      withDeleted: true,
    });
  }

  // Find entity including soft deleted
  async findByIdWithDeleted(id: number | string, manager?: EntityManager): Promise<T | null> {
    const result = await this.getRepository(manager).findOne({
      where: { id } as any,
      withDeleted: true,
    });
    return result ? this.transformEntityTypes(result) : null;
  }

  async findOne(
    options: FindOptionsWhere<T>,
    manager?: EntityManager,
    includeDeleted: boolean = false,
  ): Promise<T | null> {
    const findOptions: any = { where: options };
    if (!includeDeleted) {
      findOptions.where = { ...options, deletedAt: IsNull() };
    }
    const result = await this.getRepository(manager).findOne(findOptions);
    return result ? this.transformEntityTypes(result) : null;
  }

  async exists(
    options: FindOptionsWhere<T>,
    manager?: EntityManager,
    includeDeleted: boolean = false,
  ): Promise<boolean> {
    const whereOptions = includeDeleted ? options : ({ ...options, deletedAt: IsNull() } as any);
    const count = await this.getRepository(manager).count({ where: whereOptions });
    return count > 0;
  }

  // Batch operations with transaction
  async createMany(entitiesData: DeepPartial<T>[], manager?: EntityManager): Promise<T[]> {
    const repository = this.getRepository(manager);
    const entities = repository.create(entitiesData as DeepPartial<T>[]);
    return await repository.save(entities);
  }

  async updateMany(ids: string[], entityData: Partial<T>, manager?: EntityManager): Promise<T[]> {
    const repository = this.getRepository(manager);
    const entities = await repository.findBy({
      id: In(ids) as any,
    });

    if (entities.length === 0) {
      throw new NotFoundError("No entities found with provided IDs");
    }

    // Loại bỏ id và isDeleted để tránh ghi đè
    const { id: _, isDeleted, ...safeData } = entityData as any;
    entities.forEach((entity) => Object.assign(entity, safeData));
    return await repository.save(entities);
  }

  async updateManyWithData(ids: string[], entitiesData: Partial<T>[], manager?: EntityManager): Promise<T[]> {
    if (ids.length !== entitiesData.length) {
      throw new Error("IDs and entitiesData arrays must have the same length");
    }

    const repository = this.getRepository(manager);
    const entities = await repository.findBy({
      id: In(ids as any[]),
    } as FindOptionsWhere<T>);

    if (entities.length === 0) {
      throw new NotFoundError("No entities found with provided IDs");
    }

    // Tạo map để match đúng entity với id
    const entityMap = new Map(entities.map((entity) => [entity.id, entity]));

    const updatedEntities: T[] = [];
    ids.forEach((id, index) => {
      const entity = entityMap.get(id);
      if (entity) {
        // Loại bỏ id và isDeleted khỏi data để tránh ghi đè
        const { id: _, isDeleted, ...dataToAssign } = entitiesData[index] as any;
        Object.assign(entity, dataToAssign);
        updatedEntities.push(entity);
      }
    });

    return await repository.save(updatedEntities);
  }

  async deleteMany(ids: (number | string)[], manager?: EntityManager): Promise<number> {
    // Load tất cả entities - không specify relations để eager loading tự động hoạt động
    const entities = await this.getRepository(manager).find({
      where: { id: In(ids) } as any,
    });

    if (entities.length === 0) {
      return 0;
    }

    // Dùng remove() thay vì delete() để trigger cascade
    await this.getRepository(manager).remove(entities);
    return entities.length;
  }

  // Check if entity is soft deleted
  async isDeleted(id: number | string, manager?: EntityManager): Promise<boolean> {
    const entity = await this.getRepository(manager).findOne({
      where: { id } as any,
      withDeleted: true,
    });
    return entity ? entity.isDeleted : false;
  }

  // Batch soft delete operations
  async softDeleteMany(ids: (number | string)[], manager?: EntityManager): Promise<number> {
    const result = await this.getRepository(manager).softDelete(ids as any[]);
    return result.affected || 0;
  }

  // Delete with option
  async deleteWithOption(
    options: FindOptionsWhere<T>,
    manager?: EntityManager,
    includeDeleted: boolean = false,
  ): Promise<number> {
    const whereOptions = includeDeleted ? options : ({ ...options, deletedAt: IsNull() } as any);

    // Load tất cả entities thỏa điều kiện - không specify relations để eager loading tự động hoạt động
    const entities = await this.getRepository(manager).find({
      where: whereOptions,
    });

    if (entities.length === 0) {
      return 0;
    }

    // Dùng remove() thay vì delete() để trigger cascade
    await this.getRepository(manager).remove(entities);
    return entities.length;
  }

  async restoreMany(ids: (number | string)[], manager?: EntityManager): Promise<number> {
    const result = await this.getRepository(manager).restore(ids as any[]);
    return result.affected || 0;
  }

  async count(where?: FindOptionsWhere<T>, manager?: EntityManager, includeDeleted: boolean = false): Promise<number> {
    const whereOptions = includeDeleted ? where : ({ ...where, deletedAt: IsNull() } as any);
    return await this.getRepository(manager).count({
      where: whereOptions,
      ...(includeDeleted && { withDeleted: true }),
    });
  }

  // count unique values in a field
  async countDistinct(
    field: keyof T,
    where?: FindOptionsWhere<T>,
    manager?: EntityManager,
    includeDeleted: boolean = false,
  ): Promise<number> {
    const repository = this.getRepository(manager);
    const queryBuilder = repository.createQueryBuilder("entity");

    if (includeDeleted) {
      queryBuilder.withDeleted();
    } else {
      queryBuilder.where("entity.deletedAt IS NULL");
    }

    if (where) {
      queryBuilder.andWhere(where);
    }

    return await queryBuilder
      .select(`COUNT(DISTINCT entity.${field as string})`, "count")
      .getRawOne()
      .then((result) => Number(result.count) || 0);
  }

  async sum(
    field: keyof T,
    where?: FindOptionsWhere<T>,
    manager?: EntityManager,
    includeDeleted: boolean = false,
  ): Promise<number> {
    const repository = this.getRepository(manager);
    const queryBuilder = repository.createQueryBuilder("entity");

    if (includeDeleted) {
      queryBuilder.withDeleted();
    } else {
      queryBuilder.where("entity.deletedAt IS NULL");
    }

    if (where) {
      queryBuilder.andWhere(where);
    }

    return Number(
      await queryBuilder
        .select(`SUM(entity.${field as string})`, "sum")
        .getRawOne()
        .then((result) => result.sum || 0),
    );
  }

  // Transaction wrapper for custom operations
  async withTransaction<R>(operation: (manager: EntityManager) => Promise<R>): Promise<R> {
    return await this.dataSource.transaction(operation);
  }

  // Execute raw query with transaction support
  async query(sql: string, parameters?: any[], manager?: EntityManager): Promise<any> {
    if (manager) {
      return await manager.query(sql, parameters);
    }
    return await this.dataSource.query(sql, parameters);
  }

  /**
   * Attach files from MasterFile to a single entity
   * Tự động gọi khi query entity từ master schema
   */
  private async attachFilesToEntity(entity: T & { id?: string }, manager?: EntityManager): Promise<T> {
    if (!entity || !entity.id) {
      return entity;
    }

    try {
      if (!this.dataSource.isInitialized) {
        return entity;
      }

      // Get File repository from store schema
      const fileRepo = manager ? manager.getRepository("File") : this.dataSource.getRepository("File");

      // Collect all entity IDs (root + nested)
      const collectedIds: string[] = [entity.id, ...this.collectNestedIds(entity)];

      // Get files for all collected IDs
      const files = (
        await fileRepo.find({
          where: {
            entityId: In(collectedIds),
            status: FileStatusEnum.ACTIVE,
            deletedAt: null,
          } as any,
          order: { createdAt: "ASC" } as any,
        })
      ).map((f: any) => ({ ...f, size: f.size != null ? Number(f.size) : f.size }));

      // Group files by entityId and category
      const filesByEntity: Record<string, Record<string, any[]>> = {};

      for (const file of files) {
        const entityId = (file as any).entityId;
        if (!entityId) continue;

        if (!filesByEntity[entityId]) {
          filesByEntity[entityId] = {};
        }

        const category = (file as any).category || "uncategorized";
        if (!filesByEntity[entityId][category]) {
          filesByEntity[entityId][category] = [];
        }

        filesByEntity[entityId][category].push(file);
      }

      // Attach files to root entity
      const entAny: any = { ...entity };
      if (entity.id && filesByEntity[entity.id]) {
        Object.assign(entAny, filesByEntity[entity.id]);
      }

      // Attach files to nested entities
      this.attachGroupedFilesToNestedTargets(entAny, filesByEntity);

      return entAny as T;
    } catch (error) {
      // Silent fail - không ảnh hưởng query chính
      logger.warn(`Failed to attach files to entity ${entity.id}:`, error);
      return entity;
    }
  }

  /**
   * Attach files to multiple entities
   * Tự động gọi khi query danh sách entities
   */
  protected async attachFilesToEntities(entities: (T & { id?: string })[], manager?: EntityManager): Promise<T[]> {
    if (!entities || entities.length === 0) {
      return entities;
    }

    try {
      // Collect root entity ids and nested child ids (e.g., variants)
      const collectedIds: string[] = [];

      for (const e of entities) {
        if (e.id) collectedIds.push(e.id as string);
        collectedIds.push(...this.collectNestedIds(e));
      }

      const uniqueIds = Array.from(new Set(collectedIds));
      if (uniqueIds.length === 0) return entities;

      // Get File repository from store schema
      const fileRepo = manager ? manager.getRepository("File") : this.dataSource.getRepository("File");
      const allFiles = (
        await fileRepo.find({
          where: {
            entityId: In(uniqueIds),
            status: FileStatusEnum.ACTIVE,
            deletedAt: null,
          } as any,
          order: { createdAt: "ASC" } as any,
        })
      ).map((f: any) => ({ ...f, size: f.size != null ? Number(f.size) : f.size }));
      // Group files by entityId and category
      const filesByEntity: Record<string, Record<string, any[]>> = {};

      for (const file of allFiles) {
        const entityId = (file as any).entityId;
        if (!entityId) continue;

        if (!filesByEntity[entityId]) {
          filesByEntity[entityId] = {};
        }

        const category = (file as any).category || "uncategorized";
        if (!filesByEntity[entityId][category]) {
          filesByEntity[entityId][category] = [];
        }

        filesByEntity[entityId][category].push(file);
      }

      // Attach files to root entities and nested child objects
      return entities.map((entity) => {
        if (!entity.id) return entity;

        const entAny: any = { ...entity };
        if (entity.id && filesByEntity[entity.id]) {
          Object.assign(entAny, filesByEntity[entity.id]);
        }

        this.attachGroupedFilesToNestedTargets(entAny, filesByEntity);

        return entAny as T;
      });
    } catch (error) {
      // Silent fail - không ảnh hưởng query chính
      logger.warn(`Failed to attach files to ${entities.length} entities:`, error);
      return entities;
    }
  }

  /**
   * Handle files after entity creation
   * Chuyển files từ tempId sang realId và active
   * Tự động xử lý nested entities thông qua nestedFileFields
   */
  protected async handleFilesOnCreate(
    entityId: string,
    tempId?: string,
    savedEntity?: any,
    manager?: EntityManager,
  ): Promise<void> {
    if (!tempId) return;

    try {
      const fileRepo = manager ? manager.getRepository("File") : this.dataSource.getRepository("File");

      // Update files from tempId to realId and set status to ACTIVE
      const result = await fileRepo.update(
        {
          entityId: tempId,
        },
        {
          entityId: entityId,
          status: FileStatusEnum.ACTIVE,
          expiresAt: null,
        },
      );
      logger.info(`Updated ${result.affected} files from tempId ${tempId} to entityId ${entityId}`);

      // Xử lý files cho nested entities (ví dụ: variants trong product)
      if (savedEntity && this.nestedFileFields && this.nestedFileFields.length > 0) {
        for (const nestedData of this.getNestedObjects(savedEntity, false)) {
          if (nestedData?.tempId && nestedData?.id) {
            await fileRepo.update(
              { entityId: nestedData.tempId },
              {
                entityId: nestedData.id,
                status: FileStatusEnum.ACTIVE,
                expiresAt: null,
              },
            );
            logger.info(`Updated files for nested entity: ${nestedData.tempId} -> ${nestedData.id}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to handle files on create for entity ${entityId}:`, error);
    }
  }

  /**
   * Handle files after entity update
   * Activate all files linked to entity
   * Tự động xử lý nested entities thông qua nestedFileFields
   */
  protected async handleFilesOnUpdate(entityId: string, manager?: EntityManager, updatedEntity?: any): Promise<void> {
    try {
      const fileRepo = manager ? manager.getRepository("File") : this.dataSource.getRepository("File");

      // Nếu multipleFile = false, xóa files cũ trước khi activate files mới
      if (!this.multipleFile) {
        // console.log("Handling files on update - single file mode");
        // Get all pending files for this entity (files mới upload)
        const pendingFiles = await fileRepo.find({
          where: {
            entityId: entityId,
            status: FileStatusEnum.PENDING,
            deletedAt: null,
          } as any,
          order: { createdAt: "DESC" } as any,
        });

        // Group pending files by category
        const pendingByCategory: Record<string, any[]> = {};
        for (const file of pendingFiles) {
          const category = (file as any).category || "default";
          if (!pendingByCategory[category]) {
            pendingByCategory[category] = [];
          }
          pendingByCategory[category].push(file);
        }

        // For each category, delete old active files
        for (const [category, files] of Object.entries(pendingByCategory)) {
          if (files.length > 0) {
            // Soft delete old active files in this category
            await fileRepo
              .createQueryBuilder()
              .softDelete()
              .where("entityId = :entityId", { entityId })
              .andWhere("category = :category", { category })
              .andWhere("status = :status", { status: FileStatusEnum.ACTIVE })
              .andWhere("deletedAt IS NULL")
              .execute();

            logger.info(`Deleted old active files for category "${category}"`);
          }
        }
      }

      // Activate all pending files
      const updateResult = await fileRepo
        .createQueryBuilder()
        .update()
        .set({
          status: FileStatusEnum.ACTIVE,
          expiresAt: null,
        })
        .where("entityId = :entityId", { entityId })
        .andWhere("status = :status", { status: FileStatusEnum.PENDING })
        .andWhere("deletedAt IS NULL")
        .execute();

      // logger.info(`Activated ${updateResult.affected} files for entity ${entityId}`);

      // Xử lý files cho nested entities (ví dụ: variants trong product)
      if (updatedEntity && this.nestedFileFields && this.nestedFileFields.length > 0) {
        for (const nestedData of this.getNestedObjects(updatedEntity, false)) {
          if (nestedData?.id) {
            // ⚠️ Nested entities LUÔN chỉ giữ 1 file/category (single file mode)
            await this.activatePendingFilesForNestedEntity(fileRepo, nestedData.id);
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to handle files on update for entity ${entityId}:`, error);
    }
  }

  /**
   * Handle files after entity deletion
   * Delete all files linked to entity (DB + physical storage)
   * Tự động xử lý nested entities thông qua nestedFileFields
   */
  protected async handleFilesOnDelete(entityId: string, manager?: EntityManager): Promise<void> {
    try {
      const fileRepo = manager ? manager.getRepository("File") : this.dataSource.getRepository("File");

      // Get entity với relations để lấy nested entities
      const repo = this.getRepository(manager);

      const entity = await repo.findOne({
        where: { id: entityId } as any,
        relations: this.relations,
      });

      // Collect tất cả entityIds cần xóa files (entity chính + nested entities)
      const entityIdsToDelete: string[] = [entityId];

      // Thu thập IDs của nested entities
      if (entity && this.nestedFileFields && this.nestedFileFields.length > 0) {
        entityIdsToDelete.push(...this.collectNestedIds(entity, false));
      }

      // Get all files linked to entity và nested entities
      const files = await fileRepo.find({
        where: {
          entityId: In(entityIdsToDelete),
        } as any,
      });

      // Delete physical files
      for (const file of files) {
        try {
          const filePath = (file as any).path;
          const thumbnailPath = (file as any).thumbnailPath;

          if (filePath) {
            await fs.unlink(filePath).catch(() => {
              // File might not exist, ignore error
            });
          }

          if (thumbnailPath) {
            await fs.unlink(thumbnailPath).catch(() => {
              // Thumbnail might not exist, ignore error
            });
          }
        } catch (error) {
          logger.warn(`Failed to delete physical file ${(file as any).path}:`, error);
        }
      }

      // Delete files from database
      await fileRepo.delete({
        entityId: In(entityIdsToDelete),
      } as any);

      logger.info(`Deleted ${files.length} files for entity ${entityId} and nested entities`);
    } catch (error) {
      logger.error(`Failed to handle files on delete for entity ${entityId}:`, error);
    }
  }
}
