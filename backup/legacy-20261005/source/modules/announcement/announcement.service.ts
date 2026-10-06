import { Request } from "express";
import { DeepPartial } from "typeorm";
import { inject, injectable } from "inversify";
import { Announcement } from "@/database/models/Announcement";
import { ANNOUNCEMENT_TYPES } from "./announcement.types";
import { AnnouncementRepository } from "./announcement.repository";
import { AnnouncementRelations, AnnouncementSelectFull } from "./announcement.select";
import { BaseService } from "@/shared/base/BaseService";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/shared/types/errors";
import { AnnouncementStatusEnum, NotificationTypeEnum } from "@/shared/constants/constance";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { NotificationService } from "@/modules/notification/notification.service";
import { USER_TYPES } from "@/modules/user/user.types";
import { UserRepository } from "@/modules/user/user.repository";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";

@injectable()
export class AnnouncementService extends BaseService<Announcement> {
  protected relations = AnnouncementRelations;
  protected selectedFields = AnnouncementSelectFull;
  protected searchableFields = ["title"] as (keyof Announcement)[] & string[];

  constructor(
    @inject(ANNOUNCEMENT_TYPES.AnnouncementRepository) private announcementRepository: AnnouncementRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(NOTIFICATION_TYPES.NotificationService) private notificationService: NotificationService,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
  ) {
    super(announcementRepository);
  }

  private getNotificationContent(html: string): string {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);
  }

  async create(
    data: DeepPartial<Announcement>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<Announcement>> {
    return super.create(
      {
        ...data,
        sentAt: null,
        sentBy: null,
        status: AnnouncementStatusEnum.DRAFT,
      },
      req,
      manager,
    );
  }

  async validateBeforeUpdate(
    id: string,
    _data: Partial<Announcement>,
    _req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const announcement = await this.announcementRepository.findById(id, manager);
    if (!announcement) {
      throw new NotFoundError("Không tìm thấy thông báo");
    }

    if (announcement.status === AnnouncementStatusEnum.SENT) {
      throw new BadRequestError("Không thể chỉnh sửa thông báo đã gửi");
    }
  }

  async sendAnnouncement(id: string, userId?: string, req?: Request): Promise<ApiResponse<Announcement>> {
    if (!userId) {
      throw new UnauthorizedError("Bạn chưa đăng nhập");
    }

    const execute = async (manager: IEntityManager) => {
      const announcement = await this.announcementRepository.findById(id, manager, false, req);
      if (!announcement) {
        throw new NotFoundError("Không tìm thấy thông báo");
      }

      if (announcement.status === AnnouncementStatusEnum.SENT) {
        throw new BadRequestError("Thông báo này đã được gửi rồi");
      }

      const customerUserIds = await this.userRepository.findAllCustomerUserIds();
      const content = this.getNotificationContent(announcement.content) || announcement.title;

      if (customerUserIds.length > 0) {
        await this.notificationService.createNotificationForMultipleUsers(
          customerUserIds,
          {
            title: announcement.title,
            content,
            type: NotificationTypeEnum.SYSTEM,
            objectId: id,
            metadata: { announcementId: id, type: "ANNOUNCEMENT" },
          },
          manager as any,
          { sendSocket: false },
        );
      }

      await this.announcementRepository.update(
        id,
        {
          status: AnnouncementStatusEnum.SENT,
          sentAt: new Date(),
          sentBy: userId,
        },
        manager,
      );

      const fullData = await this.announcementRepository.findById(id, manager, false, req);
      if (!fullData) {
        throw new NotFoundError("Không tìm thấy thông báo");
      }

      return {
        announcement: fullData,
        customerUserIds,
        content,
      };
    };

    const result = await this.transactionManager.withTransactionCallback(execute);

    await Promise.allSettled(
      result.customerUserIds.map((customerUserId) =>
        FirebaseUtils.SentFirebaseWithUser({
          userId: customerUserId,
          title: result.announcement.title,
          content: result.content,
          data: { announcementId: id, type: "ANNOUNCEMENT" },
        }),
      ),
    );

    return ApiResponseHandler.updateSuccess("OK", result.announcement);
  }
}
