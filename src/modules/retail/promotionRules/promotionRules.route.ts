import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPromotionRulesController } from "./promotionRules.controller";
import { RETAIL_PROMOTION_RULES_TYPES } from "./promotionRules.types";
import { promotionRulesBodySchema, promotionRulesIdParamsSchema, promotionRulesQuerySchema } from "./promotionRules.validator";

@injectable()
export class RetailPromotionRulesRouter {
  private router: Router;

  constructor(@inject(RETAIL_PROMOTION_RULES_TYPES.Controller) private promotionRulesController: RetailPromotionRulesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "promotion-rules": ["read"] }),
      zodValidate(promotionRulesQuerySchema, "query"),
      this.promotionRulesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "promotion-rules": ["create"] }),
      zodValidate(promotionRulesBodySchema, "body"),
      this.promotionRulesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "promotion-rules": ["read"] }),
      zodValidate(promotionRulesIdParamsSchema, "params"),
      this.promotionRulesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "promotion-rules": ["update"] }),
      zodValidate(promotionRulesIdParamsSchema, "params"),
      zodValidate(promotionRulesBodySchema, "body"),
      this.promotionRulesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "promotion-rules": ["delete"] }),
      zodValidate(promotionRulesIdParamsSchema, "params"),
      this.promotionRulesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
