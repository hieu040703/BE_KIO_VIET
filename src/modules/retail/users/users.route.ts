import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailUsersController } from "./users.controller";
import { RETAIL_USERS_TYPES } from "./users.types";
import { usersBodySchema, usersIdParamsSchema, usersQuerySchema } from "./users.validator";

@injectable()
export class RetailUsersRouter {
  private router: Router;

  constructor(@inject(RETAIL_USERS_TYPES.Controller) private usersController: RetailUsersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "users": ["read"] }),
      zodValidate(usersQuerySchema, "query"),
      this.usersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "users": ["create"] }),
      zodValidate(usersBodySchema, "body"),
      this.usersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "users": ["read"] }),
      zodValidate(usersIdParamsSchema, "params"),
      this.usersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "users": ["update"] }),
      zodValidate(usersIdParamsSchema, "params"),
      zodValidate(usersBodySchema, "body"),
      this.usersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "users": ["delete"] }),
      zodValidate(usersIdParamsSchema, "params"),
      this.usersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
