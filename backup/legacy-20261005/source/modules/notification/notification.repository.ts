import { BaseRepository } from "@/shared/base/BaseRepository";
import { Notification } from "@/database/models/Notification";
import { EntityManager, FindOptionsSelect } from "typeorm";
import { NotificationSelectFull, NotificationRelations } from "./notification.select";
import { NotificationQueryDto } from "./notification.validator";
import { inject } from "inversify";
import { NOTIFICATION_DETAIL_TYPES } from "../notificationDetail/notificationDetail.types";
import { NotificationDetailRepository } from "../notificationDetail/notificationDetail.repository";

export class NotificationRepository extends BaseRepository<Notification> {
  protected entityClass = Notification;
  protected selectedFields = NotificationSelectFull;
  protected relations = NotificationRelations;

  constructor(
    @inject(NOTIFICATION_DETAIL_TYPES.NotificationDetailRepository)
    private notificationDetailRepository: NotificationDetailRepository,
  ) {
    super();
  }

  setOptions(selectedFields?: FindOptionsSelect<Notification> | undefined): void {
    this.selectedFields = selectedFields || NotificationSelectFull;
    this.relations = NotificationRelations;
  }

  async getNotificationsForUser(userId: string, data: NotificationQueryDto, manager?: EntityManager) {
    const page = data.page || 1;
    const size = data.size || 10;

    const qb = this.notificationDetailRepository.getRepository(manager).createQueryBuilder("notificationDetail");

    qb.innerJoinAndSelect("notificationDetail.notification", "notification");
    qb.where("notificationDetail.userId = :userId", { userId });
    if (data.isRead !== undefined) {
      qb.andWhere("notificationDetail.isRead = :isRead", { isRead: data.isRead });
    }
    qb.orderBy("notification.timeAt", "DESC");
    qb.take(size);
    qb.skip((page - 1) * size);

    const result = await qb.getManyAndCount();

    // Get notification entity metadata for type conversion
    const notificationRepo = this.getRepository(manager);
    const metadata = notificationRepo.metadata;

    const notifications = result[0].map((detail) => {
      const notification = detail.notification;

      if (notification) {
        // Convert all varchar/text/char fields from number to string
        const notificationRecord = notification as Record<string, any>;
        metadata.columns.forEach((column) => {
          const propertyName = column.propertyName;
          const columnType = column.type;

          if (
            (columnType === "varchar" || columnType === "text" || columnType === "char") &&
            propertyName in notification &&
            notificationRecord[propertyName] !== null &&
            notificationRecord[propertyName] !== undefined &&
            typeof notificationRecord[propertyName] === "number"
          ) {
            notificationRecord[propertyName] = String(notificationRecord[propertyName]);
          }
        });
      }

      return {
        ...notification,
        isRead: detail.isRead,
      };
    });
    const total = result[1];

    const totalUnread = await qb.clone().andWhere("notificationDetail.isRead = :isRead", { isRead: false }).getCount();

    return {
      data: notifications,
      total: total,
      page: page,
      size: size,
      totalUnread: totalUnread,
    };
  }
}
