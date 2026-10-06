import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailUserSessionsController } from "./userSessions.controller";
import { RETAIL_USER_SESSIONS_TYPES } from "./userSessions.types";
import { userSessionsBodySchema, userSessionsIdParamsSchema, userSessionsQuerySchema } from "./userSessions.validator";

@injectable()
export class RetailUserSessionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_USER_SESSIONS_TYPES.Controller) private userSessionsController: RetailUserSessionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "user-sessions": ["read"] }),
      zodValidate(userSessionsQuerySchema, "query"),
      this.userSessionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "user-sessions": ["create"] }),
      zodValidate(userSessionsBodySchema, "body"),
      this.userSessionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "user-sessions": ["read"] }),
      zodValidate(userSessionsIdParamsSchema, "params"),
      this.userSessionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "user-sessions": ["update"] }),
      zodValidate(userSessionsIdParamsSchema, "params"),
      zodValidate(userSessionsBodySchema, "body"),
      this.userSessionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "user-sessions": ["delete"] }),
      zodValidate(userSessionsIdParamsSchema, "params"),
      this.userSessionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
