import {
  NotificationTypeEnum,
  OrderEmployeeStatusEnum,
  OrderStatusEnum,
} from "@/shared/constants/constance";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

import {
  buildUncheckedEmployeeFindOptions,
  findEligibleOrders,
  ORDER_CHECKIN_NOTIFICATION_CRON,
  processOrderCheckinNotifications,
  type OrderCheckinNotificationJobDeps,
  type OrderCheckinNotificationOrder,
  type UncheckedOrderEmployee,
} from "../orderCheckinNotification.job";

it("runs every three minutes", () => {
  expect(ORDER_CHECKIN_NOTIFICATION_CRON).toBe("0 */3 * * * *");
});

describe("buildUncheckedEmployeeFindOptions", () => {
  it("selects only confirmed employees while keeping Employee columns in select", () => {
    const options = buildUncheckedEmployeeFindOptions("order-1");

    expect(options.select.employee).toEqual({
      id: true,
      name: true,
      user: { id: true },
    });
    expect(options.relations).toEqual({
      employee: { user: true },
    });
    expect(options.relations.employee).not.toHaveProperty("id");
    expect(options.relations.employee).not.toHaveProperty("name");
    expect(options.where).toEqual(
      expect.objectContaining({ status: OrderEmployeeStatusEnum.CONFIRMED }),
    );
    expect(options.where.checkInAt).toEqual(
      expect.objectContaining({ _type: "isNull" }),
    );
    expect(options.where.deletedAt).toEqual(
      expect.objectContaining({ _type: "isNull" }),
    );
    expect(options.where).not.toHaveProperty("hasNotifiedCheckIn");
  });
});

