import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailInventoryBatchesController } from "./inventoryBatches.controller";
import { RETAIL_INVENTORY_BATCHES_TYPES } from "./inventoryBatches.types";
import { inventoryBatchesBodySchema, inventoryBatchesIdParamsSchema, inventoryBatchesQuerySchema } from "./inventoryBatches.validator";

@injectable()
export class RetailInventoryBatchesRouter {
  private router: Router;

  constructor(@inject(RETAIL_INVENTORY_BATCHES_TYPES.Controller) private inventoryBatchesController: RetailInventoryBatchesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "inventory-batches": ["read"] }),
      zodValidate(inventoryBatchesQuerySchema, "query"),
      this.inventoryBatchesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "inventory-batches": ["create"] }),
      zodValidate(inventoryBatchesBodySchema, "body"),
      this.inventoryBatchesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "inventory-batches": ["read"] }),
      zodValidate(inventoryBatchesIdParamsSchema, "params"),
      this.inventoryBatchesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "inventory-batches": ["update"] }),
      zodValidate(inventoryBatchesIdParamsSchema, "params"),
      zodValidate(inventoryBatchesBodySchema, "body"),
      this.inventoryBatchesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "inventory-batches": ["delete"] }),
      zodValidate(inventoryBatchesIdParamsSchema, "params"),
      this.inventoryBatchesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
