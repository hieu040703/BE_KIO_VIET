import { container } from "@/modules/container";
import type { OrderRepository } from "@/modules/order/order.repository";
import { ORDER_TYPES } from "@/modules/order/order.types";
import type { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import type { NotificationService } from "@/modules/notification/notification.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import type { CreateNotificationDto } from "@/modules/notification/notification.validator";
import {
  BranchManagerConfirmStatusEnum,
  NotificationTypeEnum,
  OrderStatusEnum,
} from "@/shared/constants/constance";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";

export const ORDER_EMPLOYEE_SHORTAGE_NOTIFICATION_CRON = "0 */5 * * * *";
export const ORDER_EMPLOYEE_SHORTAGE_WINDOW_MS = 2 * 60 * 60 * 1000;

export interface OrderEmployeeShortageOrder {
  id: string;
  code: string;
  status: OrderStatusEnum | string;
  timeAt: Date | string;
  employeeCount: number;
  assignedEmployeeCount: number;
  branchManagerId?: string | null;
}

export interface OrderEmployeeShortageJobDeps {
  getNow?: () => Date;
  findEligibleOrders: (now: Date) => Promise<OrderEmployeeShortageOrder[]>;
  findAdminUserIds: () => Promise<string[]>;
  findUserIdsByEmployeeIds: (employeeIds: string[]) => Promise<string[]>;
  createNotification: (userIds: string[], data: CreateNotificationDto, orderCode: string) => Promise<unknown>;
}

export interface ProcessOrderEmployeeShortageNotificationsResult {
  ordersChecked: number;
  notifiedCount: number;
  skippedEmptyRecipientCount: number;
}

interface RawOrderEmployeeShortageOrder {
  order_id: string;
  order_code: string;
  order_status: string;
  order_time_at: Date | string;
  employee_count: number | string;
  branch_manager_id: string | null;
  assigned_employee_count: number | string;
}

const uniqueIds = (ids: Array<string | null | undefined>): string[] => [
  ...new Set(ids.filter((id): id is string => Boolean(id))),
];

export function isEligibleOrderEmployeeShortage(order: OrderEmployeeShortageOrder, now: Date): boolean {
  const timeAt = new Date(order.timeAt).getTime();
  const startsWithinTwoHours = timeAt - now.getTime() <= ORDER_EMPLOYEE_SHORTAGE_WINDOW_MS;

  return (
    order.status === OrderStatusEnum.PENDING &&
    startsWithinTwoHours &&
    order.assignedEmployeeCount < order.employeeCount
  );
}

function buildNotificationPayload(order: OrderEmployeeShortageOrder): CreateNotificationDto {
  return {
    title: "Sắp xếp nhân sự hợp đồng",
    content: `Nhân sự cho hợp đồng ${order.code} chưa đủ theo số lượng trong hợp đồng, vui lòng bổ xung sớm .`,
    type: NotificationTypeEnum.ALERT,
    objectId: order.id,
    metadata: {
      orderId: order.id,
      orderCode: order.code,
      employeeCount: order.employeeCount,
      assignedEmployeeCount: order.assignedEmployeeCount,
    },
  };
}

export async function processOrderEmployeeShortageNotifications(
  deps: OrderEmployeeShortageJobDeps,
): Promise<ProcessOrderEmployeeShortageNotificationsResult> {
  const now = deps.getNow?.() ?? new Date();
  const orders = await deps.findEligibleOrders(now);
  const shortageOrders = orders.filter((order) => isEligibleOrderEmployeeShortage(order, now));

  if (shortageOrders.length === 0) {
    return {
      ordersChecked: orders.length,
      notifiedCount: 0,
      skippedEmptyRecipientCount: 0,
    };
  }

  const adminUserIds = await deps.findAdminUserIds();
  let notifiedCount = 0;
  let skippedEmptyRecipientCount = 0;

  for (const order of shortageOrders) {
    const branchManagerUserIds = order.branchManagerId
      ? await deps.findUserIdsByEmployeeIds([order.branchManagerId])
      : [];
    const recipientUserIds = uniqueIds([...adminUserIds, ...branchManagerUserIds]);

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
  now: Date,
): Promise<OrderEmployeeShortageOrder[]> {
  const cutoff = new Date(now.getTime() + ORDER_EMPLOYEE_SHORTAGE_WINDOW_MS);
  const assignedEmployeeCountSql = `(
    SELECT COUNT(*)
    FROM "order_employees" AS "order_employee"
    WHERE "order_employee"."orderId" = "pending_order"."id"
      AND "order_employee"."deletedAt" IS NULL
  )`;

  const rows = await orderRepository
    .getRepository()
    .createQueryBuilder("pending_order")
    .select("pending_order.id", "order_id")
    .addSelect("pending_order.code", "order_code")
    .addSelect("pending_order.status", "order_status")
    .addSelect("pending_order.timeAt", "order_time_at")
    .addSelect("pending_order.employeeCount", "employee_count")
    .addSelect("pending_order.branchManagerId", "branch_manager_id")
    .addSelect(assignedEmployeeCountSql, "assigned_employee_count")
    .where("pending_order.status = :status", { status: OrderStatusEnum.PENDING })
    .andWhere("pending_order.deletedAt IS NULL")
    .andWhere('pending_order."branchManagerConfirmedStatus" = :confirmationStatus', {
      confirmationStatus: BranchManagerConfirmStatusEnum.CONFIRMED,
    })
    .andWhere('pending_order."timeAt" <= :cutoff', { cutoff })
    .andWhere(`pending_order."employeeCount" > ${assignedEmployeeCountSql}`)
    .getRawMany<RawOrderEmployeeShortageOrder>();

  return rows.map((row) => ({
    id: row.order_id,
    code: row.order_code,
    status: row.order_status,
    timeAt: row.order_time_at,
    employeeCount: Number(row.employee_count),
    assignedEmployeeCount: Number(row.assigned_employee_count),
    branchManagerId: row.branch_manager_id,
  }));
}

async function process(): Promise<void> {
  const orderRepository = container.get<OrderRepository>(ORDER_TYPES.OrderRepository);
  const userRepository = container.get<UserRepository>(USER_TYPES.UserRepository);
  const notificationService = container.get<NotificationService>(NOTIFICATION_TYPES.NotificationService);

  const result = await processOrderEmployeeShortageNotifications({
    findEligibleOrders: (now) => findEligibleOrders(orderRepository, now),
    findAdminUserIds: () => userRepository.findAllAdminUserIds(),
    findUserIdsByEmployeeIds: (employeeIds) => userRepository.findUserIdsByEmployeeIds(employeeIds),
    createNotification: (userIds, data, orderCode) =>
      notificationService.createNotificationForMultipleUsers(userIds, data, undefined, { orderCode }),
  });

  logger.info(
    `ORDER EMPLOYEE SHORTAGE NOTIFICATION JOB: checked ${result.ordersChecked} order(s), notified ${result.notifiedCount} order(s)`,
  );
}

let job: Cron | null = null;
let isProcessing = false;

export const JobOrderEmployeeShortageNotification = {
  start: () => {
    if (!job) {
      job = new Cron(ORDER_EMPLOYEE_SHORTAGE_NOTIFICATION_CRON, { timezone: "Asia/Ho_Chi_Minh" }, async () => {
        if (isProcessing) {
          logger.warn("ORDER EMPLOYEE SHORTAGE NOTIFICATION JOB: previous run is still processing");
          return;
        }

        isProcessing = true;
        logger.info("START ORDER EMPLOYEE SHORTAGE NOTIFICATION JOB: " + new Date().toISOString());
        try {
          await process();
        } catch (error) {
          logger.error("Error in Order Employee Shortage Notification Job:", error);
        } finally {
          isProcessing = false;
        }
      });
    }
  },
  stop: () => {
    if (job) {
      job.stop();
      job = null;
      logger.info("STOP ORDER EMPLOYEE SHORTAGE NOTIFICATION JOB");
    }
  },
};
