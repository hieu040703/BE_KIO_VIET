import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailUserRolesController } from "./userRoles.controller";
import { RETAIL_USER_ROLES_TYPES } from "./userRoles.types";
import { userRolesBodySchema, userRolesIdParamsSchema, userRolesQuerySchema } from "./userRoles.validator";

@injectable()
export class RetailUserRolesRouter {
  private router: Router;

  constructor(@inject(RETAIL_USER_ROLES_TYPES.Controller) private userRolesController: RetailUserRolesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "user-roles": ["read"] }),
      zodValidate(userRolesQuerySchema, "query"),
      this.userRolesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "user-roles": ["create"] }),
      zodValidate(userRolesBodySchema, "body"),
      this.userRolesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "user-roles": ["read"] }),
      zodValidate(userRolesIdParamsSchema, "params"),
      this.userRolesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "user-roles": ["update"] }),
      zodValidate(userRolesIdParamsSchema, "params"),
      zodValidate(userRolesBodySchema, "body"),
      this.userRolesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "user-roles": ["delete"] }),
      zodValidate(userRolesIdParamsSchema, "params"),
      this.userRolesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
