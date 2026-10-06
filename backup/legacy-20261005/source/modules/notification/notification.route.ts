import { Router } from "express";
import { injectable, inject } from "inversify";
import { NotificationController } from "./notification.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateNotificationSchema,
  UpdateNotificationSchema,
  NotificationQuerySchema,
  NotificationParamsSchema,
} from "./notification.validator";
import { NOTIFICATION_TYPES } from "./notification.types";

@injectable()
export class NotificationRouter {
  private router: Router;

  constructor(
    @inject(NOTIFICATION_TYPES.NotificationController) private notificationController: NotificationController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /notifications - Get all notifications with filters
    this.router.get(
      "/",
      zodValidate(NotificationQuerySchema, "query"),
      this.notificationController.getNotificationsForUser,
    );

    // POST /notifications/mark-all-as-read - Mark all notifications as read
    this.router.post("/mark-all-as-read", this.notificationController.markAllAsRead);

    // POST /notifications/test-send - Test sending a notification
    this.router.post("/test-send", this.notificationController.testSendNotification);

    // POST /notifications - Create new notification
    this.router.post("/", zodValidate(CreateNotificationSchema, "body"), this.notificationController.create);

    // GET /notifications/:id - Get notification by ID
    this.router.get("/:id", zodValidate(NotificationParamsSchema, "params"), this.notificationController.getById);

    // POST /notifications/mark-as-read/:id - Mark a notification as read
    this.router.post(
      "/:id/mark-as-read",
      zodValidate(NotificationParamsSchema, "params"),
      this.notificationController.markAsRead,
    );

    // PUT /notifications/:id - Update notification
    this.router.put(
      "/:id",
      zodValidate(NotificationParamsSchema, "params"),
      zodValidate(UpdateNotificationSchema, "body"),
      this.notificationController.update,
    );

    // DELETE /notifications/:id - Delete notification
    this.router.delete("/:id", zodValidate(NotificationParamsSchema, "params"), this.notificationController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
