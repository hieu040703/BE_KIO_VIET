import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailStoresController } from "./stores.controller";
import { RETAIL_STORES_TYPES } from "./stores.types";
import { storesBodySchema, storesIdParamsSchema, storesQuerySchema } from "./stores.validator";

@injectable()
export class RetailStoresRouter {
  private router: Router;

  constructor(@inject(RETAIL_STORES_TYPES.Controller) private storesController: RetailStoresController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "stores": ["read"] }),
      zodValidate(storesQuerySchema, "query"),
      this.storesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "stores": ["create"] }),
      zodValidate(storesBodySchema, "body"),
      this.storesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "stores": ["read"] }),
      zodValidate(storesIdParamsSchema, "params"),
      this.storesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "stores": ["update"] }),
      zodValidate(storesIdParamsSchema, "params"),
      zodValidate(storesBodySchema, "body"),
      this.storesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "stores": ["delete"] }),
      zodValidate(storesIdParamsSchema, "params"),
      this.storesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
