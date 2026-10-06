import { container } from "@/modules/container";
import { NotificationService } from "@/modules/notification/notification.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { AdminServiceOrderRepository } from "@/modules/serviceOrder/admin.serviceOrder.repository";
import { SERVICE_ORDER_TYPES } from "@/modules/serviceOrder/serviceOrder.types";
import { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import { NotificationTypeEnum, ServiceOrderStatusEnum } from "@/shared/constants/constance";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";

const ASSIGNMENT_TIMEOUT_MS = 5 * 60 * 1000;
const ASSIGNMENT_TIMEOUT_MINUTES = ASSIGNMENT_TIMEOUT_MS / (60 * 1000);
let isProcessing = false;

async function processServiceOrderAssignmentTimeouts() {
  if (isProcessing) {
    logger.warn("Skip JobServiceOrderAssignmentTimeout because previous run is still processing");
    return;
  }

  isProcessing = true;

  try {
    const serviceOrderRepository = container.get<AdminServiceOrderRepository>(
      SERVICE_ORDER_TYPES.AdminServiceOrderRepository,
    );
    const userRepository = container.get<UserRepository>(USER_TYPES.UserRepository);
    const notificationService = container.get<NotificationService>(NOTIFICATION_TYPES.NotificationService);

    const serviceOrders = await serviceOrderRepository
      .getRepository()
      .createQueryBuilder("serviceOrder")
      .select([
        "serviceOrder.id",
        "serviceOrder.status",
        "serviceOrder.branchId",
        "serviceOrder.employeeId",
        "serviceOrder.updatedAt",
      ])
      .where("serviceOrder.status IN (:...statuses)", {
        statuses: [
          ServiceOrderStatusEnum.WAITING_FOR_QUOTE,
          ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION,
        ],
      })
      .andWhere("serviceOrder.branchId IS NOT NULL")
      .andWhere("serviceOrder.deletedAt IS NULL")
      .andWhere(`serviceOrder.updatedAt <= NOW() - INTERVAL '${ASSIGNMENT_TIMEOUT_MINUTES} minutes'`)
      .getMany();

    if (serviceOrders.length === 0) return;

    const adminIds = await userRepository.findAllAdminUserIds();

    for (const serviceOrder of serviceOrders) {
      const previousBranchId = serviceOrder.branchId;
      const previousEmployeeId = serviceOrder.employeeId;
      const previousUpdatedAt = serviceOrder.updatedAt;

      const result = await serviceOrderRepository
        .getRepository()
        .createQueryBuilder()
        .update()
        .set({
          branchId: null,
          employeeId: null,
        })
        .where("id = :id", { id: serviceOrder.id })
        .andWhere('"branchId" = :branchId', { branchId: previousBranchId })
        .andWhere("status IN (:...statuses)", {
          statuses: [
            ServiceOrderStatusEnum.WAITING_FOR_QUOTE,
            ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION,
          ],
        })
        .andWhere('"updatedAt" = :updatedAt', { updatedAt: previousUpdatedAt })
        .andWhere('"deletedAt" IS NULL')
        .execute();

      if (!result.affected) continue;

      const title = "Đơn dịch vụ chưa được xác nhận";
      const content =
        `Đơn dịch vụ đã quá ${ASSIGNMENT_TIMEOUT_MINUTES} phút nhưng quản lý chưa xử lý. Hệ thống đã bỏ chi nhánh được gắn tự động, vui lòng gắn đơn thủ công.`;

      if (adminIds.length > 0) {
        await notificationService.createNotificationForMultipleUsers(adminIds, {
          title,
          content,
          type: NotificationTypeEnum.SYSTEM,
          objectId: serviceOrder.id,
          metadata: {
            serviceOrderId: serviceOrder.id,
            event: "SERVICE_ORDER_ASSIGNMENT_TIMEOUT",
            previousBranchId,
            previousEmployeeId,
            status: serviceOrder.status,
          },
        });

        adminIds.forEach((userId) => {
          FirebaseUtils.SentFirebaseWithUser({
            userId,
            title,
            content,
            data: {
              type: NotificationTypeEnum.SYSTEM,
              serviceOrderId: serviceOrder.id,
              event: "SERVICE_ORDER_ASSIGNMENT_TIMEOUT",
            },
          });
        });
      }
    }
  } catch (error) {
    logger.error("Error in JobServiceOrderAssignmentTimeout:", error);
  } finally {
    isProcessing = false;
  }
}

let job: Cron | null = null;

export const JobServiceOrderAssignmentTimeout = {
  start: () => {
    if (!job) {
      job = new Cron("*/10 * * * * *", { timezone: "Asia/Ho_Chi_Minh" }, async () => {
        await processServiceOrderAssignmentTimeouts();
      });
      logger.info("START JOB SERVICE ORDER ASSIGNMENT TIMEOUT");
    }
  },
  stop: () => {
    if (job) {
      job.stop();
      job = null;
      logger.info("STOP JOB SERVICE ORDER ASSIGNMENT TIMEOUT");
    }
  },
};
