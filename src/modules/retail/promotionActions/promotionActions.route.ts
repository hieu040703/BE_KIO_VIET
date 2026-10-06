import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPromotionActionsController } from "./promotionActions.controller";
import { RETAIL_PROMOTION_ACTIONS_TYPES } from "./promotionActions.types";
import { promotionActionsBodySchema, promotionActionsIdParamsSchema, promotionActionsQuerySchema } from "./promotionActions.validator";

@injectable()
export class RetailPromotionActionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PROMOTION_ACTIONS_TYPES.Controller) private promotionActionsController: RetailPromotionActionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "promotion-actions": ["read"] }),
      zodValidate(promotionActionsQuerySchema, "query"),
      this.promotionActionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "promotion-actions": ["create"] }),
      zodValidate(promotionActionsBodySchema, "body"),
      this.promotionActionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "promotion-actions": ["read"] }),
      zodValidate(promotionActionsIdParamsSchema, "params"),
      this.promotionActionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "promotion-actions": ["update"] }),
      zodValidate(promotionActionsIdParamsSchema, "params"),
      zodValidate(promotionActionsBodySchema, "body"),
      this.promotionActionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "promotion-actions": ["delete"] }),
      zodValidate(promotionActionsIdParamsSchema, "params"),
      this.promotionActionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
