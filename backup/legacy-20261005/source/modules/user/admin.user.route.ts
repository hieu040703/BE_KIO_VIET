import { Router } from "express";
import { injectable, inject } from "inversify";
import { UserController } from "./user.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateUserSchema,
  UserQuerySchema,
  UserParamsSchema,
  UpdateManagerSchema,
  UserActionSchema,
} from "./user.validator";
import { USER_TYPES } from "./user.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class AdminUserRouter {
  private router: Router;

  constructor(@inject(USER_TYPES.UserController) private userController: UserController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /users - Get all users with filters
    this.router.get(
      "/",
      permissionMiddleware({ user: ["read"] }),
      zodValidate(UserQuerySchema, "query"),
      this.userController.getAllWithPagination,
    );

    // POST /users - Create a new user
    this.router.post(
      "/",
      permissionMiddleware({ user: ["create"] }),
      zodValidate(CreateUserSchema, "body"),
      this.userController.createManage,
    );

    // PUT /users/:id - Update user by ID
    this.router.put(
      "/:id",
      permissionMiddleware({ user: ["update"] }),
      zodValidate(UserParamsSchema, "params"),
      zodValidate(UpdateManagerSchema, "body"),
      this.userController.updateManager,
    );

    // GET /users/:id - Get user by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ user: ["read"] }),
      zodValidate(UserParamsSchema, "params"),
      this.userController.getById,
    );

    // DELETE /users/:id - Delete user by ID
    this.router.delete(
      "/:id",
      permissionMiddleware({ user: ["delete"] }),
      zodValidate(UserParamsSchema, "params"),
      this.userController.delete,
    );

    // POST /users/:id/action - Activate / deactivate user (toggle isActive)
    this.router.post(
      "/:id/action",
      permissionMiddleware({ user: ["update"] }),
      zodValidate(UserParamsSchema, "params"),
      zodValidate(UserActionSchema, "body"),
      this.userController.userAction,
    );

    // POST /users/:id/reset-password - Đặt lại mật khẩu về giá trị mặc định
    this.router.post(
      "/:id/reset-password",
      permissionMiddleware({ user: ["resetPassword"] }),
      zodValidate(UserParamsSchema, "params"),
      this.userController.resetPassword,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
