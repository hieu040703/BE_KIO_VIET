import { container } from "@/modules/container";
import type { OrderRepository } from "@/modules/order/order.repository";
import { ORDER_TYPES } from "@/modules/order/order.types";
import type { OrderEmployeeRepository } from "@/modules/order/orderEmployee/orderEmployee.repository";
import { ORDER_EMPLOYEE_TYPES } from "@/modules/order/orderEmployee/orderEmployee.types";
import type { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import {
  NotificationTypeEnum,
  OrderEmployeeStatusEnum,
  OrderStatusEnum,
} from "@/shared/constants/constance";
import { NotificationService } from "@/modules/notification/notification.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { CreateNotificationDto } from "@/modules/notification/notification.validator";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";
import { In, IsNull, LessThanOrEqual } from "typeorm";

export const ORDER_CHECKIN_NOTIFICATION_CRON = "0 */3 * * * *";
export const ORDER_CHECKIN_NOTIFICATION_LEAD_TIME_MS = 20 * 60 * 1000;

export interface OrderCheckinNotificationOrder {
  id: string;
  code: string;
  name: string | null;
  isUrgent: boolean;
  timeAt: Date;
  branchManagerId: string | null;
  createdByEmployeeId: string | null;
}

export interface UncheckedOrderEmployee {
  id: string;
  employeeId: string;
  employee?: { name?: string | null } | null;
}

export interface OrderCheckinNotificationJobDeps {
  getNow?: () => Date;
  findEligibleOrders: (now: Date) => Promise<OrderCheckinNotificationOrder[]>;
  findUncheckedEmployees: (orderId: string) => Promise<UncheckedOrderEmployee[]>;
  findAdminUserIds: () => Promise<string[]>;
  findUserIdsByEmployeeIds: (employeeIds: string[]) => Promise<string[]>;
  createNotification: (
    userIds: string[],
    data: CreateNotificationDto,
    orderCode: string,
  ) => Promise<unknown>;
}

export interface ProcessOrderCheckinNotificationsResult {
  ordersChecked: number;
  employeesNotified: number;
  skippedEmptyRecipientCount: number;
}

const uniqueIds = (ids: Array<string | null | undefined>): string[] => [
  ...new Set(ids.filter((id): id is string => Boolean(id))),
];

export function buildUncheckedEmployeeFindOptions(orderId: string) {
  return {
    where: {
      orderId,
      status: OrderEmployeeStatusEnum.CONFIRMED,
      checkInAt: IsNull(),
      deletedAt: IsNull(),
    },
    select: {
      id: true,
      employeeId: true,
      timeAt: true,
      employee: {
        id: true,
        name: true,
        user: {
          id: true,
        },
      },
    },
    // `relations` chỉ khai báo relation; các column của Employee nằm trong `select`.
    relations: {
      employee: {
        user: true,
      },
    },
  };
}

export async function findEligibleOrders(
  orderRepository: OrderRepository,
  now: Date,
): Promise<OrderCheckinNotificationOrder[]> {
  const latestStartAt = new Date(now.getTime() + ORDER_CHECKIN_NOTIFICATION_LEAD_TIME_MS);

  return orderRepository.findByOptions({
    where: {
      status: In([OrderStatusEnum.PENDING, OrderStatusEnum.PROCESSING]),
      timeAt: LessThanOrEqual(latestStartAt),
    },
    select: {
      id: true,
      code: true,
      name: true,
      isUrgent: true,
      timeAt: true,
      branchManagerId: true,
      createdByEmployeeId: true,
    },
  });
}

function buildNotificationPayload(
  order: OrderCheckinNotificationOrder,
  uncheckedEmployees: UncheckedOrderEmployee[],
): CreateNotificationDto {
  const employeeNames = uncheckedEmployees.map((employee) => employee.employee?.name || "Nhân viên").join(", ");
  const orderLabel = order.isUrgent ? `[ĐƠN GẤP] ${order.code}` : `[ĐƠN THƯỜNG] ${order.code}`;

  return {
    title: `Nhân viên chưa checkin - ${order.name || order.code}`,
    content: `${orderLabel}: ${employeeNames} chưa thực hiện checkin.\nVui lòng đôn đốc nhân viên.`,
    type: NotificationTypeEnum.ALERT,
    objectId: order.id,
    metadata: {
      orderId: order.id,
      orderCode: order.code,
      orderName: order.name,
      isUrgent: order.isUrgent,
      uncheckedEmployees: uncheckedEmployees.map((employee) => ({
        employeeId: employee.employeeId,
        employeeName: employee.employee?.name,
      })),
    },
  };
}

function buildEmployeeNotificationPayload(order: OrderCheckinNotificationOrder): CreateNotificationDto {
  return {
    title: "Vui lòng thực hiện checkin đơn hàng",
    content: `Bạn chưa thực hiện checkin đơn hàng ${order.code}, vui lòng vào thực hiện checkin sớm.`,
    type: NotificationTypeEnum.ALERT,
    objectId: order.id,
    metadata: {
      orderId: order.id,
      orderCode: order.code,
    },
  };
}

export async function processOrderCheckinNotifications(
  deps: OrderCheckinNotificationJobDeps,
): Promise<ProcessOrderCheckinNotificationsResult> {
  const now = deps.getNow?.() ?? new Date();
  const orders = await deps.findEligibleOrders(now);
  let employeesNotified = 0;
  let skippedEmptyRecipientCount = 0;

  if (orders.length === 0) {
    return { ordersChecked: 0, employeesNotified: 0, skippedEmptyRecipientCount: 0 };
  }

  const adminUserIds = uniqueIds(await deps.findAdminUserIds());

  for (const order of orders) {
    const uncheckedEmployees = await deps.findUncheckedEmployees(order.id);
    if (uncheckedEmployees.length === 0) {
      continue;
    }

    const uncheckedEmployeeIds = uniqueIds(uncheckedEmployees.map((employee) => employee.employeeId));
    const uncheckedEmployeeUserIds =
      uncheckedEmployeeIds.length > 0
        ? uniqueIds(await deps.findUserIdsByEmployeeIds(uncheckedEmployeeIds))
        : [];
    const managementEmployeeIds = uniqueIds([order.branchManagerId, order.createdByEmployeeId]);
    const managementEmployeeUserIds =
      managementEmployeeIds.length > 0 ? await deps.findUserIdsByEmployeeIds(managementEmployeeIds) : [];
    const managementUserIds = uniqueIds([...adminUserIds, ...managementEmployeeUserIds]);

    let orderNotified = false;

    if (uncheckedEmployeeUserIds.length > 0) {
      await deps.createNotification(
        uncheckedEmployeeUserIds,
        buildEmployeeNotificationPayload(order),
        order.code,
      );
      orderNotified = true;
    }

    if (managementUserIds.length > 0) {
      await deps.createNotification(
        managementUserIds,
        buildNotificationPayload(order, uncheckedEmployees),
        order.code,
      );
      orderNotified = true;
    }

    if (!orderNotified) {
      skippedEmptyRecipientCount += 1;
      continue;
    }

    employeesNotified += uncheckedEmployees.length;
  }

  return { ordersChecked: orders.length, employeesNotified, skippedEmptyRecipientCount };
}

async function process(): Promise<void> {
  try {
    const orderRepository = container.get<OrderRepository>(ORDER_TYPES.OrderRepository);
    const orderEmployeeRepository = container.get<OrderEmployeeRepository>(ORDER_EMPLOYEE_TYPES.OrderEmployeeRepository);
    const userRepository = container.get<UserRepository>(USER_TYPES.UserRepository);
    const notificationService = container.get<NotificationService>(NOTIFICATION_TYPES.NotificationService);

    const result = await processOrderCheckinNotifications({
      findEligibleOrders: (now) => findEligibleOrders(orderRepository, now),
      findUncheckedEmployees: async (orderId) =>
        orderEmployeeRepository.getRepository().find(buildUncheckedEmployeeFindOptions(orderId) as any),
      findAdminUserIds: () => userRepository.findAllAdminUserIds(),
      findUserIdsByEmployeeIds: (employeeIds) => userRepository.findUserIdsByEmployeeIds(employeeIds),
      createNotification: (userIds, data, orderCode) =>
        notificationService.createNotificationForMultipleUsers(userIds, data, undefined, {
          orderCode,
          sendFirebase: true,
        }),
    });
    logger.info(
      `ORDER CHECKIN NOTIFICATION JOB: checked ${result.ordersChecked} order(s), notified ${result.employeesNotified} employee(s)`,
    );
  } catch (error) {
    logger.error("Error in Order Checkin Notification Job:", error);
  }
}

let job: Cron | null = null;
let isProcessing = false;

export const JobOrderCheckinNotification = {
  start: () => {
    if (!job) {
      job = new Cron(ORDER_CHECKIN_NOTIFICATION_CRON, { timezone: "Asia/Ho_Chi_Minh" }, async () => {
        if (isProcessing) {
          logger.warn("ORDER CHECKIN NOTIFICATION JOB: previous run is still processing");
          return;
        }

        isProcessing = true;
        logger.info("START ORDER CHECKIN NOTIFICATION JOB: " + new Date().toISOString());
        try {
          await process();
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
      logger.info("STOP ORDER CHECKIN NOTIFICATION JOB");
    }
  },
};
