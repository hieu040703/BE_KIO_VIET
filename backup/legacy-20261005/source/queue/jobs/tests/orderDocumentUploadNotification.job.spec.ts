import {
  EntityTypeEnum,
  FileStatusEnum,
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
  ORDER_DOCUMENT_UPLOAD_MIN_TIME_AT,
  ORDER_DOCUMENT_UPLOAD_NOTIFICATION_CRON,
  processOrderDocumentUploadNotifications,
  type OrderDocumentUploadNotificationJobDeps,
  type OrderDocumentUploadNotificationOrder,
} from "../orderDocumentUploadNotification.job";

it("runs every five minutes", () => {
  expect(ORDER_DOCUMENT_UPLOAD_NOTIFICATION_CRON).toBe("0 */5 * * * *");
});

describe("processOrderDocumentUploadNotifications", () => {
  type MockedDeps = OrderDocumentUploadNotificationJobDeps & {
    findEligibleOrders: jest.Mock;
    findAdminUserIds: jest.Mock;
    findUserIdsByEmployeeIds: jest.Mock;
    createNotification: jest.Mock;
  };

  const createOrder = (
    overrides: Partial<OrderDocumentUploadNotificationOrder> = {},
  ): OrderDocumentUploadNotificationOrder => ({
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

  it("notifies management and leaders with their respective document messages", async () => {
    const order = createOrder();
    const findUserIdsByEmployeeIds = jest.fn().mockImplementation(async (employeeIds: string[]) => {
      if (employeeIds[0] === "manager-employee-1") {
        return ["admin-1", "shared-user"];
      }
      return ["shared-user", "leader-user-1", "leader-user-1"];
    });
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([order]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1", "shared-user"]),
      findUserIdsByEmployeeIds,
    });

    await expect(processOrderDocumentUploadNotifications(deps)).resolves.toEqual({
      ordersChecked: 1,
      notifiedCount: 1,
      skippedEmptyRecipientCount: 0,
    });

    expect(deps.createNotification).toHaveBeenNthCalledWith(
      1,
      ["admin-1", "shared-user"],
      {
        title: "Hợp đồng chưa đầy đủ tài liệu chứng từ",
        content: "Hợp đồng chưa được cập nhật đầy đủ tài liệu chứng từ.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: { orderId: "order-1", orderCode: "HD00001" },
      },
      "HD00001",
    );
    expect(deps.createNotification).toHaveBeenNthCalledWith(
      2,
      ["shared-user", "leader-user-1"],
      {
        title: "Hợp đồng chưa đầy đủ tài liệu chứng từ",
        content: "Vui lòng cập nhật đầy đủ tài liệu chứng từ cho hợp đồng.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: { orderId: "order-1", orderCode: "HD00001" },
      },
      "HD00001",
    );
    expect(findUserIdsByEmployeeIds).toHaveBeenNthCalledWith(1, ["manager-employee-1"]);
    expect(findUserIdsByEmployeeIds).toHaveBeenNthCalledWith(2, [
      "leader-employee-1",
      "leader-employee-2",
    ]);
  });

  it("sends the warning again while the completed order still has no document", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder()]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
    });

    await processOrderDocumentUploadNotifications(deps);
    await processOrderDocumentUploadNotifications(deps);

    expect(deps.createNotification).toHaveBeenCalledTimes(2);
  });

  it("skips an order when no management or leader user exists", async () => {
    const deps = createDeps({
      findEligibleOrders: jest.fn().mockResolvedValue([createOrder()]),
    });

    await expect(processOrderDocumentUploadNotifications(deps)).resolves.toEqual({
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
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  });

  it("selects completed orders without an active ORDER file", async () => {
    const queryBuilder = createQueryBuilder();
    const orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      }),
    } as unknown as Parameters<typeof findEligibleOrders>[0];

    await findEligibleOrders(orderRepository);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      "completed_order.status = :status",
      { status: OrderStatusEnum.COMPLETED },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("completed_order.deletedAt IS NULL");
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'completed_order."timeAt" >= :minTimeAt',
      { minTimeAt: ORDER_DOCUMENT_UPLOAD_MIN_TIME_AT },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining("NOT EXISTS"),
      expect.objectContaining({
        entityType: EntityTypeEnum.ORDER,
        fileStatus: FileStatusEnum.ACTIVE,
      }),
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('contract_file."entityId" = completed_order.id'),
      expect.any(Object),
    );
  });

  it("groups active leader rows under the completed order", async () => {
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
      {
        order_id: "order-2",
        order_code: "HD00002",
        branch_manager_id: null,
        leader_employee_id: null,
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
      {
        id: "order-2",
        code: "HD00002",
        branchManagerId: null,
        leaderEmployeeIds: [],
      },
    ]);
  });
});
