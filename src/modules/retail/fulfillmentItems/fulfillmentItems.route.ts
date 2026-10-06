import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailFulfillmentItemsController } from "./fulfillmentItems.controller";
import { RETAIL_FULFILLMENT_ITEMS_TYPES } from "./fulfillmentItems.types";
import { fulfillmentItemsBodySchema, fulfillmentItemsIdParamsSchema, fulfillmentItemsQuerySchema } from "./fulfillmentItems.validator";

@injectable()
export class RetailFulfillmentItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_FULFILLMENT_ITEMS_TYPES.Controller) private fulfillmentItemsController: RetailFulfillmentItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "fulfillment-items": ["read"] }),
      zodValidate(fulfillmentItemsQuerySchema, "query"),
      this.fulfillmentItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "fulfillment-items": ["create"] }),
      zodValidate(fulfillmentItemsBodySchema, "body"),
      this.fulfillmentItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "fulfillment-items": ["read"] }),
      zodValidate(fulfillmentItemsIdParamsSchema, "params"),
      this.fulfillmentItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "fulfillment-items": ["update"] }),
      zodValidate(fulfillmentItemsIdParamsSchema, "params"),
      zodValidate(fulfillmentItemsBodySchema, "body"),
      this.fulfillmentItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "fulfillment-items": ["delete"] }),
      zodValidate(fulfillmentItemsIdParamsSchema, "params"),
      this.fulfillmentItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
