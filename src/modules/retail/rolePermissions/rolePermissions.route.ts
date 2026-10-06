import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailRolePermissionsController } from "./rolePermissions.controller";
import { RETAIL_ROLE_PERMISSIONS_TYPES } from "./rolePermissions.types";
import { rolePermissionsBodySchema, rolePermissionsIdParamsSchema, rolePermissionsQuerySchema } from "./rolePermissions.validator";

@injectable()
export class RetailRolePermissionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_ROLE_PERMISSIONS_TYPES.Controller) private rolePermissionsController: RetailRolePermissionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "role-permissions": ["read"] }),
      zodValidate(rolePermissionsQuerySchema, "query"),
      this.rolePermissionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "role-permissions": ["create"] }),
      zodValidate(rolePermissionsBodySchema, "body"),
      this.rolePermissionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "role-permissions": ["read"] }),
      zodValidate(rolePermissionsIdParamsSchema, "params"),
      this.rolePermissionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "role-permissions": ["update"] }),
      zodValidate(rolePermissionsIdParamsSchema, "params"),
      zodValidate(rolePermissionsBodySchema, "body"),
      this.rolePermissionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "role-permissions": ["delete"] }),
      zodValidate(rolePermissionsIdParamsSchema, "params"),
      this.rolePermissionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
