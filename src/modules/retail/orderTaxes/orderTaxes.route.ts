import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailOrderTaxesController } from "./orderTaxes.controller";
import { RETAIL_ORDER_TAXES_TYPES } from "./orderTaxes.types";
import { orderTaxesBodySchema, orderTaxesIdParamsSchema, orderTaxesQuerySchema } from "./orderTaxes.validator";

@injectable()
export class RetailOrderTaxesRouter {
  private router: Router;

  constructor(@inject(RETAIL_ORDER_TAXES_TYPES.Controller) private orderTaxesController: RetailOrderTaxesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "order-taxes": ["read"] }),
      zodValidate(orderTaxesQuerySchema, "query"),
      this.orderTaxesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "order-taxes": ["create"] }),
      zodValidate(orderTaxesBodySchema, "body"),
      this.orderTaxesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "order-taxes": ["read"] }),
      zodValidate(orderTaxesIdParamsSchema, "params"),
      this.orderTaxesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "order-taxes": ["update"] }),
      zodValidate(orderTaxesIdParamsSchema, "params"),
      zodValidate(orderTaxesBodySchema, "body"),
      this.orderTaxesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "order-taxes": ["delete"] }),
      zodValidate(orderTaxesIdParamsSchema, "params"),
      this.orderTaxesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
