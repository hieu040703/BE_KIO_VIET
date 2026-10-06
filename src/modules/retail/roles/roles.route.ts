import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailRolesController } from "./roles.controller";
import { RETAIL_ROLES_TYPES } from "./roles.types";
import { rolesBodySchema, rolesIdParamsSchema, rolesQuerySchema } from "./roles.validator";

@injectable()
export class RetailRolesRouter {
  private router: Router;

  constructor(@inject(RETAIL_ROLES_TYPES.Controller) private rolesController: RetailRolesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "roles": ["read"] }),
      zodValidate(rolesQuerySchema, "query"),
      this.rolesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "roles": ["create"] }),
      zodValidate(rolesBodySchema, "body"),
      this.rolesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "roles": ["read"] }),
      zodValidate(rolesIdParamsSchema, "params"),
      this.rolesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "roles": ["update"] }),
      zodValidate(rolesIdParamsSchema, "params"),
      zodValidate(rolesBodySchema, "body"),
      this.rolesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "roles": ["delete"] }),
      zodValidate(rolesIdParamsSchema, "params"),
      this.rolesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
