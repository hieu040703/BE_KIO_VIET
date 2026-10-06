import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailRefundItemsController } from "./refundItems.controller";
import { RETAIL_REFUND_ITEMS_TYPES } from "./refundItems.types";
import { refundItemsBodySchema, refundItemsIdParamsSchema, refundItemsQuerySchema } from "./refundItems.validator";

@injectable()
export class RetailRefundItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_REFUND_ITEMS_TYPES.Controller) private refundItemsController: RetailRefundItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "refund-items": ["read"] }),
      zodValidate(refundItemsQuerySchema, "query"),
      this.refundItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "refund-items": ["create"] }),
      zodValidate(refundItemsBodySchema, "body"),
      this.refundItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "refund-items": ["read"] }),
      zodValidate(refundItemsIdParamsSchema, "params"),
      this.refundItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "refund-items": ["update"] }),
      zodValidate(refundItemsIdParamsSchema, "params"),
      zodValidate(refundItemsBodySchema, "body"),
      this.refundItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "refund-items": ["delete"] }),
      zodValidate(refundItemsIdParamsSchema, "params"),
      this.refundItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
