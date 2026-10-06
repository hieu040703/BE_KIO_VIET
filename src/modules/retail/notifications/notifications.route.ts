import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailNotificationsController } from "./notifications.controller";
import { RETAIL_NOTIFICATIONS_TYPES } from "./notifications.types";
import { notificationsBodySchema, notificationsIdParamsSchema, notificationsQuerySchema } from "./notifications.validator";

@injectable()
export class RetailNotificationsRouter {
  private router: Router;

  constructor(@inject(RETAIL_NOTIFICATIONS_TYPES.Controller) private notificationsController: RetailNotificationsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "notifications": ["read"] }),
      zodValidate(notificationsQuerySchema, "query"),
      this.notificationsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "notifications": ["create"] }),
      zodValidate(notificationsBodySchema, "body"),
      this.notificationsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "notifications": ["read"] }),
      zodValidate(notificationsIdParamsSchema, "params"),
      this.notificationsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "notifications": ["update"] }),
      zodValidate(notificationsIdParamsSchema, "params"),
      zodValidate(notificationsBodySchema, "body"),
      this.notificationsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "notifications": ["delete"] }),
      zodValidate(notificationsIdParamsSchema, "params"),
      this.notificationsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
