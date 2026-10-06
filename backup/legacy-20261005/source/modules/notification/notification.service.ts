import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { NotificationRepository } from "./notification.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { Notification } from "@/database/models/Notification";
import { NotificationRelations, NotificationSelectBasic } from "./notification.select";
import { UserRepository } from "../user/user.repository";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import { NOTIFICATION_TYPES } from "./notification.types";
import { COMMON_TYPES } from "../common/common.types";
import { USER_TYPES } from "../user/user.types";
import { EntityManager } from "typeorm";
import { NOTIFICATION_DETAIL_TYPES } from "../notificationDetail/notificationDetail.types";
import { NotificationDetailRepository } from "../notificationDetail/notificationDetail.repository";
import { CreateNotificationDto, NotificationQueryDto } from "./notification.validator";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { TimeUtils } from "@/shared/utils/time.utils";
import { formatAlertNotificationTitle, formatOrderNotificationTitle } from "@/shared/utils/notification.utils";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { IFindOptions } from "@/shared/types/interfaces";
import { NotificationTypeEnum } from "@/shared/constants/constance";

@injectable()
export class NotificationService extends BaseService<Notification> {
  protected relations = NotificationRelations;
  protected selectedFields = NotificationSelectBasic;
  constructor(
    @inject(NOTIFICATION_TYPES.NotificationRepository) private notificationRepository: NotificationRepository,
    @inject(NOTIFICATION_DETAIL_TYPES.NotificationDetailRepository)
    private notificationDetailRepository: NotificationDetailRepository,
    @inject(COMMON_TYPES.FirebaseUtils) private firebaseUtils: FirebaseUtils,
    @inject(USER_TYPES.UserRepository) private userRepo: UserRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(notificationRepository);
  }

  private uniqueUserIds(userIds: string[]): string[] {
    return [...new Set(userIds.filter(Boolean))];
  }

  async getNotificationsForUser(userId: string, data: NotificationQueryDto, manager?: EntityManager) {
    const result = await this.notificationRepository.getNotificationsForUser(userId, data, manager);

    return ApiResponseHandler.getSuccess(
      "OK",
      result.data,
      {
        totalRecords: result.total,
        currentPage: result.page,
        size: result.size,
        totalPages: Math.ceil(result.total / result.size),
      },
      {
        totalUnread: result.totalUnread,
      },
    );
  }

  async createNotificationForMultipleUsers(
    userIds: string[],
    data: CreateNotificationDto,
    manager?: EntityManager,
    options?: { sendSocket?: boolean; sendFirebase?: boolean; orderCode?: string | null },
  ) {
    const execute = async (txManager: EntityManager) => {
      const uniqueUserIds = this.uniqueUserIds(userIds);
      if (uniqueUserIds.length === 0) {
        throw new BadRequestError("Danh sách người nhận thông báo không hợp lệ");
      }

      const now = TimeUtils.getTime().toDate();
      const title = data.type === NotificationTypeEnum.ALERT ? formatAlertNotificationTitle(data.title) : data.title;
      Object.assign(data, {
        title: formatOrderNotificationTitle(options?.orderCode, title),
        timeAt: now,
      });

      const notification = await this.notificationRepository.create(data, txManager);

      const dataDetails = uniqueUserIds.map((userId) => {
        return {
          userId: userId,
          notificationId: notification.id,
          isRead: false,
        };
      });

      await this.notificationDetailRepository.createMany(dataDetails, txManager);

      if (options?.sendSocket !== false) {
        const socketNotification = {
          id: notification.id,
          title: notification.title ?? data.title,
          content: notification.content ?? data.content,
          type: notification.type ?? data.type,
          timeAt: notification.timeAt ?? data.timeAt ?? now,
          objectId: notification.objectId ?? data.objectId ?? null,
          metadata: notification.metadata ?? data.metadata ?? null,
          createdAt: notification.createdAt ?? now,
          updatedAt: notification.updatedAt ?? notification.createdAt ?? now,
          isRead: false,
        };

        SocketUtils.sendSocketToMultipleUsers("notification", uniqueUserIds, socketNotification);
      }

      //? Gửi Firebase push notification cho từng user. Mặc định bật để callers
      //? không phải gọi FirebaseUtils.SentFirebaseWithUser riêng sau đó.
      //? Tắt bằng options.sendFirebase = false nếu caller muốn xử lý riêng.
      if (options?.sendFirebase !== false) {
        //? FCM data yêu cầu string values → stringify các field không phải string.
        const firebaseData: Record<string, string> = {
          type: String(data.type ?? ""),
          notificationId: notification.id,
          objectId: data.objectId ? String(data.objectId) : "",
          timeAt: now.toISOString(),
        };
        if (data.metadata && typeof data.metadata === "object") {
          for (const [key, value] of Object.entries(data.metadata)) {
            if (value === undefined || value === null) continue;
            firebaseData[key] = typeof value === "string" ? value : JSON.stringify(value);
          }
        }

        await Promise.all(
          uniqueUserIds.map((userId) =>
            FirebaseUtils.SentFirebaseWithUser({
              userId,
              orderCode: options?.orderCode,
              title: data.title,
              content: data.content,
              data: firebaseData,
            }).catch((err) => {
              //? Không để 1 user lỗi Firebase chặn luồng tạo notification.
              console.error(`[NotificationService] Firebase send failed for user ${userId}:`, err);
            }),
          ),
        );
      }

      return ApiResponseHandler.createSuccess("OK", notification);
    };

    if (manager) {
      return await execute(manager);
    }

    return await this.transactionManager.withTransaction((tx) => execute(tx.manager));
  }

