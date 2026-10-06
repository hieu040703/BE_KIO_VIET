import { injectable, inject } from "inversify";
import { TimeKeepingService } from "./timeKeeping.service";
import { TIME_KEEPING_TYPES } from "./timeKeeping.types";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Request, Response } from "express";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { COMMON_TYPES } from "../common/common.types";

@injectable()
export class TimeKeepingController extends BaseController<TimeKeepingService> {
  constructor(
    @inject(TIME_KEEPING_TYPES.TimeKeepingService) protected service: TimeKeepingService,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(service);
  }

  getTimeKeepingByAllEmployeeAndDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getTimeKeepingByAllEmployeeAndDate(req.query, req);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createCustomTimeKeeping = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createCustomTimeKeeping(req);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  confirmTimeKeeping = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.confirmTimeKeeping(req.body, req, tx.manager);
      });

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  getAllTimeKeepingSummaryByEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getAllTimeKeepingSummaryByEmployee(req);

      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };
}
