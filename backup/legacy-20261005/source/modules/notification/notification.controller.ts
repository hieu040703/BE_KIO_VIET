import { injectable, inject } from "inversify";
import { NotificationService } from "./notification.service";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Request, Response } from "express";
import { NOTIFICATION_TYPES } from "./notification.types";

@injectable()
export class NotificationController extends BaseController<NotificationService> {
  constructor(@inject(NOTIFICATION_TYPES.NotificationService) protected service: NotificationService) {
    super(service);
  }

  getNotificationsForUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = req.query;

    try {
      const result = await this.service.getNotificationsForUser(userId, data);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notificationId = req.params.id as string;
      const result = await this.service.markAsRead(notificationId, userId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await this.service.markAllAsRead(userId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  testSendNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await this.service.testSendNotification(userId, req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
