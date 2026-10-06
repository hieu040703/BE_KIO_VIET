import { NotificationTypeEnum, ServiceOrderStatusEnum } from "@/shared/constants/constance";
import type { CreateNotificationDto } from "@/modules/notification/notification.validator";
import { formatOrderNotificationTitle } from "@/shared/utils/notification.utils";

export const SERVICE_ORDER_START_REMINDER_EVENT = "SERVICE_ORDER_START_REMINDER";

interface StartNotificationBranch {
  employeeId?: string | null;
}

export interface StartNotificationServiceOrder {
  id: string;
  status: string;
  timeAt: Date;
  orderCode?: string | null;
  employeeId?: string | null;
  branch?: StartNotificationBranch | null;
}

interface EligibleServiceOrdersParams {
  now: Date;
  reminderMinutes: number;
}

interface FirebaseNotificationInput {
  userId: string;
  title: string;
  content: string;
  data: {
    type: NotificationTypeEnum;
    serviceOrderId: string;
    event: typeof SERVICE_ORDER_START_REMINDER_EVENT;
    timeAt: string;
  };
}

export interface StartNotificationJobDeps {
  getNow?: () => Date;
  getReminderMinutes: () => Promise<number>;
  findEligibleServiceOrders: (
    params: EligibleServiceOrdersParams,
  ) => Promise<StartNotificationServiceOrder[]>;
  findAdminUserIds: () => Promise<string[]>;
  findUserIdsByEmployeeIds: (employeeIds: string[]) => Promise<string[]>;
  createNotifications: (userIds: string[], payload: CreateNotificationDto) => Promise<unknown>;
  sendFirebase: (input: FirebaseNotificationInput) => Promise<unknown> | unknown;
  markSent: (serviceOrderId: string, sentAt: Date) => Promise<unknown>;
}

export interface ProcessServiceOrderStartNotificationsResult {
  processedCount: number;
  notifiedCount: number;
  skippedEmptyRecipientCount: number;
}

function uniqueIds(ids: Array<string | null | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function buildNotificationPayload(serviceOrder: StartNotificationServiceOrder): CreateNotificationDto {
  return {
    title: formatOrderNotificationTitle(serviceOrder.orderCode, "Nhắc lịch bắt đầu đơn dịch vụ"),
    content: "Đơn dịch vụ sắp đến giờ bắt đầu, vui lòng kiểm tra và phối hợp xử lý.",
    type: NotificationTypeEnum.SYSTEM,
    objectId: serviceOrder.id,
    metadata: {
      serviceOrderId: serviceOrder.id,
      event: SERVICE_ORDER_START_REMINDER_EVENT,
      timeAt: serviceOrder.timeAt,
    },
  };
}

function buildFirebasePayload(
  userId: string,
  payload: CreateNotificationDto,
  serviceOrder: StartNotificationServiceOrder,
): FirebaseNotificationInput {
  return {
    userId,
    title: payload.title,
    content: payload.content,
    data: {
      type: NotificationTypeEnum.SYSTEM,
      serviceOrderId: serviceOrder.id,
      event: SERVICE_ORDER_START_REMINDER_EVENT,
      timeAt: serviceOrder.timeAt.toISOString(),
    },
  };
}

export async function processServiceOrderStartNotifications(
  deps: StartNotificationJobDeps,
): Promise<ProcessServiceOrderStartNotificationsResult> {
  const now = deps.getNow?.() ?? new Date();
  const reminderMinutes = await deps.getReminderMinutes();
  const serviceOrders = await deps.findEligibleServiceOrders({
    now,
    reminderMinutes,
  });

  let notifiedCount = 0;
  let skippedEmptyRecipientCount = 0;

  for (const serviceOrder of serviceOrders) {
    if (serviceOrder.status !== ServiceOrderStatusEnum.CONFIRMED) {
      continue;
    }

    const adminUserIds = await deps.findAdminUserIds();
    const employeeIds = uniqueIds([serviceOrder.employeeId, serviceOrder.branch?.employeeId]);
    const employeeUserIds = await deps.findUserIdsByEmployeeIds(employeeIds);
    const recipientUserIds = uniqueIds([...adminUserIds, ...employeeUserIds]);

    if (recipientUserIds.length === 0) {
      skippedEmptyRecipientCount += 1;
      continue;
    }

    const notificationPayload = buildNotificationPayload(serviceOrder);

    await deps.createNotifications(recipientUserIds, notificationPayload);

    for (const userId of recipientUserIds) {
      await deps.sendFirebase(buildFirebasePayload(userId, notificationPayload, serviceOrder));
    }

    await deps.markSent(serviceOrder.id, now);
    notifiedCount += 1;
  }

  return {
    processedCount: serviceOrders.length,
    notifiedCount,
    skippedEmptyRecipientCount,
  };
}
