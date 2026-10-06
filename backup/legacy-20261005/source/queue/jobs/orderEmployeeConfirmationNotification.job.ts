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
  OrderEmployeeStatusEnum,
  OrderStatusEnum,
} from "@/shared/constants/constance";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";

export const ORDER_EMPLOYEE_CONFIRMATION_NOTIFICATION_CRON = "0 */2 * * * *";

export interface PendingOrderEmployee {
  employeeId: string;
  employeeName: string;
}

export interface OrderEmployeeConfirmationOrder {
  id: string;
  code: string;
  branchManagerId?: string | null;
  pendingEmployees: PendingOrderEmployee[];
}

export interface OrderEmployeeConfirmationJobDeps {
  findEligibleOrders: () => Promise<OrderEmployeeConfirmationOrder[]>;
  findAdminUserIds: () => Promise<string[]>;
  findUserIdsByEmployeeIds: (employeeIds: string[]) => Promise<string[]>;
  createNotification: (
    userIds: string[],
    data: CreateNotificationDto,
    orderCode: string,
  ) => Promise<unknown>;
}

export interface ProcessOrderEmployeeConfirmationNotificationsResult {
  ordersChecked: number;
  notifiedCount: number;
  skippedEmptyRecipientCount: number;
}

interface RawOrderEmployeeConfirmationRow {
  order_id: string;
  order_code: string;
  branch_manager_id: string | null;
  employee_id: string;
  employee_name: string;
}

const uniqueIds = (ids: Array<string | null | undefined>): string[] => [
  ...new Set(ids.filter((id): id is string => Boolean(id))),
];

const uniquePendingEmployees = (employees: PendingOrderEmployee[]): PendingOrderEmployee[] => {
  const employeesById = new Map<string, PendingOrderEmployee>();

  for (const employee of employees) {
    if (!employeesById.has(employee.employeeId)) {
      employeesById.set(employee.employeeId, employee);
    }
  }

  return [...employeesById.values()];
};

const buildMetadata = (order: OrderEmployeeConfirmationOrder) => ({
  orderId: order.id,
  orderCode: order.code,
  pendingEmployees: order.pendingEmployees,
});

function buildEmployeeNotificationPayload(order: OrderEmployeeConfirmationOrder): CreateNotificationDto {
  return {
    title: "Yêu cầu xác nhận tham gia hợp đồng",
    content: "Vui lòng nhanh chóng vào xác nhận đồng ý hoặc từ chối tham gia hợp đồng.",
    type: NotificationTypeEnum.ALERT,
    objectId: order.id,
    metadata: buildMetadata(order),
  };
}

function buildManagementNotificationPayload(
  order: OrderEmployeeConfirmationOrder,
): CreateNotificationDto {
  const employeeNames = order.pendingEmployees.map((employee) => employee.employeeName).join(", ");

  return {
    title: "Nhân viên chưa xác nhận tham gia hợp đồng",
    content:
      `Nhân viên ${employeeNames} chưa xác nhận đồng ý hoặc từ chối tham gia hợp đồng, ` +
      "vui lòng chủ động đôn đốc nhân viên.",
    type: NotificationTypeEnum.ALERT,
    objectId: order.id,
    metadata: buildMetadata(order),
  };
}

export async function processOrderEmployeeConfirmationNotifications(
  deps: OrderEmployeeConfirmationJobDeps,
): Promise<ProcessOrderEmployeeConfirmationNotificationsResult> {
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
    const pendingEmployeeIds = uniqueIds(order.pendingEmployees.map((employee) => employee.employeeId));
    const pendingEmployeeUserIds = uniqueIds(
      pendingEmployeeIds.length > 0
        ? await deps.findUserIdsByEmployeeIds(pendingEmployeeIds)
        : [],
    );
    const branchManagerUserIds = order.branchManagerId
      ? await deps.findUserIdsByEmployeeIds([order.branchManagerId])
      : [];
    const managementUserIds = uniqueIds([...adminUserIds, ...branchManagerUserIds]);

    let orderNotified = false;

    if (pendingEmployeeUserIds.length > 0) {
      await deps.createNotification(
        pendingEmployeeUserIds,
        buildEmployeeNotificationPayload(order),
        order.code,
      );
      orderNotified = true;
    }

    if (managementUserIds.length > 0) {
      await deps.createNotification(
        managementUserIds,
        buildManagementNotificationPayload(order),
        order.code,
      );
      orderNotified = true;
    }

    if (orderNotified) {
      notifiedCount += 1;
    } else {
      skippedEmptyRecipientCount += 1;
    }
  }

  return {
    ordersChecked: orders.length,
    notifiedCount,
    skippedEmptyRecipientCount,
  };
}

