import { DeepPartial, EntityManager, EntityTarget, Repository } from "typeorm";
import DatabaseConfig from "@/database/database";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { RETAIL_DATA_RELATIONS, RETAIL_RESOURCES } from "@/modules/retail/retail.types";

export interface BaseTableDefinition {
  resource: string;
  tableName: string;
  entity: EntityTarget<any>;
  tenantScoped: boolean;
  softDelete: boolean;
  writable: string[];
  required: string[];
  searchable: string[];
  sortColumn: string;
  referenceResource?: string;
  referenceTableName?: string;
}

export interface BasePaginationOptions {
  page?: number;
  size?: number;
  keyword?: string;
}

export abstract class BaseRepository<T extends { id: string }> {
  protected abstract entityClass: EntityTarget<T>;

  protected abstract getDefinition(): BaseTableDefinition;

  protected getRepository(manager?: EntityManager): Repository<T> {
    return (manager ?? DatabaseConfig.manager).getRepository(this.entityClass);
  }

  async findAllWithPagination(
    options: BasePaginationOptions,
    req?: { tenantId?: string; header(name: string): string | undefined },
    manager?: EntityManager,
  ): Promise<{ rows: T[]; total: number; page: number; size: number }> {
    const definition = this.getDefinition();
    const page = Math.max(1, Number(options.page ?? 1));
    const size = Math.min(100, Math.max(1, Number(options.size ?? 20)));
    const tenantId = this.tenantId(req);
    this.assertTenant(definition, tenantId);

    const query = this.getRepository(manager).createQueryBuilder("row");
    if (definition.tenantScoped) query.andWhere("row.tenant_id = :tenantId", { tenantId });

    if (options.keyword && definition.searchable.length > 0) {
      query.andWhere(
        `(${definition.searchable.map((field) => `row.${this.toSnakeCase(field)} ILIKE :keyword`).join(" OR ")})`,
        { keyword: `%${options.keyword}%` },
      );
    }

    query.orderBy(`row.${definition.sortColumn}`, "DESC");
    query.skip((page - 1) * size).take(size);
    const [rows, total] = await query.getManyAndCount();
    return { rows, total, page, size };
  }

  async findById(
    id: string,
    req?: { tenantId?: string; header(name: string): string | undefined },
    manager?: EntityManager,
  ): Promise<T> {
    const definition = this.getDefinition();
    const tenantId = this.tenantId(req);
    this.assertTenant(definition, tenantId);

    const query = this.getRepository(manager).createQueryBuilder("row").where("row.id = :id", { id });
    if (definition.tenantScoped) query.andWhere("row.tenant_id = :tenantId", { tenantId });
    const row = await query.getOne();
    if (!row) throw new NotFoundError("Record not found");
    return row;
  }

  async create(
    input: DeepPartial<T>,
    req?: { tenantId?: string; header(name: string): string | undefined },
    manager?: EntityManager,
  ): Promise<T> {
    const definition = this.getDefinition();
    const tenantId = this.tenantId(req);
    this.assertTenant(definition, tenantId);
    const data = this.prepare(definition, input as Record<string, unknown>, tenantId);
    await this.assertReference(definition, data, tenantId);
    const repository = this.getRepository(manager);
    return repository.save(repository.create(data as DeepPartial<T>));
  }

  async update(
    id: string,
    input: DeepPartial<T>,
    req?: { tenantId?: string; header(name: string): string | undefined },
    manager?: EntityManager,
  ): Promise<T> {
    const definition = this.getDefinition();
    const tenantId = this.tenantId(req);
    this.assertTenant(definition, tenantId);
    const repository = this.getRepository(manager);
    const existing = await this.findById(id, req, manager);
    const data = this.prepare(definition, input as Record<string, unknown>);
    await this.assertReference(definition, data, tenantId);
    repository.merge(existing, data as DeepPartial<T>);
    return repository.save(existing);
  }

