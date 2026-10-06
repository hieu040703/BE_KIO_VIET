import { injectable, inject } from "inversify";
import { ZaloMessageHistoryService } from "./zaloMessageHistory.service";
import { ZALO_MESSAGE_HISTORY_TYPES } from "./zaloMessageHistory.types";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Request, Response } from "express";

@injectable()
export class ZaloMessageHistoryController extends BaseController<ZaloMessageHistoryService> {
  constructor(
    @inject(ZALO_MESSAGE_HISTORY_TYPES.ZaloMessageHistoryService)
    protected service: ZaloMessageHistoryService,
  ) {
    super(service);
  }

  resend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.resend(req.params.id as string, req);
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };
}
