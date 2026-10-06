import { injectable, inject } from "inversify";
import { DebtService } from "./debt.service";
import { DEBT_TYPES } from "./debt.types";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Response, Request } from "express";

@injectable()
export class DebtController extends BaseController<DebtService> {
  constructor(@inject(DEBT_TYPES.DebtService) protected service: DebtService) {
    super(service);
  }

  getDebtByCustomerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.user?.customerId || (req.params.id as string);
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID is required" });
      }
      const result = await this.service.getDebtByCustomerId(customerId, req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  calculateCustomerDebtAtTime = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.user?.customerId || (req.params.id as string);
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID is required" });
      }
      const time = req.query.time ? new Date(req.query.time as string) : undefined;
      const result = await this.service.calculateCustomerDebtAtTime(customerId, time);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
