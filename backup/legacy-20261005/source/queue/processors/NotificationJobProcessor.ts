import { Job } from "bull";
import { JobProcessor } from "../base/BaseQueue";
import { NotificationRepository } from "@/modules/notification/notification.repository";
import { CreateNotificationDto } from "@/modules/notification/notification.validator";
import { SocketData, SocketUtils } from "@/shared/utils/socket.utils";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { container } from "@/modules/container";

export class NotificationJobProcessor implements JobProcessor<CreateNotificationDto[]> {
  async process(job: Job<CreateNotificationDto[]>): Promise<any> {
    const notificationData = job.data;

    // Get notification repository from container
    const notificationRepo = container.get<NotificationRepository>(NOTIFICATION_TYPES.NotificationRepository);

    // Create notification in database
    const notifications = await notificationRepo.createMany(notificationData);

    console.log(
      `Notifications created successfully:`,
      notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        jobId: job.id,
      })),
    );

    const dataSocket: SocketData = {
      type: notificationData[0].type,
      timeAt: new Date(),
      title: notificationData[0].title,
      content: notificationData[0].content,
    };

    return notifications;
  }
}