  async delete(
    id: string,
    req?: { tenantId?: string; header(name: string): string | undefined },
    manager?: EntityManager,
  ): Promise<string> {
    const definition = this.getDefinition();
    const tenantId = this.tenantId(req);
    this.assertTenant(definition, tenantId);
    if (!definition.softDelete) {
      throw new BadRequestError(`Resource ${definition.resource} does not support soft delete`);
    }

    const query = this.getRepository(manager).createQueryBuilder().softDelete().where("id = :id", { id });
    if (definition.tenantScoped) query.andWhere("tenant_id = :tenantId", { tenantId });
    const result = await query.execute();
    if (!result.affected) throw new NotFoundError("Record not found");
    return id;
  }

  private tenantId(req?: { tenantId?: string; header(name: string): string | undefined }): string | undefined {
    return req?.tenantId ?? req?.header("x-tenant-id") ?? undefined;
  }

  private assertTenant(definition: BaseTableDefinition, tenantId?: string): void {
    if (definition.tenantScoped && !tenantId) {
      throw new BadRequestError("x-tenant-id is required for this resource");
    }
  }

  private prepare(
    definition: BaseTableDefinition,
    input: Record<string, unknown>,
    tenantId?: string,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const field of definition.writable) {
      if (input[field] !== undefined) data[field] = input[field];
    }

    const missing = definition.required.filter(
      (field) => data[field] === undefined || data[field] === null || data[field] === "",
    );
    if (missing.length > 0) throw new BadRequestError(`Missing required fields: ${missing.join(", ")}`);
    if (definition.tenantScoped && tenantId) data.tenantId = tenantId;
    return data;
  }

  private toSnakeCase(value: string): string {
    return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private async assertReference(definition: BaseTableDefinition, data: Record<string, unknown>, tenantId?: string): Promise<void> {
    if (definition.referenceTableName && data.referenceId !== undefined && data.referenceId !== null && data.referenceId !== "") {
      const metadata = DatabaseConfig.entityMetadatas.find((item) => item.tableName === definition.referenceTableName);
      if (!metadata) throw new BadRequestError(`Reference target is not registered: ${definition.referenceTableName}`);
      const query = this.getRepository().manager.getRepository(metadata.target).createQueryBuilder("reference")
        .where("reference.id = :id", { id: data.referenceId });
      if (definition.tenantScoped && metadata.columns.some((column) => column.databaseName === "tenant_id")) {
        query.andWhere("reference.tenant_id = :tenantId", { tenantId });
      }
      const reference = await query.getOne();
      if (!reference) throw new BadRequestError(`referenceId references a missing ${definition.referenceResource || definition.referenceTableName} record: ${String(data.referenceId)}`);
    }
    const dataPayload = data.data;
    if (!dataPayload || typeof dataPayload !== "object" || Array.isArray(dataPayload)) return;
    for (const [field, resource] of Object.entries(RETAIL_DATA_RELATIONS[definition.resource] || {})) {
      const value = (dataPayload as Record<string, unknown>)[field];
      if (value === undefined || value === null || value === "") continue;
      const target = RETAIL_RESOURCES[resource];
      if (!target) continue;
      const targetMetadata = DatabaseConfig.entityMetadatas.find((item) => item.tableName === target.tableName);
      if (!targetMetadata) throw new BadRequestError(`Data relation target is not registered: ${target.tableName}`);
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) {
        if (typeof item !== "string" || !item) continue;
        const dataQuery = this.getRepository().manager.getRepository(targetMetadata.target).createQueryBuilder("dataRelated")
          .where("dataRelated.id = :id", { id: item });
        if (target.tenantScoped && targetMetadata.columns.some((column) => column.databaseName === "tenant_id")) dataQuery.andWhere("dataRelated.tenant_id = :tenantId", { tenantId });
        const related = await dataQuery.getOne();
        if (!related) throw new BadRequestError(`data.${field} references a missing ${resource} record: ${item}`);
      }
    }
  }
}
