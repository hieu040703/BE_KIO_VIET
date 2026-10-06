import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailBundleItemsController } from "./bundleItems.controller";
import { RETAIL_BUNDLE_ITEMS_TYPES } from "./bundleItems.types";
import { bundleItemsBodySchema, bundleItemsIdParamsSchema, bundleItemsQuerySchema } from "./bundleItems.validator";

@injectable()
export class RetailBundleItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_BUNDLE_ITEMS_TYPES.Controller) private bundleItemsController: RetailBundleItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "bundle-items": ["read"] }),
      zodValidate(bundleItemsQuerySchema, "query"),
      this.bundleItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "bundle-items": ["create"] }),
      zodValidate(bundleItemsBodySchema, "body"),
      this.bundleItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "bundle-items": ["read"] }),
      zodValidate(bundleItemsIdParamsSchema, "params"),
      this.bundleItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "bundle-items": ["update"] }),
      zodValidate(bundleItemsIdParamsSchema, "params"),
      zodValidate(bundleItemsBodySchema, "body"),
      this.bundleItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "bundle-items": ["delete"] }),
      zodValidate(bundleItemsIdParamsSchema, "params"),
      this.bundleItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
