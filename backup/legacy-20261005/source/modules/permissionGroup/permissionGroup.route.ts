import { Router } from "express";
import { injectable, inject } from "inversify";
import { PermissionGroupController } from "./permissionGroup.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreatePermissionGroupSchema,
  UpdatePermissionGroupSchema,
  PermissionGroupQuerySchema,
  PermissionGroupParamsSchema,
} from "./permissionGroup.validator";
import { PERMISSION_GROUP_TYPES } from "./permissionGroup.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class PermissionGroupRouter {
  private router: Router;

  constructor(
    @inject(PERMISSION_GROUP_TYPES.PermissionGroupController)
    private permissionGroupController: PermissionGroupController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All permissionGroup routes require authentication
    // this.router.use(authenticate);

    // GET /permissionGroups - Get all permissionGroups with filters
    this.router.get(
      "/",
      permissionMiddleware({ permission: ["read"] }),
      zodValidate(PermissionGroupQuerySchema, "query"),
      this.permissionGroupController.getAllWithPagination,
    );

    // POST /permissionGroups - Create new permissionGroup
    this.router.post(
      "/",
      permissionMiddleware({ permission: ["create"] }),
      zodValidate(CreatePermissionGroupSchema, "body"),
      this.permissionGroupController.create,
    );

    // GET /permissionGroups/:id - Get permissionGroup by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ permission: ["read"] }),
      zodValidate(PermissionGroupParamsSchema, "params"),
      this.permissionGroupController.getById,
    );

    // PUT /permissionGroups/:id - Update permissionGroup
    this.router.put(
      "/:id",
      permissionMiddleware({ permission: ["update"] }),
      zodValidate(PermissionGroupParamsSchema, "params"),
      zodValidate(UpdatePermissionGroupSchema, "body"),
      this.permissionGroupController.update,
    );

    // DELETE /permissionGroups/:id - Delete permissionGroup
    this.router.delete(
      "/:id",
      permissionMiddleware({ permission: ["delete"] }),
      zodValidate(PermissionGroupParamsSchema, "params"),
      this.permissionGroupController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
