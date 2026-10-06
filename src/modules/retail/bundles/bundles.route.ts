import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailBundlesController } from "./bundles.controller";
import { RETAIL_BUNDLES_TYPES } from "./bundles.types";
import { bundlesBodySchema, bundlesIdParamsSchema, bundlesQuerySchema } from "./bundles.validator";

@injectable()
export class RetailBundlesRouter {
  private router: Router;

  constructor(@inject(RETAIL_BUNDLES_TYPES.Controller) private bundlesController: RetailBundlesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "bundles": ["read"] }),
      zodValidate(bundlesQuerySchema, "query"),
      this.bundlesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "bundles": ["create"] }),
      zodValidate(bundlesBodySchema, "body"),
      this.bundlesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "bundles": ["read"] }),
      zodValidate(bundlesIdParamsSchema, "params"),
      this.bundlesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "bundles": ["update"] }),
      zodValidate(bundlesIdParamsSchema, "params"),
      zodValidate(bundlesBodySchema, "body"),
      this.bundlesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "bundles": ["delete"] }),
      zodValidate(bundlesIdParamsSchema, "params"),
      this.bundlesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
