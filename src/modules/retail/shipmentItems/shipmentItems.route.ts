import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailShipmentItemsController } from "./shipmentItems.controller";
import { RETAIL_SHIPMENT_ITEMS_TYPES } from "./shipmentItems.types";
import { shipmentItemsBodySchema, shipmentItemsIdParamsSchema, shipmentItemsQuerySchema } from "./shipmentItems.validator";

@injectable()
export class RetailShipmentItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_SHIPMENT_ITEMS_TYPES.Controller) private shipmentItemsController: RetailShipmentItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "shipment-items": ["read"] }),
      zodValidate(shipmentItemsQuerySchema, "query"),
      this.shipmentItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "shipment-items": ["create"] }),
      zodValidate(shipmentItemsBodySchema, "body"),
      this.shipmentItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "shipment-items": ["read"] }),
      zodValidate(shipmentItemsIdParamsSchema, "params"),
      this.shipmentItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "shipment-items": ["update"] }),
      zodValidate(shipmentItemsIdParamsSchema, "params"),
      zodValidate(shipmentItemsBodySchema, "body"),
      this.shipmentItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "shipment-items": ["delete"] }),
      zodValidate(shipmentItemsIdParamsSchema, "params"),
      this.shipmentItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
