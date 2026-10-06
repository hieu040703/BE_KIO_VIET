import { Request } from "express";
import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
} from "typeorm";
import type { PermissionStructure } from "@/database/models/PermissionGroup";

// Type alias for EntityManager to abstract TypeORM dependency
export type IEntityManager = EntityManager;

export type ICreateDto<T> = DeepPartial<T>;

export interface IRepository<T> {
  // Basic CRUD with soft delete awareness
  findById(
    id: number | string,
    manager?: EntityManager,
    includeDeleted?: boolean,
  ): Promise<T | null>;
  findAll(manager?: EntityManager, includeDeleted?: boolean): Promise<T[]>;
  create(entity: DeepPartial<T>, manager?: EntityManager): Promise<T>;
  update(
    id: number | string,
    entity: Partial<T>,
    manager?: EntityManager,
  ): Promise<T | null>;
  findOne(
    options: FindOptionsWhere<T>,
    manager?: EntityManager,
    includeDeleted?: boolean,
  ): Promise<T | null>;
  exists(
    options: FindOptionsWhere<T>,
    manager?: EntityManager,
    includeDeleted?: boolean,
  ): Promise<boolean>;

  // Delete operations
  delete(id: number | string, manager?: EntityManager): Promise<boolean>; // Hard delete
  softDelete(id: number | string, manager?: EntityManager): Promise<boolean>; // Soft delete
  restore(id: number | string, manager?: EntityManager): Promise<boolean>; // Restore soft deleted

  // Soft delete specific methods
  findDeleted(manager?: EntityManager): Promise<T[]>;
  findByIdWithDeleted(
    id: number | string,
    manager?: EntityManager,
  ): Promise<T | null>;
  isDeleted(id: number | string, manager?: EntityManager): Promise<boolean>;

  // Batch operations
  createMany(entities: DeepPartial<T>[], manager?: EntityManager): Promise<T[]>;
  updateMany(
    ids: (number | string)[],
    entity: Partial<T>,
    manager?: EntityManager,
  ): Promise<T[]>;
  deleteMany(
    ids: (number | string)[],
    manager?: EntityManager,
  ): Promise<number>;
  softDeleteMany(
    ids: (number | string)[],
    manager?: EntityManager,
  ): Promise<number>;
  restoreMany(
    ids: (number | string)[],
    manager?: EntityManager,
  ): Promise<number>;

  findWithPagination(
    options: FindManyOptions<T>,
    manager?: EntityManager,
    includeDeleted?: boolean,
  ): Promise<{ data: T[]; total: number }>;

  // Utility methods
  count(
    where?: FindOptionsWhere<T>,
    manager?: EntityManager,
    includeDeleted?: boolean,
  ): Promise<number>;
  withTransaction<R>(
    operation: (manager: EntityManager) => Promise<R>,
  ): Promise<R>;
}

export interface IService<T> {
  findById(id: number | string): Promise<ApiResponse<T> | null>;
  findAll(): Promise<ApiResponse<T[]>>;
  create(entity: DeepPartial<T>): Promise<ApiResponse<T>>;
  update(
    id: number | string,
    entity: Partial<T>,
  ): Promise<ApiResponse<T> | null>;
  delete(id: number | string): Promise<ApiResponse<Boolean>>;
}

export interface IController {
  // Controllers will have different methods based on their specific needs
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
  employeeId: string | null;
  customerId: string | null;
  viewAll?: boolean; // Optional field to indicate if the user can view all data
  permissionAdvance?: boolean;
  // Runtime context được nạp lại từ database cho các module cần kiểm tra quyền chi tiết.
  permissionGroup?: { permissions?: PermissionStructure | null } | null;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
  cookies: {
    access_token?: string;
    refresh_token?: string;
    [key: string]: any;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface Pagination {
  totalRecords: number;
  currentPage: number;
  size: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
  summary?: any; // Optional error code for more specific error handling
  errors?: any;
  code?: string;
}

export interface IFindOptions<T> extends FindManyOptions<T> {
  page?: number;
  size?: number;
  tenantId?: string; // Example field for multi-tenancy
  dateFilter?: string;
  keyword?: string; // Keyword for text search
  searchFields?: string[]; // Fields to search in
  timeField?: string; // Field to apply the date range filter on
  summaryFields?: string[]; // Fields to summarize
  filterOptions?: string[]; // Additional filter options
  sortBy?: string; // Field to sort by
  sortOrder?: "ASC" | "DESC"; // Sort direction
  startAt?: Date; // Example field for filtering by date range
  endAt?: Date; // Example field for filtering by date range
  type?: string; // Example field for filtering by type
  status?: string; // Example field for filtering by status
  isFinished?: boolean; // Example field for filtering by completion status
  moreQuery?: any; // Additional complex queries
}

export type ExcelExportType =
  | "ORDER"
  | "WAREHOUSE_TO_LEADER"
  | "LEADER_TO_WAREHOUSE"
  | "LEADER_TO_WORKER"
  | "WORKER_TO_LEADER"
  | "TAG_OF_CONSIGNMENT"
  | "TAG_OF_ORDER"
  | "TAG_OF_LEADER_TO_WORKER"
  | "LEADER_TO_WAREHOUSE_ORDER"
  | "LEADER_TO_WAREHOUSE_IN_ORDER"
  | "DAO_RUT_TO_WAREHOUSE"
  | "DAO_RUT_TO_WORKER"
  | "WORKER_TO_DAO_RUT";
export type ExcelImportType = "SELL" | "PURCHASE" | "ADJUST_INVENTORY";
export type ExcelTemplateType = "SELL" | "PURCHASE" | "ADJUST_INVENTORY";

export interface PriceUpdate {
  id: string;
  product: string;
  price: number;
  currency: string;
  timestamp: number;
}

export interface SSEClient {
  id: string;
  response: any;
  userId?: string;
  connectedAt: number;
}

export interface ImportExcelResult {
  statusCode?: number;
  message?: string;
  resultFile: string;
  total: number;
  success: number;
  failed: number;
}

export interface ISocketResponse {
  statusCode: number;
  message: string;
  resultFile?: string;
  total?: number;
  success?: number;
  failed?: number;
  duration?: string;
  data?: any;
}

export interface IBankData {
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  code: string | null;
  content: string;
  transferType: string;
  description: string;
  transferAmount: number;
  referenceCode: string;
  accumulated: number;
  id: number;
}
