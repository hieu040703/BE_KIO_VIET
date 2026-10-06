import { injectable, inject } from "inversify";
import { EmployeeService } from "./employee.service";
import { EMPLOYEE_TYPES } from "./employee.types";
import { BaseController } from "@/shared/base/BaseController";
import { COMMON_TYPES } from "../common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { Request, Response } from "express";
import { ApiResponseHandler } from "@/shared/utils/response.utils";

@injectable()
export class EmployeeController extends BaseController<EmployeeService> {
  constructor(
    @inject(EMPLOYEE_TYPES.EmployeeService) protected service: EmployeeService,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(service);
  }

  create = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      // Hoặc nếu muốn quản lý transaction từ controller
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.create(req.body, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  findByUserId = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const { userId } = req.params;
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;
      const result = await this.service.findByUserId(userIdStr);
      return res.status(result.statusCode).json(ApiResponseHandler.getSuccess(result.message, result.data));
    } catch (error) {
      next(error);
    }
  };
}
