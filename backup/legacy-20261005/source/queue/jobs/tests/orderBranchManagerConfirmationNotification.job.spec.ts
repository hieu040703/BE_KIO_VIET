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
  ORDER_BRANCH_MANAGER_CONFIRMATION_NOTIFICATION_CRON,
  processOrderBranchManagerConfirmationNotifications,
  type OrderBranchManagerConfirmationJobDeps,
  type OrderBranchManagerConfirmationOrder,
} from "../orderBranchManagerConfirmationNotification.job";

it("runs every two minutes", () => {
  expect(ORDER_BRANCH_MANAGER_CONFIRMATION_NOTIFICATION_CRON).toBe("0 */2 * * * *");
});

describe("processOrderBranchManagerConfirmationNotifications", () => {
  type MockedDeps = OrderBranchManagerConfirmationJobDeps & {
    findEligibleOrders: jest.Mock;
    findAdminUserIds: jest.Mock;
    findUserIdsByEmployeeIds: jest.Mock;
    createNotification: jest.Mock;
  };

  const createOrder = (
    overrides: Partial<OrderBranchManagerConfirmationOrder> = {},
  ): OrderBranchManagerConfirmationOrder => ({
    id: "order-1",
    code: "HD00001",
    branchManagerId: "manager-employee-1",
    branchManagerZaloName: "Nguyễn A",
    ...overrides,
  });

  const createDeps = (overrides: Partial<MockedDeps> = {}): MockedDeps => {
    const deps = {
      findEligibleOrders: jest.fn().mockResolvedValue([]),
      findAdminUserIds: jest.fn().mockResolvedValue([]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([]),
      createNotification: jest.fn().mockResolvedValue(undefined),
    } satisfies MockedDeps;

    return { ...deps, ...overrides };
  };

  it("notifies admins and the branch manager with the confirmation request", async () => {
    const order = createOrder();
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1", "admin-1"]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([
        "manager-user-1",
        "manager-user-1",
      ]),
    });

    await expect(processOrderBranchManagerConfirmationNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      notifiedCount: 1,
      skippedEmptyRecipientCount: 0,
    });

    expect(deps.findAdminUserIds).toHaveBeenCalledTimes(1);
    expect(deps.findUserIdsByEmployeeIds).toHaveBeenCalledWith(["manager-employee-1"]);
    expect(deps.createNotification).toHaveBeenNthCalledWith(
      1,
      ["admin-1"],
      {
        title: "Quản lý Nguyễn A chưa xác nhận đơn hàng",
        content: "Vui lòng kiểm tra và nhắc quản lý chi nhánh xác nhận đơn hàng.",
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
      ["manager-user-1"],
      {
        title: "Yêu cầu xác nhận nhận đơn hàng",
        content: "Vui lòng vào xác nhận đồng ý hoặc từ chối nhận đơn hàng.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: {
          orderId: "order-1",
          orderCode: "HD00001",
        },
      },
      "HD00001",
    );
  });

  it("continues notifying admins when the order has no manager user", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder({ branchManagerId: null })]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
    });

    await expect(processOrderBranchManagerConfirmationNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      notifiedCount: 1,
      skippedEmptyRecipientCount: 0,
    });

    expect(deps.findUserIdsByEmployeeIds).not.toHaveBeenCalled();
    expect(deps.createNotification).toHaveBeenCalledWith(
      ["admin-1"],
      expect.any(Object),
      "HD00001",
    );
  });

  it("sends again on a later run while confirmation is still pending", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder()]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["manager-user-1"]),
    });

    await processOrderBranchManagerConfirmationNotifications(deps);
    await processOrderBranchManagerConfirmationNotifications(deps);

    expect(deps.createNotification).toHaveBeenCalledTimes(4);
  });

  it("skips an order when neither admins nor the manager has an app user", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder()]),
    });

    await expect(processOrderBranchManagerConfirmationNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      notifiedCount: 0,
      skippedEmptyRecipientCount: 1,
    });

    expect(deps.createNotification).not.toHaveBeenCalled();
  });
});

describe("findEligibleOrders", () => {
  it("selects non-deleted orders pending branch manager confirmation", async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    const orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      }),
    } as unknown as Parameters<typeof findEligibleOrders>[0];

    await findEligibleOrders(orderRepository);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      "pending_order.status = :status",
      { status: OrderStatusEnum.PENDING },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("pending_order.deletedAt IS NULL");
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('pending_order."branchManagerConfirmedStatus" = :confirmationStatus'),
      { confirmationStatus: BranchManagerConfirmStatusEnum.PENDING },
    );
  });

  it("maps the branch manager employee from the raw order row", async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          order_id: "order-1",
          order_code: "HD00001",
          branch_manager_id: "manager-employee-1",
          branch_manager_zalo_name: "Nguyễn A",
        },
      ]),
    };
    const orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      }),
    } as unknown as Parameters<typeof findEligibleOrders>[0];

    await expect(findEligibleOrders(orderRepository)).resolves.toEqual([
      {
        id: "order-1",
        code: "HD00001",
        branchManagerId: "manager-employee-1",
        branchManagerZaloName: "Nguyễn A",
      },
    ]);
  });
});
