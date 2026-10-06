import { container } from "@/modules/container";
import type { NotificationService } from "@/modules/notification/notification.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import type { CreateNotificationDto } from "@/modules/notification/notification.validator";
import type { OrderRepository } from "@/modules/order/order.repository";
import { ORDER_TYPES } from "@/modules/order/order.types";
import type { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import { BranchManagerConfirmStatusEnum, NotificationTypeEnum, OrderStatusEnum } from "@/shared/constants/constance";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";

export const ORDER_BRANCH_MANAGER_CONFIRMATION_NOTIFICATION_CRON = "0 */5 * * * *";

export interface OrderBranchManagerConfirmationOrder {
  id: string;
  code: string;
  branchManagerId?: string | null;
  branchManagerZaloName?: string | null;
}

export interface OrderBranchManagerConfirmationJobDeps {
  findEligibleOrders: () => Promise<OrderBranchManagerConfirmationOrder[]>;
  findAdminUserIds: () => Promise<string[]>;
  findUserIdsByEmployeeIds: (employeeIds: string[]) => Promise<string[]>;
  createNotification: (userIds: string[], data: CreateNotificationDto, orderCode: string) => Promise<unknown>;
}

export interface ProcessOrderBranchManagerConfirmationNotificationsResult {
  ordersChecked: number;
  notifiedCount: number;
  skippedEmptyRecipientCount: number;
}

interface RawOrderBranchManagerConfirmationRow {
  order_id: string;
  order_code: string;
  branch_manager_id: string | null;
  branch_manager_zalo_name: string | null;
}

const uniqueIds = (ids: Array<string | null | undefined>): string[] => [
  ...new Set(ids.filter((id): id is string => Boolean(id))),
];

function buildAdminNotificationPayload(order: OrderBranchManagerConfirmationOrder): CreateNotificationDto {
  const branchManagerName = order.branchManagerZaloName || "chi nhánh";

  return {
    title: `Quản lý ${branchManagerName} chưa xác nhận đơn hàng`,
    content: "Vui lòng kiểm tra và nhắc quản lý chi nhánh xác nhận đơn hàng.",
    type: NotificationTypeEnum.ALERT,
    objectId: order.id,
    metadata: {
      orderId: order.id,
      orderCode: order.code,
    },
  };
}

function buildManagerNotificationPayload(order: OrderBranchManagerConfirmationOrder): CreateNotificationDto {
  return {
    title: "Yêu cầu xác nhận nhận đơn hàng",
    content: "Vui lòng vào xác nhận đồng ý hoặc từ chối nhận đơn hàng.",
    type: NotificationTypeEnum.ALERT,
    objectId: order.id,
    metadata: {
      orderId: order.id,
      orderCode: order.code,
    },
  };
}

export async function processOrderBranchManagerConfirmationNotifications(
  deps: OrderBranchManagerConfirmationJobDeps,
): Promise<ProcessOrderBranchManagerConfirmationNotificationsResult> {
  const orders = await deps.findEligibleOrders();
  if (orders.length === 0) {
    return {
      ordersChecked: 0,
      notifiedCount: 0,
      skippedEmptyRecipientCount: 0,
    };
  }

  const adminUserIds = await deps.findAdminUserIds();
  let notifiedCount = 0;
  let skippedEmptyRecipientCount = 0;

  for (const order of orders) {
    const branchManagerUserIds = order.branchManagerId
      ? await deps.findUserIdsByEmployeeIds([order.branchManagerId])
      : [];
    const adminRecipientUserIds = uniqueIds(adminUserIds);
    const branchManagerRecipientUserIds = uniqueIds(branchManagerUserIds);

    if (adminRecipientUserIds.length === 0 && branchManagerRecipientUserIds.length === 0) {
      skippedEmptyRecipientCount += 1;
      continue;
    }

    if (adminRecipientUserIds.length > 0) {
      await deps.createNotification(adminRecipientUserIds, buildAdminNotificationPayload(order), order.code);
    }

    if (branchManagerRecipientUserIds.length > 0) {
      await deps.createNotification(branchManagerRecipientUserIds, buildManagerNotificationPayload(order), order.code);
    }

    notifiedCount += 1;
  }

  return {
    ordersChecked: orders.length,
    notifiedCount,
    skippedEmptyRecipientCount,
  };
}

export async function findEligibleOrders(
  orderRepository: OrderRepository,
): Promise<OrderBranchManagerConfirmationOrder[]> {
  const rows = await orderRepository
    .getRepository()
    .createQueryBuilder("pending_order")
    .select("pending_order.id", "order_id")
    .addSelect("pending_order.code", "order_code")
    .addSelect('pending_order."branchManagerId"', "branch_manager_id")
    .addSelect('branch_manager."zaloName"', "branch_manager_zalo_name")
    .leftJoin("employees", "branch_manager", 'branch_manager.id = pending_order."branchManagerId"')
    .where("pending_order.status = :status", { status: OrderStatusEnum.PENDING })
    .andWhere("pending_order.deletedAt IS NULL")
    .andWhere('pending_order."branchManagerConfirmedStatus" = :confirmationStatus', {
      confirmationStatus: BranchManagerConfirmStatusEnum.PENDING,
    })
    .getRawMany<RawOrderBranchManagerConfirmationRow>();

  return rows.map((row) => ({
    id: row.order_id,
    code: row.order_code,
    branchManagerId: row.branch_manager_id,
    branchManagerZaloName: row.branch_manager_zalo_name,
  }));
}

async function process(): Promise<void> {
  const orderRepository = container.get<OrderRepository>(ORDER_TYPES.OrderRepository);
  const userRepository = container.get<UserRepository>(USER_TYPES.UserRepository);
  const notificationService = container.get<NotificationService>(NOTIFICATION_TYPES.NotificationService);

  const result = await processOrderBranchManagerConfirmationNotifications({
    findEligibleOrders: () => findEligibleOrders(orderRepository),
    findAdminUserIds: () => userRepository.findAllAdminUserIds(),
    findUserIdsByEmployeeIds: (employeeIds) => userRepository.findUserIdsByEmployeeIds(employeeIds),
    createNotification: (userIds, data, orderCode) =>
      notificationService.createNotificationForMultipleUsers(userIds, data, undefined, { orderCode }),
  });

  logger.info(
    "ORDER BRANCH MANAGER CONFIRMATION NOTIFICATION JOB: " +
      `checked ${result.ordersChecked} order(s), notified ${result.notifiedCount} order(s)`,
  );
}

let job: Cron | null = null;
let isProcessing = false;

export const JobOrderBranchManagerConfirmationNotification = {
  start: () => {
    if (!job) {
      job = new Cron(
        ORDER_BRANCH_MANAGER_CONFIRMATION_NOTIFICATION_CRON,
        { timezone: "Asia/Ho_Chi_Minh" },
        async () => {
          if (isProcessing) {
            logger.warn("ORDER BRANCH MANAGER CONFIRMATION NOTIFICATION JOB: previous run is still " + "processing");
            return;
          }

          isProcessing = true;
          logger.info("START ORDER BRANCH MANAGER CONFIRMATION NOTIFICATION JOB: " + new Date().toISOString());
          try {
            await process();
          } catch (error) {
            logger.error("Error in Order Branch Manager Confirmation Notification Job:", error);
          } finally {
            isProcessing = false;
          }
        },
      );
    }
  },
  stop: () => {
    if (job) {
      job.stop();
      job = null;
      logger.info("STOP ORDER BRANCH MANAGER CONFIRMATION NOTIFICATION JOB");
    }
  },
};
