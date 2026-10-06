import { container } from "@/modules/container";
import type { OrderRepository } from "@/modules/order/order.repository";
import { ORDER_TYPES } from "@/modules/order/order.types";
import type { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import type { NotificationService } from "@/modules/notification/notification.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import type { CreateNotificationDto } from "@/modules/notification/notification.validator";
import { NotificationTypeEnum, OrderStatusEnum } from "@/shared/constants/constance";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";

export const ORDER_EMPLOYEE_CALL_CONFIRMATION_NOTIFICATION_CRON = "0 */10 * * * *";

export interface OrderEmployeeCallConfirmationOrder {
  id: string;
  code: string;
  branchManagerId?: string | null;
  leaderEmployeeIds: string[];
}

export interface OrderEmployeeCallConfirmationJobDeps {
  findEligibleOrders: () => Promise<OrderEmployeeCallConfirmationOrder[]>;
  findAdminUserIds: () => Promise<string[]>;
  findUserIdsByEmployeeIds: (employeeIds: string[]) => Promise<string[]>;
  createNotification: (
    userIds: string[],
    data: CreateNotificationDto,
    orderCode: string,
  ) => Promise<unknown>;
}

export interface ProcessOrderEmployeeCallConfirmationNotificationsResult {
  ordersChecked: number;
  notifiedCount: number;
  skippedEmptyRecipientCount: number;
}

interface RawOrderEmployeeCallConfirmationRow {
  order_id: string;
  order_code: string;
  branch_manager_id: string | null;
  leader_employee_id: string;
}

const uniqueIds = (ids: string[]): string[] => [...new Set(ids.filter(Boolean))];

function buildNotificationPayload(order: OrderEmployeeCallConfirmationOrder): CreateNotificationDto {
  return {
    title: "Chưa gọi xác nhận khách hàng",
    content: "Vui lòng nhanh chóng gọi cho khách hàng để xác nhận thông tin.",
    type: NotificationTypeEnum.ALERT,
    objectId: order.id,
    metadata: {
      orderId: order.id,
      orderCode: order.code,
    },
  };
}

export async function processOrderEmployeeCallConfirmationNotifications(
  deps: OrderEmployeeCallConfirmationJobDeps,
): Promise<ProcessOrderEmployeeCallConfirmationNotificationsResult> {
  const orders = await deps.findEligibleOrders();
  const adminUserIds = uniqueIds(await deps.findAdminUserIds());
  let notifiedCount = 0;
  let skippedEmptyRecipientCount = 0;

  for (const order of orders) {
    const leaderUserIds = uniqueIds(await deps.findUserIdsByEmployeeIds(order.leaderEmployeeIds));
    const branchManagerUserIds = order.branchManagerId
      ? uniqueIds(await deps.findUserIdsByEmployeeIds([order.branchManagerId]))
      : [];
    const recipientUserIds = uniqueIds([...leaderUserIds, ...adminUserIds, ...branchManagerUserIds]);

    if (recipientUserIds.length === 0) {
      skippedEmptyRecipientCount += 1;
      continue;
    }

    await deps.createNotification(recipientUserIds, buildNotificationPayload(order), order.code);
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
): Promise<OrderEmployeeCallConfirmationOrder[]> {
  const rows = await orderRepository
    .getRepository()
    .createQueryBuilder("pending_order")
    .select("pending_order.id", "order_id")
    .addSelect("pending_order.code", "order_code")
    .addSelect('pending_order."branchManagerId"', "branch_manager_id")
    .addSelect('leader_order_employee."employeeId"', "leader_employee_id")
    .innerJoin(
      "order_employees",
      "leader_order_employee",
      'leader_order_employee."orderId" = pending_order.id',
    )
    .where("pending_order.status = :status", { status: OrderStatusEnum.PENDING })
    .andWhere("pending_order.deletedAt IS NULL")
    .andWhere('leader_order_employee."isLeader" = true')
    .andWhere('leader_order_employee."deletedAt" IS NULL')
    .andWhere(
      `NOT EXISTS (
        SELECT 1
        FROM "call_navigations" cn
        WHERE cn."orderId" = pending_order.id
          AND cn."callId" IS NOT NULL
          AND cn."deletedAt" IS NULL
      )`,
    )
    .getRawMany<RawOrderEmployeeCallConfirmationRow>();

  const orders = new Map<string, OrderEmployeeCallConfirmationOrder>();

  for (const row of rows) {
    const order = orders.get(row.order_id);
    if (order) {
      order.leaderEmployeeIds.push(row.leader_employee_id);
      continue;
    }

    orders.set(row.order_id, {
      id: row.order_id,
      code: row.order_code,
      branchManagerId: row.branch_manager_id,
      leaderEmployeeIds: [row.leader_employee_id],
    });
  }

  return [...orders.values()].map((order) => ({
    ...order,
    leaderEmployeeIds: uniqueIds(order.leaderEmployeeIds),
  }));
}

async function process(): Promise<void> {
  const orderRepository = container.get<OrderRepository>(ORDER_TYPES.OrderRepository);
  const userRepository = container.get<UserRepository>(USER_TYPES.UserRepository);
  const notificationService = container.get<NotificationService>(NOTIFICATION_TYPES.NotificationService);

  const result = await processOrderEmployeeCallConfirmationNotifications({
    findEligibleOrders: () => findEligibleOrders(orderRepository),
    findAdminUserIds: () => userRepository.findAllAdminUserIds(),
    findUserIdsByEmployeeIds: (employeeIds) => userRepository.findUserIdsByEmployeeIds(employeeIds),
    createNotification: (userIds, data, orderCode) =>
      notificationService.createNotificationForMultipleUsers(userIds, data, undefined, { orderCode }),
  });

  logger.info(
    `ORDER EMPLOYEE CALL CONFIRMATION NOTIFICATION JOB: checked ${result.ordersChecked} order(s), notified ${result.notifiedCount} order(s)`,
  );
}

let job: Cron | null = null;
let isProcessing = false;

export const JobOrderEmployeeCallConfirmationNotification = {
  start: () => {
    if (!job) {
      job = new Cron(
        ORDER_EMPLOYEE_CALL_CONFIRMATION_NOTIFICATION_CRON,
        { timezone: "Asia/Ho_Chi_Minh" },
        async () => {
          if (isProcessing) {
            logger.warn("ORDER EMPLOYEE CALL CONFIRMATION NOTIFICATION JOB: previous run is still processing");
            return;
          }

          isProcessing = true;
          logger.info("START ORDER EMPLOYEE CALL CONFIRMATION NOTIFICATION JOB: " + new Date().toISOString());
          try {
            await process();
          } catch (error) {
            logger.error("Error in Order Employee Call Confirmation Notification Job:", error);
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
      logger.info("STOP ORDER EMPLOYEE CALL CONFIRMATION NOTIFICATION JOB");
    }
  },
};
