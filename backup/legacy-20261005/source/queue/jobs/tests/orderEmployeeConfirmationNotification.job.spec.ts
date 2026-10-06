import {
  BranchManagerConfirmStatusEnum,
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
  findEligibleOrders,
  ORDER_EMPLOYEE_CONFIRMATION_NOTIFICATION_CRON,
  processOrderEmployeeConfirmationNotifications,
  type OrderEmployeeConfirmationJobDeps,
  type OrderEmployeeConfirmationOrder,
} from "../orderEmployeeConfirmationNotification.job";

it("runs every two minutes", () => {
  expect(ORDER_EMPLOYEE_CONFIRMATION_NOTIFICATION_CRON).toBe("0 */2 * * * *");
});

describe("processOrderEmployeeConfirmationNotifications", () => {
  type MockedDeps = OrderEmployeeConfirmationJobDeps & {
    findEligibleOrders: jest.Mock;
    findAdminUserIds: jest.Mock;
    findUserIdsByEmployeeIds: jest.Mock;
    createNotification: jest.Mock;
  };

  const createOrder = (
    overrides: Partial<OrderEmployeeConfirmationOrder> = {},
  ): OrderEmployeeConfirmationOrder => ({
    id: "order-1",
    code: "HD00001",
    branchManagerId: "manager-employee-1",
    pendingEmployees: [
      { employeeId: "employee-1", employeeName: "Nguyễn Văn A" },
      { employeeId: "employee-2", employeeName: "Trần Văn B" },
    ],
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

  it("notifies pending employees and admins plus the branch manager", async () => {
    const order = createOrder();
    const findUserIdsByEmployeeIds = jest.fn().mockImplementation(async (employeeIds: string[]) => {
      if (employeeIds.length === 1 && employeeIds[0] === "manager-employee-1") {
        return ["manager-user-1"];
      }

      return ["employee-user-1", "employee-user-2"];
    });
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1", "manager-user-1"]),
      findUserIdsByEmployeeIds,
    });

    await expect(processOrderEmployeeConfirmationNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      notifiedCount: 1,
      skippedEmptyRecipientCount: 0,
    });

    expect(findUserIdsByEmployeeIds).toHaveBeenNthCalledWith(1, ["employee-1", "employee-2"]);
    expect(findUserIdsByEmployeeIds).toHaveBeenNthCalledWith(2, ["manager-employee-1"]);
    expect(deps.createNotification).toHaveBeenNthCalledWith(
      1,
      ["employee-user-1", "employee-user-2"],
      {
        title: "Yêu cầu xác nhận tham gia hợp đồng",
        content: "Vui lòng nhanh chóng vào xác nhận đồng ý hoặc từ chối tham gia hợp đồng.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: {
          orderId: "order-1",
          orderCode: "HD00001",
          pendingEmployees: [
            { employeeId: "employee-1", employeeName: "Nguyễn Văn A" },
            { employeeId: "employee-2", employeeName: "Trần Văn B" },
          ],
        },
      },
      "HD00001",
    );
    expect(deps.createNotification).toHaveBeenNthCalledWith(
      2,
      ["admin-1", "manager-user-1"],
      {
        title: "Nhân viên chưa xác nhận tham gia hợp đồng",
        content:
          "Nhân viên Nguyễn Văn A, Trần Văn B chưa xác nhận đồng ý hoặc từ chối tham gia hợp đồng, vui lòng chủ động đôn đốc nhân viên.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: {
          orderId: "order-1",
          orderCode: "HD00001",
          pendingEmployees: [
            { employeeId: "employee-1", employeeName: "Nguyễn Văn A" },
            { employeeId: "employee-2", employeeName: "Trần Văn B" },
          ],
        },
      },
      "HD00001",
    );
  });

  it("still notifies admins when pending employees have no app users", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder()]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
    });

    await expect(processOrderEmployeeConfirmationNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      notifiedCount: 1,
      skippedEmptyRecipientCount: 0,
    });

    expect(deps.createNotification).toHaveBeenCalledTimes(1);
    expect(deps.createNotification).toHaveBeenCalledWith(
      ["admin-1"],
      expect.objectContaining({ title: "Nhân viên chưa xác nhận tham gia hợp đồng" }),
      "HD00001",
    );
  });

  it("sends the reminder again while employees remain pending", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder()]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["employee-user-1"]),
    });

    await processOrderEmployeeConfirmationNotifications(deps);
    await processOrderEmployeeConfirmationNotifications(deps);

    expect(deps.createNotification).toHaveBeenCalledTimes(4);
  });

  it("skips an order when no pending employee or management user has an app account", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder()]),
    });

    await expect(processOrderEmployeeConfirmationNotifications(deps)).resolves.toEqual({
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

  it("selects pending orders with confirmed branch manager and pending employees", async () => {
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
      expect.stringContaining('pending_order."branchManagerConfirmedStatus" = :confirmationStatus'),
      { confirmationStatus: BranchManagerConfirmStatusEnum.CONFIRMED },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('pending_order_employee."status" = :employeeStatus'),
      { employeeStatus: OrderEmployeeStatusEnum.PENDING },
    );
  });

  it("groups pending employees under their order", async () => {
    const queryBuilder = createQueryBuilder([
      {
        order_id: "order-1",
        order_code: "HD00001",
        branch_manager_id: "manager-employee-1",
        employee_id: "employee-1",
        employee_name: "Nguyễn Văn A",
      },
      {
        order_id: "order-1",
        order_code: "HD00001",
        branch_manager_id: "manager-employee-1",
        employee_id: "employee-2",
        employee_name: "Trần Văn B",
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
        pendingEmployees: [
          { employeeId: "employee-1", employeeName: "Nguyễn Văn A" },
          { employeeId: "employee-2", employeeName: "Trần Văn B" },
        ],
      },
    ]);
  });
});
