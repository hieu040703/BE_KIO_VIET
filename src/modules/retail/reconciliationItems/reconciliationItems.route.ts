import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailReconciliationItemsController } from "./reconciliationItems.controller";
import { RETAIL_RECONCILIATION_ITEMS_TYPES } from "./reconciliationItems.types";
import { reconciliationItemsBodySchema, reconciliationItemsIdParamsSchema, reconciliationItemsQuerySchema } from "./reconciliationItems.validator";

@injectable()
export class RetailReconciliationItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_RECONCILIATION_ITEMS_TYPES.Controller) private reconciliationItemsController: RetailReconciliationItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "reconciliation-items": ["read"] }),
      zodValidate(reconciliationItemsQuerySchema, "query"),
      this.reconciliationItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "reconciliation-items": ["create"] }),
      zodValidate(reconciliationItemsBodySchema, "body"),
      this.reconciliationItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "reconciliation-items": ["read"] }),
      zodValidate(reconciliationItemsIdParamsSchema, "params"),
      this.reconciliationItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "reconciliation-items": ["update"] }),
      zodValidate(reconciliationItemsIdParamsSchema, "params"),
      zodValidate(reconciliationItemsBodySchema, "body"),
      this.reconciliationItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "reconciliation-items": ["delete"] }),
      zodValidate(reconciliationItemsIdParamsSchema, "params"),
      this.reconciliationItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
