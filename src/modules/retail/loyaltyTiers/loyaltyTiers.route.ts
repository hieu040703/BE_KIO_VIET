import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailLoyaltyTiersController } from "./loyaltyTiers.controller";
import { RETAIL_LOYALTY_TIERS_TYPES } from "./loyaltyTiers.types";
import { loyaltyTiersBodySchema, loyaltyTiersIdParamsSchema, loyaltyTiersQuerySchema } from "./loyaltyTiers.validator";

@injectable()
export class RetailLoyaltyTiersRouter {
  private router: Router;

  constructor(@inject(RETAIL_LOYALTY_TIERS_TYPES.Controller) private loyaltyTiersController: RetailLoyaltyTiersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "loyalty-tiers": ["read"] }),
      zodValidate(loyaltyTiersQuerySchema, "query"),
      this.loyaltyTiersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "loyalty-tiers": ["create"] }),
      zodValidate(loyaltyTiersBodySchema, "body"),
      this.loyaltyTiersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "loyalty-tiers": ["read"] }),
      zodValidate(loyaltyTiersIdParamsSchema, "params"),
      this.loyaltyTiersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "loyalty-tiers": ["update"] }),
      zodValidate(loyaltyTiersIdParamsSchema, "params"),
      zodValidate(loyaltyTiersBodySchema, "body"),
      this.loyaltyTiersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "loyalty-tiers": ["delete"] }),
      zodValidate(loyaltyTiersIdParamsSchema, "params"),
      this.loyaltyTiersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
