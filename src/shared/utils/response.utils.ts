export interface Pagination {
  currentPage: number;
  size: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  pagination?: Pagination;
  summary?: unknown;
  errors?: unknown;
}

export class ApiResponseHandler {
  static getSuccess<T>(message = "OK", data?: T, pagination?: Pagination, summary?: unknown): ApiResponse<T> {
    return { statusCode: 200, success: true, message, data, pagination, summary };
  }

  static createSuccess<T>(message = "OK", data?: T): ApiResponse<T> {
    return { statusCode: 201, success: true, message, data };
  }

  static updateSuccess<T>(message: string, data?: T): ApiResponse<T> {
    return { statusCode: 200, success: true, message, data };
  }

  static deleteSuccess<T>(message: string, data?: T): ApiResponse<T> {
    return { statusCode: 200, success: true, message, data };
  }
}
