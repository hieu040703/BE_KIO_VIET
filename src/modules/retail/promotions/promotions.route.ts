import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPromotionsController } from "./promotions.controller";
import { RETAIL_PROMOTIONS_TYPES } from "./promotions.types";
import { promotionsBodySchema, promotionsIdParamsSchema, promotionsQuerySchema } from "./promotions.validator";

@injectable()
export class RetailPromotionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PROMOTIONS_TYPES.Controller) private promotionsController: RetailPromotionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "promotions": ["read"] }),
      zodValidate(promotionsQuerySchema, "query"),
      this.promotionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "promotions": ["create"] }),
      zodValidate(promotionsBodySchema, "body"),
      this.promotionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "promotions": ["read"] }),
      zodValidate(promotionsIdParamsSchema, "params"),
      this.promotionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "promotions": ["update"] }),
      zodValidate(promotionsIdParamsSchema, "params"),
      zodValidate(promotionsBodySchema, "body"),
      this.promotionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "promotions": ["delete"] }),
      zodValidate(promotionsIdParamsSchema, "params"),
      this.promotionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