describe("processOrderCheckinNotifications", () => {
  type MockedDeps = OrderCheckinNotificationJobDeps & {
    findEligibleOrders: jest.Mock;
    findUncheckedEmployees: jest.Mock;
    findAdminUserIds: jest.Mock;
    findUserIdsByEmployeeIds: jest.Mock;
    createNotification: jest.Mock;
  };

  const order: OrderCheckinNotificationOrder = {
    id: "order-1",
    code: "HD00001",
    name: "Lắp đặt máy lạnh",
    isUrgent: false,
    timeAt: new Date("2026-09-12T10:00:00.000Z"),
    branchManagerId: "manager-employee-1",
    createdByEmployeeId: "creator-employee-1",
  };

  const uncheckedEmployees: UncheckedOrderEmployee[] = [
    { id: "order-employee-1", employeeId: "employee-1", employee: { name: "Nguyễn Văn A" } },
    { id: "order-employee-2", employeeId: "employee-2", employee: { name: "Trần Văn B" } },
  ];

  const createDeps = (overrides: Partial<MockedDeps> = {}): MockedDeps => {
    const deps = {
      getNow: jest.fn(() => new Date("2026-09-12T09:40:00.000Z")),
      findEligibleOrders: jest.fn().mockResolvedValue([]),
      findUncheckedEmployees: jest.fn().mockResolvedValue([]),
      findAdminUserIds: jest.fn().mockResolvedValue([]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([]),
      createNotification: jest.fn().mockResolvedValue(undefined),
    } satisfies MockedDeps;

    return { ...deps, ...overrides };
  };

  it("notifies each unchecked employee and also notifies management", async () => {
    const findUserIdsByEmployeeIds = jest.fn().mockImplementation((employeeIds: string[]) => {
      if (employeeIds[0] === "employee-1") {
        return ["employee-user-1", "employee-user-2"];
      }

      return ["manager-user-1", "creator-user-1"];
    });
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findUncheckedEmployees: jest.fn().mockResolvedValue(uncheckedEmployees),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1", "manager-user-1"]),
      findUserIdsByEmployeeIds,
    });

    await expect(processOrderCheckinNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      employeesNotified: 2,
      skippedEmptyRecipientCount: 0,
    });

    expect(findUserIdsByEmployeeIds).toHaveBeenNthCalledWith(1, ["employee-1", "employee-2"]);
    expect(findUserIdsByEmployeeIds).toHaveBeenNthCalledWith(2, [
      "manager-employee-1",
      "creator-employee-1",
    ]);
    expect(deps.createNotification).toHaveBeenNthCalledWith(
      1,
      ["employee-user-1", "employee-user-2"],
      {
        title: "Vui lòng thực hiện checkin đơn hàng",
        content: "Bạn chưa thực hiện checkin đơn hàng HD00001, vui lòng vào thực hiện checkin sớm.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: {
          orderId: "order-1",
          orderCode: "HD00001",
        },
      },
      "HD00001",
    );
    expect(deps.createNotification).toHaveBeenNthCalledWith(
      2,
      ["admin-1", "manager-user-1", "creator-user-1"],
      {
        title: "Nhân viên chưa checkin - Lắp đặt máy lạnh",
        content:
          "[ĐƠN THƯỜNG] HD00001: Nguyễn Văn A, Trần Văn B chưa thực hiện checkin.\nVui lòng đôn đốc nhân viên.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: {
          orderId: "order-1",
          orderCode: "HD00001",
          orderName: "Lắp đặt máy lạnh",
          isUrgent: false,
          uncheckedEmployees: [
            { employeeId: "employee-1", employeeName: "Nguyễn Văn A" },
            { employeeId: "employee-2", employeeName: "Trần Văn B" },
          ],
        },
      },
      "HD00001",
    );
  });

  it("sends the warning again every time the job runs while employees remain unchecked", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findUncheckedEmployees: jest.fn().mockResolvedValue(uncheckedEmployees),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["employee-user-1"]),
    });

    await processOrderCheckinNotifications(deps);
    await processOrderCheckinNotifications(deps);

    expect(deps.createNotification).toHaveBeenCalledTimes(4);
  });

  it("still notifies unchecked employees when no management user has an app account", async () => {
    const findUserIdsByEmployeeIds = jest.fn().mockImplementation((employeeIds: string[]) => {
      return employeeIds[0] === "employee-1" ? ["employee-user-1"] : [];
    });
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findUncheckedEmployees: jest.fn().mockResolvedValue(uncheckedEmployees),
      findUserIdsByEmployeeIds,
    });

    await expect(processOrderCheckinNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      employeesNotified: 2,
      skippedEmptyRecipientCount: 0,
    });

    expect(deps.createNotification).toHaveBeenCalledTimes(1);
    expect(deps.createNotification).toHaveBeenCalledWith(
      ["employee-user-1"],
      expect.objectContaining({ title: "Vui lòng thực hiện checkin đơn hàng" }),
      "HD00001",
    );
  });

  it("skips an order when all management recipients have no app account", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findUncheckedEmployees: jest.fn().mockResolvedValue(uncheckedEmployees),
    });

    await expect(processOrderCheckinNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      employeesNotified: 0,
      skippedEmptyRecipientCount: 1,
    });

    expect(deps.createNotification).not.toHaveBeenCalled();
  });
});

describe("findEligibleOrders", () => {
  it("includes orders whose start time is within the next twenty minutes", async () => {
    const findByOptions = jest.fn().mockResolvedValue([]);
    const orderRepository = { findByOptions } as unknown as Parameters<typeof findEligibleOrders>[0];
    const now = new Date("2026-09-12T09:40:00.000Z");

    await findEligibleOrders(orderRepository, now);

    expect(findByOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: expect.anything(),
          timeAt: expect.objectContaining({ _value: new Date("2026-09-12T10:00:00.000Z") }),
        }),
      }),
    );
    expect(findByOptions.mock.calls[0][0].where.status).toEqual(
      expect.objectContaining({ _value: [OrderStatusEnum.PENDING, OrderStatusEnum.PROCESSING] }),
    );
  });
});
