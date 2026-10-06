import { injectable, inject } from "inversify";
import { FundService } from "./fund.service";
import { FUND_TYPES } from "./fund.types";
import { BaseController } from "@/shared/base/BaseController";
import { Request, Response } from "express";

@injectable()
export class FundController extends BaseController<FundService> {
  constructor(@inject(FUND_TYPES.FundService) protected service: FundService) {
    super(service);
  }

  handleSepayWebhook = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      await this.service.handleSepayWebhook(req.body, req);
      return res.status(200).json({ message: "Webhook handled successfully" });
    } catch (error) {
      next(error);
    }
  };
}
