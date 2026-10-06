import { injectable, inject } from "inversify";
import { MarginService } from "./margin.service";
import { MARGIN_TYPES } from "./margin.types";
import { BaseController } from "@/shared/base/BaseController";
import { Request, Response } from "express";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";

@injectable()
export class MarginController extends BaseController<MarginService> {
  constructor(
    @inject(MARGIN_TYPES.MarginService) protected service: MarginService,
    @inject(COMMON_TYPES.TransactionManager) protected transactionManager: TransactionManager,
  ) {
    super(service);
  }

  refundMargin = async (req: Request, res: Response, next: Function) => {
    try {
      const marginId = req.params.id as string;
      const timeAt = req.body.timeAt ? new Date(req.body.timeAt) : new Date();

      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.refundMargin(marginId, timeAt, req, tx.manager);
      });
      res.status(200).json(result);
    } catch (error) {
      console.log("Error in refundMargin:", error);
      next(error);
    }
  };
}
