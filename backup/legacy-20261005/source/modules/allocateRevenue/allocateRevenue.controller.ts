import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { BaseController } from "@/shared/base/BaseController";
import { COMMON_TYPES } from "../common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ALLOCATE_REVENUE_TYPES } from "./allocateRevenue.types";
import { AllocateRevenueService } from "./allocateRevenue.service";
import { AllocateRevenueToEmployeesDto } from "./allocateRevenue.validator";
import { ApiResponseHandler } from "@/shared/utils/response.utils";

@injectable()
export class AllocateRevenueController extends BaseController<AllocateRevenueService> {
  constructor(
    @inject(ALLOCATE_REVENUE_TYPES.AllocateRevenueService) protected service: AllocateRevenueService,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(service);
  }

  calculateTotalRevenue = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const data = await this.service.calculateTotalRevenue(req.query as unknown as AllocateRevenueToEmployeesDto);
      const result = ApiResponseHandler.getSuccess("OK", data);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  //? Lấy danh sách order leader được phân bổ trong 1 phiếu
  getOrderLeaders = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const data = await this.service.getOrderLeaders(req.params.id as string);
      const result = ApiResponseHandler.getSuccess("OK", data);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  allocateRevenueToEmployees = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      return await this.transactionManager.withTransaction(async (tx) => {
        const data = await this.service.allocateRevenueToEmployees(req.body, tx.manager);
        return res.status(data.statusCode).json(data);
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      return await this.transactionManager.withTransaction(async (tx) => {
        const data = await this.service.delete(req.params.id as string, req, tx.manager);
        return res.status(data.statusCode).json(data);
      });
    } catch (error) {
      next(error);
    }
  };
}
