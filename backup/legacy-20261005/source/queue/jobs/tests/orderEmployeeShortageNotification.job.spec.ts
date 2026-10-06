import {
  BranchManagerConfirmStatusEnum,
  NotificationTypeEnum,
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
  findEligibleOrders,
  processOrderEmployeeShortageNotifications,
  type OrderEmployeeShortageJobDeps,
  type OrderEmployeeShortageOrder,
} from "../orderEmployeeShortageNotification.job";

describe("processOrderEmployeeShortageNotifications", () => {
  type MockedDeps = OrderEmployeeShortageJobDeps & {
    findEligibleOrders: jest.Mock;
    findAdminUserIds: jest.Mock;
    findUserIdsByEmployeeIds: jest.Mock;
    createNotification: jest.Mock;
  };

  const now = new Date("2026-08-31T08:00:00.000Z");

  const createOrder = (
    overrides: Partial<OrderEmployeeShortageOrder> = {},
  ): OrderEmployeeShortageOrder => ({
    id: "order-1",
    code: "HD00001",
    status: OrderStatusEnum.PENDING,
    timeAt: new Date("2026-08-31T09:00:00.000Z"),
    employeeCount: 3,
    assignedEmployeeCount: 1,
    branchManagerId: "manager-employee-1",
    ...overrides,
  });

  const createDeps = (overrides: Partial<MockedDeps> = {}): MockedDeps => {
    const deps = {
      getNow: jest.fn().mockReturnValue(now),
      findEligibleOrders: jest.fn().mockResolvedValue([]),
      findAdminUserIds: jest.fn().mockResolvedValue([]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([]),
      createNotification: jest.fn().mockResolvedValue(undefined),
    } satisfies MockedDeps;

    return { ...deps, ...overrides };
  };

  it("notifies admins and the branch manager with the requested order message", async () => {
    const order = createOrder();
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["manager-user-1"]),
    });

    await expect(processOrderEmployeeShortageNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      notifiedCount: 1,
      skippedEmptyRecipientCount: 0,
    });

    expect(deps.getNow).toHaveBeenCalledTimes(1);
    expect(deps.findEligibleOrders).toHaveBeenCalledWith(now);
    expect(deps.findAdminUserIds).toHaveBeenCalledTimes(1);
    expect(deps.findUserIdsByEmployeeIds).toHaveBeenCalledWith(["manager-employee-1"]);
    expect(deps.createNotification).toHaveBeenCalledWith(
      ["admin-1", "manager-user-1"],
      {
        title: "Sắp xếp nhân sự hợp đồng",
        content: "Nhân sự cho hợp đồng HD00001 chưa đủ theo số lượng trong hợp đồng, vui lòng bổ xung sớm .",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: {
          orderId: "order-1",
          orderCode: "HD00001",
          employeeCount: 3,
          assignedEmployeeCount: 1,
        },
      },
      "HD00001",
    );
  });

  it("does not notify when assigned employees are enough or more than required", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([
        createOrder({ assignedEmployeeCount: 3 }),
        createOrder({ id: "order-2", assignedEmployeeCount: 4 }),
      ]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
    });

    await expect(processOrderEmployeeShortageNotifications(deps)).resolves.toEqual({
      ordersChecked: 2,
      notifiedCount: 0,
      skippedEmptyRecipientCount: 0,
    });

    expect(deps.findAdminUserIds).not.toHaveBeenCalled();
    expect(deps.createNotification).not.toHaveBeenCalled();
  });

  it("does not notify orders outside the two-hour start window or outside PENDING status", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([
        createOrder({
          id: "order-too-early",
          timeAt: new Date("2026-08-31T10:00:01.000Z"),
        }),
        createOrder({
          id: "order-processing",
          status: OrderStatusEnum.PROCESSING,
        }),
      ]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
    });

    await expect(processOrderEmployeeShortageNotifications(deps)).resolves.toEqual({
      ordersChecked: 2,
      notifiedCount: 0,
      skippedEmptyRecipientCount: 0,
    });

    expect(deps.findAdminUserIds).not.toHaveBeenCalled();
    expect(deps.createNotification).not.toHaveBeenCalled();
  });

  it("sends again on a later run while the shortage remains", async () => {
    const order = createOrder();
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
    });

    await processOrderEmployeeShortageNotifications(deps);
    await processOrderEmployeeShortageNotifications(deps);

    expect(deps.createNotification).toHaveBeenCalledTimes(2);
  });
});

describe("findEligibleOrders", () => {
  it("binds the two-hour cutoff as a timestamp", async () => {
    const now = new Date("2026-08-31T08:00:00.000Z");
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    const orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      }),
    } as unknown as Parameters<typeof findEligibleOrders>[0];

    await findEligibleOrders(orderRepository, now);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'pending_order."timeAt" <= :cutoff',
      { cutoff: new Date("2026-08-31T10:00:00.000Z") },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('pending_order."branchManagerConfirmedStatus" = :confirmationStatus'),
      { confirmationStatus: BranchManagerConfirmStatusEnum.CONFIRMED },
    );
  });
});
