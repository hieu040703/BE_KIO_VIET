import { NotificationTypeEnum, ServiceOrderStatusEnum } from "@/shared/constants/constance";

import {
  processServiceOrderStartNotifications,
  type StartNotificationJobDeps,
  type StartNotificationServiceOrder,
} from "../serviceOrderStartNotification.job";

describe("processServiceOrderStartNotifications", () => {
  type MockedDeps = StartNotificationJobDeps & {
    getNow: jest.Mock;
    getReminderMinutes: jest.Mock;
    findEligibleServiceOrders: jest.Mock;
    findAdminUserIds: jest.Mock;
    findUserIdsByEmployeeIds: jest.Mock;
    createNotifications: jest.Mock;
    sendFirebase: jest.Mock;
    markSent: jest.Mock;
  };

  const now = new Date("2026-06-16T08:00:00.000Z");
  const reminderMinutes = 30;
  const timeAt = new Date("2026-06-16T08:30:00.000Z");

  const createServiceOrder = (
    overrides: Partial<StartNotificationServiceOrder> = {},
  ): StartNotificationServiceOrder => ({
    id: "service-order-1",
    status: ServiceOrderStatusEnum.CONFIRMED,
    timeAt,
    employeeId: "employee-1",
    branch: {
      employeeId: "manager-1",
    },
    ...overrides,
  });

  const createDeps = (
    overrides: Partial<MockedDeps> = {},
  ): MockedDeps => {
    const deps = {
      getNow: jest.fn().mockReturnValue(now),
      getReminderMinutes: jest.fn().mockResolvedValue(reminderMinutes),
      findEligibleServiceOrders: jest.fn().mockResolvedValue([]),
      findAdminUserIds: jest.fn().mockResolvedValue([]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([]),
      createNotifications: jest.fn().mockResolvedValue(undefined),
      sendFirebase: jest.fn().mockResolvedValue(undefined),
      markSent: jest.fn().mockResolvedValue(undefined),
    } satisfies MockedDeps;

    return {
      ...deps,
      ...overrides,
    };
  };

  it("notifies admins, assigned employee, and branch manager for a confirmed order in window", async () => {
    const serviceOrder = createServiceOrder();
    const deps = createDeps({
      findEligibleServiceOrders: jest.fn().mockResolvedValue([serviceOrder]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1", "admin-2"]),
      findUserIdsByEmployeeIds: jest
        .fn()
        .mockResolvedValue(["assigned-user-1", "branch-manager-user-1"]),
    });

    await processServiceOrderStartNotifications(deps);

    expect(deps.getReminderMinutes).toHaveBeenCalledTimes(1);
    expect(deps.findEligibleServiceOrders).toHaveBeenCalledWith({
      now,
      reminderMinutes,
    });
    expect(deps.findAdminUserIds).toHaveBeenCalledTimes(1);
    expect(deps.findUserIdsByEmployeeIds).toHaveBeenCalledWith(["employee-1", "manager-1"]);
    expect(deps.createNotifications).toHaveBeenCalledWith(
      ["admin-1", "admin-2", "assigned-user-1", "branch-manager-user-1"],
      {
        title: expect.any(String),
        content: expect.any(String),
        type: NotificationTypeEnum.SYSTEM,
        objectId: "service-order-1",
        metadata: {
          serviceOrderId: "service-order-1",
          event: "SERVICE_ORDER_START_REMINDER",
          timeAt,
        },
      },
    );
    expect(deps.sendFirebase).toHaveBeenCalledTimes(4);
    expect(deps.sendFirebase).toHaveBeenNthCalledWith(1, {
      userId: "admin-1",
      title: expect.any(String),
      content: expect.any(String),
      data: {
        type: NotificationTypeEnum.SYSTEM,
        serviceOrderId: "service-order-1",
        event: "SERVICE_ORDER_START_REMINDER",
        timeAt: timeAt.toISOString(),
      },
    });
    expect(deps.sendFirebase).toHaveBeenNthCalledWith(4, {
      userId: "branch-manager-user-1",
      title: expect.any(String),
      content: expect.any(String),
      data: {
        type: NotificationTypeEnum.SYSTEM,
        serviceOrderId: "service-order-1",
        event: "SERVICE_ORDER_START_REMINDER",
        timeAt: timeAt.toISOString(),
      },
    });
    expect(deps.markSent).toHaveBeenCalledWith("service-order-1", now);
  });

  it("dedupes recipients when the same user appears more than once", async () => {
    const deps = createDeps({
      findEligibleServiceOrders: jest.fn().mockResolvedValue([createServiceOrder()]),
      findAdminUserIds: jest.fn().mockResolvedValue(["shared-user", "admin-2", "shared-user"]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["shared-user", "employee-user"]),
    });

    await processServiceOrderStartNotifications(deps);

    expect(deps.createNotifications).toHaveBeenCalledWith(
      ["shared-user", "admin-2", "employee-user"],
      expect.any(Object),
    );
    expect(deps.sendFirebase).toHaveBeenCalledTimes(3);
  });

  it("prefixes the reminder title when the service order has a linked order code", async () => {
    const deps = createDeps({
      findEligibleServiceOrders: jest
        .fn()
        .mockResolvedValue([createServiceOrder({ orderCode: "DH10002" })]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
    });

    await processServiceOrderStartNotifications(deps);

    expect(deps.createNotifications.mock.calls[0][1].title).toBe(
      "[DH10002]: Nhắc lịch bắt đầu đơn dịch vụ",
    );
    expect(deps.sendFirebase.mock.calls[0][0].title).toBe(
      "[DH10002]: Nhắc lịch bắt đầu đơn dịch vụ",
    );
  });

  it("marks the order as sent only after successful notification delivery", async () => {
    const deps = createDeps({
      findEligibleServiceOrders: jest.fn().mockResolvedValue([createServiceOrder()]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
    });

    await processServiceOrderStartNotifications(deps);

    expect(deps.createNotifications.mock.invocationCallOrder[0]).toBeLessThan(
      deps.sendFirebase.mock.invocationCallOrder[0],
    );
    expect(deps.sendFirebase.mock.invocationCallOrder.at(-1) ?? 0).toBeLessThan(
      deps.markSent.mock.invocationCallOrder[0],
    );
  });

  it("skips notification and mark-sent when the final recipient list is empty", async () => {
    const deps = createDeps({
      findEligibleServiceOrders: jest.fn().mockResolvedValue([
        createServiceOrder({
          employeeId: null,
          branch: null,
        }),
      ]),
    });

    await processServiceOrderStartNotifications(deps);

    expect(deps.findUserIdsByEmployeeIds).toHaveBeenCalledWith([]);
    expect(deps.createNotifications).not.toHaveBeenCalled();
    expect(deps.sendFirebase).not.toHaveBeenCalled();
    expect(deps.markSent).not.toHaveBeenCalled();
  });

  it("ignores returned service orders that are not confirmed", async () => {
    const deps = createDeps({
      findEligibleServiceOrders: jest.fn().mockResolvedValue([
        createServiceOrder({
          status: ServiceOrderStatusEnum.CANCELED,
        }),
      ]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
    });

    await processServiceOrderStartNotifications(deps);

    expect(deps.findAdminUserIds).not.toHaveBeenCalled();
    expect(deps.createNotifications).not.toHaveBeenCalled();
    expect(deps.sendFirebase).not.toHaveBeenCalled();
    expect(deps.markSent).not.toHaveBeenCalled();
  });
});
