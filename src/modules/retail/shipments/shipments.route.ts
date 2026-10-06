import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailShipmentsController } from "./shipments.controller";
import { RETAIL_SHIPMENTS_TYPES } from "./shipments.types";
import { shipmentsBodySchema, shipmentsIdParamsSchema, shipmentsQuerySchema } from "./shipments.validator";

@injectable()
export class RetailShipmentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_SHIPMENTS_TYPES.Controller) private shipmentsController: RetailShipmentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "shipments": ["read"] }),
      zodValidate(shipmentsQuerySchema, "query"),
      this.shipmentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "shipments": ["create"] }),
      zodValidate(shipmentsBodySchema, "body"),
      this.shipmentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "shipments": ["read"] }),
      zodValidate(shipmentsIdParamsSchema, "params"),
      this.shipmentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "shipments": ["update"] }),
      zodValidate(shipmentsIdParamsSchema, "params"),
      zodValidate(shipmentsBodySchema, "body"),
      this.shipmentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "shipments": ["delete"] }),
      zodValidate(shipmentsIdParamsSchema, "params"),
      this.shipmentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
