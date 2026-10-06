import { container } from "@/modules/container";
import type { NotificationService } from "@/modules/notification/notification.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import type { CreateNotificationDto } from "@/modules/notification/notification.validator";
import type { OrderRepository } from "@/modules/order/order.repository";
import { ORDER_TYPES } from "@/modules/order/order.types";
import type { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import { EntityTypeEnum, FileStatusEnum, NotificationTypeEnum, OrderStatusEnum } from "@/shared/constants/constance";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";

export const ORDER_DOCUMENT_UPLOAD_NOTIFICATION_CRON = "0 */5 * * * *";
export const ORDER_DOCUMENT_UPLOAD_MIN_TIME_AT = new Date("2026-09-18T10:00:00+07:00");

const DOCUMENT_NOTIFICATION_TITLE = "Hợp đồng chưa đầy đủ tài liệu chứng từ";
const MANAGEMENT_DOCUMENT_NOTIFICATION_CONTENT =
  "Hợp đồng đã hoàn thành nhưng chưa được cập nhật đầy đủ tài liệu chứng từ.";
const LEADER_DOCUMENT_NOTIFICATION_CONTENT = "Vui lòng cập nhật đầy đủ tài liệu chứng từ cho hợp đồng.";

export interface OrderDocumentUploadNotificationOrder {
  id: string;
  code: string;
  branchManagerId?: string | null;
  leaderEmployeeIds: string[];
}

export interface OrderDocumentUploadNotificationJobDeps {
  findEligibleOrders: () => Promise<OrderDocumentUploadNotificationOrder[]>;
  findAdminUserIds: () => Promise<string[]>;
  findUserIdsByEmployeeIds: (employeeIds: string[]) => Promise<string[]>;
  createNotification: (userIds: string[], data: CreateNotificationDto, orderCode: string) => Promise<unknown>;
}

export interface ProcessOrderDocumentUploadNotificationsResult {
  ordersChecked: number;
  notifiedCount: number;
  skippedEmptyRecipientCount: number;
}

interface RawOrderDocumentUploadRow {
  order_id: string;
  order_code: string;
  branch_manager_id: string | null;
  leader_employee_id: string | null;
}

const uniqueIds = (ids: Array<string | null | undefined>): string[] => [
  ...new Set(ids.filter((id): id is string => Boolean(id))),
];

function buildNotificationPayload(order: OrderDocumentUploadNotificationOrder, content: string): CreateNotificationDto {
  return {
    title: DOCUMENT_NOTIFICATION_TITLE,
    content,
    type: NotificationTypeEnum.ALERT,
    objectId: order.id,
    metadata: {
      orderId: order.id,
      orderCode: order.code,
    },
  };
}

export async function processOrderDocumentUploadNotifications(
  deps: OrderDocumentUploadNotificationJobDeps,
): Promise<ProcessOrderDocumentUploadNotificationsResult> {
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
    const managementUserIds = uniqueIds([...adminUserIds, ...branchManagerUserIds]);

    const leaderEmployeeIds = uniqueIds(order.leaderEmployeeIds);
    const leaderUserIds = leaderEmployeeIds.length
      ? uniqueIds(await deps.findUserIdsByEmployeeIds(leaderEmployeeIds))
      : [];

    let orderNotified = false;

    if (managementUserIds.length > 0) {
      await deps.createNotification(
        managementUserIds,
        buildNotificationPayload(order, MANAGEMENT_DOCUMENT_NOTIFICATION_CONTENT),
        order.code,
      );
      orderNotified = true;
    }

    if (leaderUserIds.length > 0) {
      await deps.createNotification(
        leaderUserIds,
        buildNotificationPayload(order, LEADER_DOCUMENT_NOTIFICATION_CONTENT),
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
): Promise<OrderDocumentUploadNotificationOrder[]> {
  const rows = await orderRepository
    .getRepository()
    .createQueryBuilder("completed_order")
    .select("completed_order.id", "order_id")
    .addSelect("completed_order.code", "order_code")
    .addSelect('completed_order."branchManagerId"', "branch_manager_id")
    .addSelect('leader_order_employee."employeeId"', "leader_employee_id")
    .leftJoin(
      "order_employees",
      "leader_order_employee",
      'leader_order_employee."orderId" = completed_order.id AND leader_order_employee."isLeader" = true AND leader_order_employee."deletedAt" IS NULL',
    )
    .where("completed_order.status = :status", { status: OrderStatusEnum.COMPLETED })
    .andWhere("completed_order.deletedAt IS NULL")
    .andWhere('completed_order."timeAt" >= :minTimeAt', {
      minTimeAt: ORDER_DOCUMENT_UPLOAD_MIN_TIME_AT,
    })
    .andWhere(
      `NOT EXISTS (
        SELECT 1
        FROM "files" contract_file
        WHERE contract_file."entityType" = :entityType
          AND contract_file."entityId" = completed_order.id
          AND contract_file."status" = :fileStatus
          AND contract_file."deletedAt" IS NULL
      )`,
      {
        entityType: EntityTypeEnum.ORDER,
        fileStatus: FileStatusEnum.ACTIVE,
      },
    )
    .getRawMany<RawOrderDocumentUploadRow>();

  const orders = new Map<string, OrderDocumentUploadNotificationOrder>();

  for (const row of rows) {
    const order = orders.get(row.order_id);

    if (order) {
      if (row.leader_employee_id) {
        order.leaderEmployeeIds.push(row.leader_employee_id);
      }
      continue;
    }

    orders.set(row.order_id, {
      id: row.order_id,
      code: row.order_code,
      branchManagerId: row.branch_manager_id,
      leaderEmployeeIds: row.leader_employee_id ? [row.leader_employee_id] : [],
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

  const result = await processOrderDocumentUploadNotifications({
    findEligibleOrders: () => findEligibleOrders(orderRepository),
    findAdminUserIds: () => userRepository.findAllAdminUserIds(),
    findUserIdsByEmployeeIds: (employeeIds) => userRepository.findUserIdsByEmployeeIds(employeeIds),
    createNotification: (userIds, data, orderCode) =>
      notificationService.createNotificationForMultipleUsers(userIds, data, undefined, { orderCode }),
  });

  logger.info(
    `ORDER DOCUMENT UPLOAD NOTIFICATION JOB: checked ${result.ordersChecked} order(s), ` +
      `notified ${result.notifiedCount} order(s)`,
  );
}

let job: Cron | null = null;
let isProcessing = false;

export const JobOrderDocumentUploadNotification = {
  start: () => {
    if (!job) {
      job = new Cron(ORDER_DOCUMENT_UPLOAD_NOTIFICATION_CRON, { timezone: "Asia/Ho_Chi_Minh" }, async () => {
        if (isProcessing) {
          logger.warn("ORDER DOCUMENT UPLOAD NOTIFICATION JOB: previous run is still processing");
          return;
        }

        isProcessing = true;
        logger.info("START ORDER DOCUMENT UPLOAD NOTIFICATION JOB: " + new Date().toISOString());
        try {
          await process();
        } catch (error) {
          logger.error("Error in Order Document Upload Notification Job:", error);
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
      logger.info("STOP ORDER DOCUMENT UPLOAD NOTIFICATION JOB");
    }
  },
};
