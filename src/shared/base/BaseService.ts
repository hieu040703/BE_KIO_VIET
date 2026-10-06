import { Request } from "express";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { BasePaginationOptions, BaseRepository } from "./BaseRepository";

export abstract class BaseService<T extends { id: string }> {
  protected constructor(protected readonly repository: BaseRepository<T>) {}

  async findAllWithPagination(options: unknown, req?: Request) {
    const result = await this.repository.findAllWithPagination(
      (options ?? {}) as BasePaginationOptions,
      req as Request & { tenantId?: string },
    );
    return ApiResponseHandler.getSuccess("OK", result.rows, {
      currentPage: result.page,
      size: result.size,
      totalRecords: result.total,
      totalPages: Math.ceil(result.total / result.size),
    });
  }

  async findById(id: string, req?: Request) {
    return ApiResponseHandler.getSuccess("OK", await this.repository.findById(id, req as any));
  }

  async create(data: unknown, req?: Request) {
    return ApiResponseHandler.createSuccess("Created", await this.repository.create(data as any, req as any));
  }

  async update(id: string, data: unknown, req?: Request) {
    return ApiResponseHandler.updateSuccess("Updated", await this.repository.update(id, data as any, req as any));
  }

  async delete(id: string, req?: Request) {
    return ApiResponseHandler.deleteSuccess("Deleted", await this.repository.delete(id, req as any));
  }
}
