import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailInventoriesController } from "./inventories.controller";
import { RETAIL_INVENTORIES_TYPES } from "./inventories.types";
import { inventoriesBodySchema, inventoriesIdParamsSchema, inventoriesQuerySchema } from "./inventories.validator";

@injectable()
export class RetailInventoriesRouter {
  private router: Router;

  constructor(@inject(RETAIL_INVENTORIES_TYPES.Controller) private inventoriesController: RetailInventoriesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "inventories": ["read"] }),
      zodValidate(inventoriesQuerySchema, "query"),
      this.inventoriesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "inventories": ["create"] }),
      zodValidate(inventoriesBodySchema, "body"),
      this.inventoriesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "inventories": ["read"] }),
      zodValidate(inventoriesIdParamsSchema, "params"),
      this.inventoriesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "inventories": ["update"] }),
      zodValidate(inventoriesIdParamsSchema, "params"),
      zodValidate(inventoriesBodySchema, "body"),
      this.inventoriesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "inventories": ["delete"] }),
      zodValidate(inventoriesIdParamsSchema, "params"),
      this.inventoriesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
