import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPurchaseReturnsController } from "./purchaseReturns.controller";
import { RETAIL_PURCHASE_RETURNS_TYPES } from "./purchaseReturns.types";
import { purchaseReturnsBodySchema, purchaseReturnsIdParamsSchema, purchaseReturnsQuerySchema } from "./purchaseReturns.validator";

@injectable()
export class RetailPurchaseReturnsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PURCHASE_RETURNS_TYPES.Controller) private purchaseReturnsController: RetailPurchaseReturnsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "purchase-returns": ["read"] }),
      zodValidate(purchaseReturnsQuerySchema, "query"),
      this.purchaseReturnsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "purchase-returns": ["create"] }),
      zodValidate(purchaseReturnsBodySchema, "body"),
      this.purchaseReturnsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "purchase-returns": ["read"] }),
      zodValidate(purchaseReturnsIdParamsSchema, "params"),
      this.purchaseReturnsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "purchase-returns": ["update"] }),
      zodValidate(purchaseReturnsIdParamsSchema, "params"),
      zodValidate(purchaseReturnsBodySchema, "body"),
      this.purchaseReturnsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "purchase-returns": ["delete"] }),
      zodValidate(purchaseReturnsIdParamsSchema, "params"),
      this.purchaseReturnsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
