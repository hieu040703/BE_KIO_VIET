import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPermissionsController } from "./permissions.controller";
import { RETAIL_PERMISSIONS_TYPES } from "./permissions.types";
import { permissionsBodySchema, permissionsIdParamsSchema, permissionsQuerySchema } from "./permissions.validator";

@injectable()
export class RetailPermissionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PERMISSIONS_TYPES.Controller) private permissionsController: RetailPermissionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "permissions": ["read"] }),
      zodValidate(permissionsQuerySchema, "query"),
      this.permissionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "permissions": ["create"] }),
      zodValidate(permissionsBodySchema, "body"),
      this.permissionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "permissions": ["read"] }),
      zodValidate(permissionsIdParamsSchema, "params"),
      this.permissionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "permissions": ["update"] }),
      zodValidate(permissionsIdParamsSchema, "params"),
      zodValidate(permissionsBodySchema, "body"),
      this.permissionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "permissions": ["delete"] }),
      zodValidate(permissionsIdParamsSchema, "params"),
      this.permissionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
