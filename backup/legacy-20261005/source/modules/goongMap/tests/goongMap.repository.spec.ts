import { User } from "@/database/models/User";
import { GoongMapRepository, GoongActiveOrderTrackingTarget } from "../goongMap.repository";
import { FileCategoryEnum, FileStatusEnum, OrderStatusEnum, UserRoleEnum } from "@/shared/constants/constance";

const createQueryBuilderStub = (rows: GoongActiveOrderTrackingTarget[]) => {
  const queryBuilder = {
    innerJoin: jest.fn(),
    leftJoin: jest.fn(),
    select: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };

  Object.values(queryBuilder).forEach((method) => {
    if (method !== queryBuilder.getRawMany) {
      method.mockReturnValue(queryBuilder);
    }
  });

  return queryBuilder;
};

describe("GoongMapRepository.findActiveTrackingTargets", () => {
  it("returns every assigned employee target from active orders and joins a user account", async () => {
    const assignedTarget: GoongActiveOrderTrackingTarget = {
      orderId: "order-1",
      serviceOrderId: null,
      customerId: "customer-1",
      employeeId: "employee-1",
      employeeUserId: "user-1",
      customerUserId: null,
    };
    const assignedTargets: GoongActiveOrderTrackingTarget[] = [
      {
        ...assignedTarget,
        orderId: "order-2",
      },
      assignedTarget,
      {
        ...assignedTarget,
        employeeId: "employee-2",
        employeeUserId: "user-2",
      },
    ];
    const assignedQueryBuilder = createQueryBuilderStub(assignedTargets);
    const orderEmployeeRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(assignedQueryBuilder),
    };
    const repository = Object.create(GoongMapRepository.prototype) as GoongMapRepository;

    jest.spyOn(repository as any, "getOrderEmployeeRepository").mockReturnValue(orderEmployeeRepository);

    const result = await repository.findActiveTrackingTargets();

    expect(orderEmployeeRepository.createQueryBuilder).toHaveBeenCalledWith("orderEmployee");
    expect(assignedQueryBuilder.innerJoin).toHaveBeenCalledWith("orderEmployee.order", "trackedOrder");
    expect(assignedQueryBuilder.innerJoin).toHaveBeenCalledWith("orderEmployee.employee", "employee");
    expect(assignedQueryBuilder.innerJoin).toHaveBeenCalledWith("employee.user", "employeeUser");
    expect(assignedQueryBuilder.leftJoin).toHaveBeenCalledWith(
      User,
      "customerUser",
      '"customerUser"."customerId" = "trackedOrder"."customerId"',
    );
    expect(result).toEqual(assignedTargets);
  });
});

describe("GoongMapRepository.findProcessingOrderMapData", () => {
  it("loads active employee avatar files for the map response", async () => {
    const orderRows = [
      {
        orderId: "order-1",
        code: "HD-001",
        name: "Đơn đang xử lý",
        timeAt: new Date("2026-08-20T08:00:00.000Z"),
        status: OrderStatusEnum.PROCESSING,
        address: null,
      },
    ];
    const employeeRows = [
      {
        orderId: "order-1",
        employeeId: "employee-1",
        employeeCode: "NV001",
        employeeName: "Phúc",
        employeePhone: "0900000001",
        employeeZaloName: "Phúc Zalo",
        isLeader: false,
        checkInAt: new Date("2026-08-20T08:01:00.000Z"),
        checkOutAt: new Date("2026-08-20T17:01:00.000Z"),
        avatar: null,
      },
    ];
    const createQueryBuilder = <T,>(rows: T[]) => {
      const queryBuilder: Record<string, jest.Mock> = {
        innerJoin: jest.fn(),
        select: jest.fn(),
        where: jest.fn(),
        andWhere: jest.fn(),
        orderBy: jest.fn(),
        addOrderBy: jest.fn(),
        skip: jest.fn(),
        take: jest.fn(),
        distinctOn: jest.fn(),
        getRawMany: jest.fn().mockResolvedValue(rows),
      };

      Object.values(queryBuilder).forEach((method) => {
        if (method !== queryBuilder.getRawMany) {
          method.mockReturnValue(queryBuilder);
        }
      });

      return queryBuilder;
    };
    const orderQuery = createQueryBuilder(orderRows);
    const countQuery = { getCount: jest.fn().mockResolvedValue(1) };
    orderQuery.clone = jest.fn().mockReturnValue(countQuery);
    const employeeQuery = createQueryBuilder(employeeRows);
    const locationQuery = createQueryBuilder([]);
    const orderRepository = { createQueryBuilder: jest.fn().mockReturnValue(orderQuery) };
    const orderEmployeeRepository = { createQueryBuilder: jest.fn().mockReturnValue(employeeQuery) };
    const locationRepository = { createQueryBuilder: jest.fn().mockReturnValue(locationQuery) };
    const fileRepository = {
      find: jest.fn().mockResolvedValue([
        {
          entityId: "employee-1",
          url: "/uploads/phuc.jpg",
          thumbnailUrl: "/uploads/phuc-thumb.jpg",
          isMain: true,
        },
      ]),
    };
    const repository = Object.create(GoongMapRepository.prototype) as GoongMapRepository;

    jest.spyOn(repository as any, "getOrderRepository").mockReturnValue(orderRepository);
    jest.spyOn(repository as any, "getOrderEmployeeRepository").mockReturnValue(orderEmployeeRepository);
    jest.spyOn(repository as any, "getLocationRepository").mockReturnValue(locationRepository);
    jest.spyOn(repository as any, "getFileRepository").mockReturnValue(fileRepository);

    const result = await repository.findProcessingOrderMapData(1, 500, {
      user: { role: UserRoleEnum.ADMIN },
    } as any);

    expect(fileRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: FileCategoryEnum.AVATAR,
          status: FileStatusEnum.ACTIVE,
        }),
      }),
    );
    expect(employeeQuery.select).toHaveBeenCalledWith(
      expect.arrayContaining([
        '"orderEmployee"."checkInAt" AS "checkInAt"',
        '"orderEmployee"."checkOutAt" AS "checkOutAt"',
      ]),
    );
    expect(result.data[0].employees[0].avatarUrl).toBe("/uploads/phuc-thumb.jpg");
    expect(result.data[0].employees[0].phone).toBe("0900000001");
    expect(result.data[0].employees[0].zaloName).toBe("Phúc Zalo");
    expect(result.data[0].employees[0].checkInAt).toBe("2026-08-20T08:01:00.000Z");
    expect(result.data[0].employees[0].checkOutAt).toBe("2026-08-20T17:01:00.000Z");
  });
});