export async function findEligibleOrders(
  orderRepository: OrderRepository,
): Promise<OrderEmployeeConfirmationOrder[]> {
  const rows = await orderRepository
    .getRepository()
    .createQueryBuilder("pending_order")
    .select("pending_order.id", "order_id")
    .addSelect("pending_order.code", "order_code")
    .addSelect('pending_order."branchManagerId"', "branch_manager_id")
    .addSelect('pending_order_employee."employeeId"', "employee_id")
    .addSelect('pending_employee."name"', "employee_name")
    .innerJoin(
      "order_employees",
      "pending_order_employee",
      'pending_order_employee."orderId" = pending_order.id',
    )
    .innerJoin(
      "employees",
      "pending_employee",
      'pending_employee.id = pending_order_employee."employeeId"',
    )
    .where("pending_order.status = :status", { status: OrderStatusEnum.PENDING })
    .andWhere("pending_order.deletedAt IS NULL")
    .andWhere('pending_order."branchManagerConfirmedStatus" = :confirmationStatus', {
      confirmationStatus: BranchManagerConfirmStatusEnum.CONFIRMED,
    })
    .andWhere('pending_order_employee."status" = :employeeStatus', {
      employeeStatus: OrderEmployeeStatusEnum.PENDING,
    })
    .andWhere('pending_order_employee."deletedAt" IS NULL')
    .andWhere('pending_employee."deletedAt" IS NULL')
    .getRawMany<RawOrderEmployeeConfirmationRow>();

  const orders = new Map<string, OrderEmployeeConfirmationOrder>();

  for (const row of rows) {
    const pendingEmployee = {
      employeeId: row.employee_id,
      employeeName: row.employee_name || "Nhân viên",
    };
    const order = orders.get(row.order_id);

    if (order) {
      order.pendingEmployees.push(pendingEmployee);
      continue;
    }

    orders.set(row.order_id, {
      id: row.order_id,
      code: row.order_code,
      branchManagerId: row.branch_manager_id,
      pendingEmployees: [pendingEmployee],
    });
  }

  return [...orders.values()].map((order) => ({
    ...order,
    pendingEmployees: uniquePendingEmployees(order.pendingEmployees),
  }));
}

async function process(): Promise<void> {
  const orderRepository = container.get<OrderRepository>(ORDER_TYPES.OrderRepository);
  const userRepository = container.get<UserRepository>(USER_TYPES.UserRepository);
  const notificationService = container.get<NotificationService>(NOTIFICATION_TYPES.NotificationService);

  const result = await processOrderEmployeeConfirmationNotifications({
    findEligibleOrders: () => findEligibleOrders(orderRepository),
    findAdminUserIds: () => userRepository.findAllAdminUserIds(),
    findUserIdsByEmployeeIds: (employeeIds) => userRepository.findUserIdsByEmployeeIds(employeeIds),
    createNotification: (userIds, data, orderCode) =>
      notificationService.createNotificationForMultipleUsers(userIds, data, undefined, { orderCode }),
  });

  logger.info(
    `ORDER EMPLOYEE CONFIRMATION NOTIFICATION JOB: checked ${result.ordersChecked} order(s), ` +
      `notified ${result.notifiedCount} order(s)`,
  );
}

let job: Cron | null = null;
let isProcessing = false;

export const JobOrderEmployeeConfirmationNotification = {
  start: () => {
    if (!job) {
      job = new Cron(
        ORDER_EMPLOYEE_CONFIRMATION_NOTIFICATION_CRON,
        { timezone: "Asia/Ho_Chi_Minh" },
        async () => {
          if (isProcessing) {
            logger.warn("ORDER EMPLOYEE CONFIRMATION NOTIFICATION JOB: previous run is still processing");
            return;
          }

          isProcessing = true;
          logger.info("START ORDER EMPLOYEE CONFIRMATION NOTIFICATION JOB: " + new Date().toISOString());
          try {
            await process();
          } catch (error) {
            logger.error("Error in Order Employee Confirmation Notification Job:", error);
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
      logger.info("STOP ORDER EMPLOYEE CONFIRMATION NOTIFICATION JOB");
    }
  },
};
