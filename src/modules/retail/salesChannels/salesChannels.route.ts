import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailSalesChannelsController } from "./salesChannels.controller";
import { RETAIL_SALES_CHANNELS_TYPES } from "./salesChannels.types";
import { salesChannelsBodySchema, salesChannelsIdParamsSchema, salesChannelsQuerySchema } from "./salesChannels.validator";

@injectable()
export class RetailSalesChannelsRouter {
  private router: Router;

  constructor(@inject(RETAIL_SALES_CHANNELS_TYPES.Controller) private salesChannelsController: RetailSalesChannelsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "sales-channels": ["read"] }),
      zodValidate(salesChannelsQuerySchema, "query"),
      this.salesChannelsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "sales-channels": ["create"] }),
      zodValidate(salesChannelsBodySchema, "body"),
      this.salesChannelsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "sales-channels": ["read"] }),
      zodValidate(salesChannelsIdParamsSchema, "params"),
      this.salesChannelsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "sales-channels": ["update"] }),
      zodValidate(salesChannelsIdParamsSchema, "params"),
      zodValidate(salesChannelsBodySchema, "body"),
      this.salesChannelsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "sales-channels": ["delete"] }),
      zodValidate(salesChannelsIdParamsSchema, "params"),
      this.salesChannelsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
