import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailNotificationRecipientsController } from "./notificationRecipients.controller";
import { RETAIL_NOTIFICATION_RECIPIENTS_TYPES } from "./notificationRecipients.types";
import { notificationRecipientsBodySchema, notificationRecipientsIdParamsSchema, notificationRecipientsQuerySchema } from "./notificationRecipients.validator";

@injectable()
export class RetailNotificationRecipientsRouter {
  private router: Router;

  constructor(@inject(RETAIL_NOTIFICATION_RECIPIENTS_TYPES.Controller) private notificationRecipientsController: RetailNotificationRecipientsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "notification-recipients": ["read"] }),
      zodValidate(notificationRecipientsQuerySchema, "query"),
      this.notificationRecipientsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "notification-recipients": ["create"] }),
      zodValidate(notificationRecipientsBodySchema, "body"),
      this.notificationRecipientsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "notification-recipients": ["read"] }),
      zodValidate(notificationRecipientsIdParamsSchema, "params"),
      this.notificationRecipientsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "notification-recipients": ["update"] }),
      zodValidate(notificationRecipientsIdParamsSchema, "params"),
      zodValidate(notificationRecipientsBodySchema, "body"),
      this.notificationRecipientsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "notification-recipients": ["delete"] }),
      zodValidate(notificationRecipientsIdParamsSchema, "params"),
      this.notificationRecipientsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
