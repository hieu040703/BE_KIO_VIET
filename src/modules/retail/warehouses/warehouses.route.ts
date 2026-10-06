import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailWarehousesController } from "./warehouses.controller";
import { RETAIL_WAREHOUSES_TYPES } from "./warehouses.types";
import { warehousesBodySchema, warehousesIdParamsSchema, warehousesQuerySchema } from "./warehouses.validator";

@injectable()
export class RetailWarehousesRouter {
  private router: Router;

  constructor(@inject(RETAIL_WAREHOUSES_TYPES.Controller) private warehousesController: RetailWarehousesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "warehouses": ["read"] }),
      zodValidate(warehousesQuerySchema, "query"),
      this.warehousesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "warehouses": ["create"] }),
      zodValidate(warehousesBodySchema, "body"),
      this.warehousesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "warehouses": ["read"] }),
      zodValidate(warehousesIdParamsSchema, "params"),
      this.warehousesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "warehouses": ["update"] }),
      zodValidate(warehousesIdParamsSchema, "params"),
      zodValidate(warehousesBodySchema, "body"),
      this.warehousesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "warehouses": ["delete"] }),
      zodValidate(warehousesIdParamsSchema, "params"),
      this.warehousesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
