import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailInventoryCostLayersController } from "./inventoryCostLayers.controller";
import { RETAIL_INVENTORY_COST_LAYERS_TYPES } from "./inventoryCostLayers.types";
import { inventoryCostLayersBodySchema, inventoryCostLayersIdParamsSchema, inventoryCostLayersQuerySchema } from "./inventoryCostLayers.validator";

@injectable()
export class RetailInventoryCostLayersRouter {
  private router: Router;

  constructor(@inject(RETAIL_INVENTORY_COST_LAYERS_TYPES.Controller) private inventoryCostLayersController: RetailInventoryCostLayersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "inventory-cost-layers": ["read"] }),
      zodValidate(inventoryCostLayersQuerySchema, "query"),
      this.inventoryCostLayersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "inventory-cost-layers": ["create"] }),
      zodValidate(inventoryCostLayersBodySchema, "body"),
      this.inventoryCostLayersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "inventory-cost-layers": ["read"] }),
      zodValidate(inventoryCostLayersIdParamsSchema, "params"),
      this.inventoryCostLayersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "inventory-cost-layers": ["update"] }),
      zodValidate(inventoryCostLayersIdParamsSchema, "params"),
      zodValidate(inventoryCostLayersBodySchema, "body"),
      this.inventoryCostLayersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "inventory-cost-layers": ["delete"] }),
      zodValidate(inventoryCostLayersIdParamsSchema, "params"),
      this.inventoryCostLayersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
