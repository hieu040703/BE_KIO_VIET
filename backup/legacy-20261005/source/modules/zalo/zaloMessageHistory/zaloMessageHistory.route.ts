import { Router } from "express";
import { injectable, inject } from "inversify";
import { ZaloMessageHistoryController } from "./zaloMessageHistory.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import {
  ZaloMessageHistoryQuerySchema,
  ZaloMessageHistoryParamsSchema,
  ResendZaloMessageHistorySchema,
} from "./zaloMessageHistory.validator";
import { ZALO_MESSAGE_HISTORY_TYPES } from "./zaloMessageHistory.types";

@injectable()
export class AdminZaloMessageHistoryRouter {
  private router: Router;

  constructor(
    @inject(ZALO_MESSAGE_HISTORY_TYPES.ZaloMessageHistoryController)
    private zaloMessageHistoryController: ZaloMessageHistoryController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      zodValidate(ZaloMessageHistoryQuerySchema, "query"),
      this.zaloMessageHistoryController.getAllWithPagination,
    );

    this.router.get(
      "/:id",
      zodValidate(ZaloMessageHistoryParamsSchema, "params"),
      this.zaloMessageHistoryController.getById,
    );

    this.router.post(
      "/:id/resend",
      zodValidate(ZaloMessageHistoryParamsSchema, "params"),
      zodValidate(ResendZaloMessageHistorySchema, "body"),
      this.zaloMessageHistoryController.resend,
    );

    this.router.delete(
      "/:id",
      zodValidate(ZaloMessageHistoryParamsSchema, "params"),
      this.zaloMessageHistoryController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