  //? Mark notification as read
  async markAsRead(id: string, userId: string, manager?: EntityManager) {
    const notificationDetail = await this.notificationDetailRepository.findOne(
      {
        notificationId: id,
        userId: userId,
      },
      manager,
    );

    if (!notificationDetail) {
      throw new NotFoundError("Thông báo không còn tồn tại");
    }

    if (notificationDetail.isRead) {
      return ApiResponseHandler.updateSuccess("OK", true);
    }

    await this.notificationDetailRepository.update(notificationDetail.id, { isRead: true }, manager);

    return ApiResponseHandler.updateSuccess("OK", true);
  }

  //? Mark all notifications as read for a user
  async markAllAsRead(userId: string, manager?: EntityManager) {
    console.log("markAllAsRead", userId);
    const unreadCount = await this.notificationDetailRepository.count({ userId: userId, isRead: false }, manager);
    if (unreadCount === 0) {
      return ApiResponseHandler.createSuccess("OK", true);
    }
    await this.notificationDetailRepository.updateOptions({ isRead: true }, { userId: userId, isRead: false }, manager);

    return ApiResponseHandler.createSuccess("OK", true);
  }

  //? Count unread notifications for a user
  async countUnreadNotifications(userId: string, manager?: EntityManager) {
    const count = await this.notificationDetailRepository.count({ userId: userId, isRead: false }, manager);
    return ApiResponseHandler.getSuccess("OK", count);
  }

  //? test send notification
  async testSendNotification(userId: string, data: CreateNotificationDto, manager?: EntityManager) {
    const execute = async (txManager: EntityManager) => {
      const now = TimeUtils.getTime().toDate();
      Object.assign(data, {
        title: data.type === NotificationTypeEnum.ALERT ? formatAlertNotificationTitle(data.title) : data.title,
        timeAt: now,
      });

      const notification = await this.notificationRepository.create(data, txManager);

      const dataDetail = {
        userId: userId,
        notificationId: notification.id,
        isRead: false,
      };

      await this.notificationDetailRepository.create(dataDetail, txManager);

      // sent socket notification

      SocketUtils.sendSocketToUser("notification", userId, {
        title: data.title,
        content: data.content,
        type: data.type,
        timeAt: now,
      });

      return ApiResponseHandler.createSuccess("OK", notification);
    };

    if (manager) {
      return await execute(manager);
    }

    return await this.transactionManager.withTransaction((tx) => execute(tx.manager));
  }
}
