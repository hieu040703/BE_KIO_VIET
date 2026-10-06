import { NotificationTypeEnum, OrderStatusEnum } from "@/shared/constants/constance";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

import {
  ORDER_EMPLOYEE_CALL_CONFIRMATION_NOTIFICATION_CRON,
  findEligibleOrders,
  processOrderEmployeeCallConfirmationNotifications,
  type OrderEmployeeCallConfirmationJobDeps,
  type OrderEmployeeCallConfirmationOrder,
} from "../orderEmployeeCallConfirmationNotification.job";

it("runs every ten minutes", () => {
  expect(ORDER_EMPLOYEE_CALL_CONFIRMATION_NOTIFICATION_CRON).toBe("0 */10 * * * *");
});

describe("processOrderEmployeeCallConfirmationNotifications", () => {
  type MockedDeps = OrderEmployeeCallConfirmationJobDeps & {
    findEligibleOrders: jest.Mock;
    findAdminUserIds: jest.Mock;
    findUserIdsByEmployeeIds: jest.Mock;
    createNotification: jest.Mock;
  };

  const createOrder = (
    overrides: Partial<OrderEmployeeCallConfirmationOrder> = {},
  ): OrderEmployeeCallConfirmationOrder => ({
    id: "order-1",
    code: "HD00001",
    branchManagerId: "manager-employee-1",
    leaderEmployeeIds: ["leader-employee-1", "leader-employee-2"],
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

  it("notifies every leader user of an order with the requested customer-call message", async () => {
    const order = createOrder();
    const findUserIdsByEmployeeIds = jest.fn().mockImplementation((employeeIds: string[]) => {
      if (employeeIds[0] === "manager-employee-1") {
        return ["manager-user-1"];
      }

      return ["leader-user-1", "leader-user-2"];
    });
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-user-1"]),
      findUserIdsByEmployeeIds,
    });

    await expect(processOrderEmployeeCallConfirmationNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      notifiedCount: 1,
      skippedEmptyRecipientCount: 0,
    });

    expect(deps.findUserIdsByEmployeeIds).toHaveBeenCalledWith([
      "leader-employee-1",
      "leader-employee-2",
    ]);
    expect(deps.findAdminUserIds).toHaveBeenCalledTimes(1);
    expect(deps.findUserIdsByEmployeeIds).toHaveBeenCalledWith(["manager-employee-1"]);
    expect(deps.createNotification).toHaveBeenCalledWith(
      ["leader-user-1", "leader-user-2", "admin-user-1", "manager-user-1"],
      {
        title: "Chưa gọi xác nhận khách hàng",
        content: "Vui lòng nhanh chóng gọi cho khách hàng để xác nhận thông tin.",
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

  it("deduplicates users when multiple leader employees map to the same user", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder({ branchManagerId: null })]),
      findAdminUserIds: jest.fn().mockResolvedValue(["leader-user-1"]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([
        "leader-user-1",
        "leader-user-1",
        "leader-user-2",
      ]),
    });

    await processOrderEmployeeCallConfirmationNotifications(deps);

    expect(deps.createNotification).toHaveBeenCalledWith(
      ["leader-user-1", "leader-user-2"],
      expect.any(Object),
      "HD00001",
    );
  });

  it("skips an order when none of its leader employees has an app user", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder({ branchManagerId: null })]),
    });

    await expect(processOrderEmployeeCallConfirmationNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      notifiedCount: 0,
      skippedEmptyRecipientCount: 1,
    });

    expect(deps.createNotification).not.toHaveBeenCalled();
  });
});

describe("findEligibleOrders", () => {
  const createQueryBuilder = (rows: unknown[] = []) => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  });

  it("selects only pending orders with active leaders and no completed customer call", async () => {
    const queryBuilder = createQueryBuilder();
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
      expect.stringContaining('leader_order_employee."isLeader" = true'),
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining("NOT EXISTS"),
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('cn."callId" IS NOT NULL'),
    );
  });

  it("groups every leader row under its order", async () => {
    const queryBuilder = createQueryBuilder([
      {
        order_id: "order-1",
        order_code: "HD00001",
        branch_manager_id: "manager-employee-1",
        leader_employee_id: "leader-employee-1",
      },
      {
        order_id: "order-1",
        order_code: "HD00001",
        branch_manager_id: "manager-employee-1",
        leader_employee_id: "leader-employee-2",
      },
    ]);
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
        leaderEmployeeIds: ["leader-employee-1", "leader-employee-2"],
      },
    ]);
  });
});
