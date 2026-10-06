import { injectable } from "inversify";
import { DeepPartial, EntityTarget, Repository } from "typeorm";
import DatabaseConfig from "@/database/database";
import { RetailResource, RetailTableDefinition } from "./retail.types";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";

export interface RetailListOptions {
  tenantId?: string;
  page: number;
  size: number;
  keyword?: string;
}

@injectable()
export class RetailRepository {
  private getRepository(definition: RetailTableDefinition): Repository<any> {
    return DatabaseConfig.getRepository(definition.entity as EntityTarget<any>);
  }

  async list(definition: RetailTableDefinition, options: RetailListOptions): Promise<{ rows: any[]; total: number }> {
    const repository = this.getRepository(definition);
    const query = repository.createQueryBuilder("row");

    if (definition.tenantScoped) {
      query.andWhere("row.tenant_id = :tenantId", { tenantId: options.tenantId });
    }

    if (options.keyword && definition.searchable.length > 0) {
      query.andWhere(
        `(${definition.searchable.map((field) => `row.${this.toSnakeCase(field)} ILIKE :keyword`).join(" OR ")})`,
        { keyword: `%${options.keyword}%` },
      );
    }

    query.orderBy(`row.${definition.sortColumn}`, "DESC");
    query.skip((options.page - 1) * options.size).take(options.size);
    const [rows, total] = await query.getManyAndCount();
    return { rows, total };
  }

  async findById(definition: RetailTableDefinition, id: string, tenantId?: string): Promise<any> {
    const query = this.getRepository(definition).createQueryBuilder("row").where("row.id = :id", { id });
    if (definition.tenantScoped) query.andWhere("row.tenant_id = :tenantId", { tenantId });
    const row = await query.getOne();
    if (!row) throw new NotFoundError("Record not found");
    return row;
  }

  async create(definition: RetailTableDefinition, data: DeepPartial<any>): Promise<any> {
    const repository = this.getRepository(definition);
    return repository.save(repository.create(data));
  }

  async update(definition: RetailTableDefinition, id: string, tenantId: string | undefined, data: DeepPartial<any>): Promise<any> {
    const repository = this.getRepository(definition);
    const existing = await this.findById(definition, id, tenantId);
    repository.merge(existing, data);
    return repository.save(existing);
  }

  async delete(definition: RetailTableDefinition, id: string, tenantId?: string): Promise<void> {
    if (!definition.softDelete) {
      throw new BadRequestError(`Resource ${definition.resource} does not support soft delete`);
    }
    const query = this.getRepository(definition).createQueryBuilder().softDelete().where("id = :id", { id });
    if (definition.tenantScoped) query.andWhere("tenant_id = :tenantId", { tenantId });
    const result = await query.execute();
    if (!result.affected) throw new NotFoundError("Record not found");
  }

  private toSnakeCase(value: string): string {
    return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
