import { buildProcessingOrderMapItems } from "../goongMap.map";
import { OrderStatusEnum } from "@/shared/constants/constance";

describe("buildProcessingOrderMapItems", () => {
  it("attaches locations for all assigned employees that have a location", () => {
    const result = buildProcessingOrderMapItems(
      [
        {
          orderId: "order-1",
          code: "HD-001",
          name: "Đơn đang xử lý",
          timeAt: new Date("2026-08-20T08:00:00.000Z"),
          status: OrderStatusEnum.PROCESSING,
          address: {
            detail: "Số 1 Hà Nội",
            latitude: 21.0285,
            longitude: 105.8542,
          },
        },
      ],
      [
        {
          orderId: "order-1",
          employeeId: "employee-1",
          employeeCode: "NV001",
          employeeName: "Nguyễn Văn A",
          employeePhone: "0900000001",
          employeeZaloName: "Nguyễn A",
          isLeader: true,
          checkInAt: new Date("2026-08-20T08:01:00.000Z"),
          checkOutAt: new Date("2026-08-20T17:01:00.000Z"),
          avatar: [
            {
              url: "/uploads/avatar-a.jpg",
              thumbnailUrl: "/uploads/avatar-a-thumb.jpg",
              isMain: true,
            },
          ],
        },
        {
          orderId: "order-1",
          employeeId: "employee-2",
          employeeCode: "NV002",
          employeeName: "Trần Văn B",
          employeePhone: null,
          employeeZaloName: null,
          isLeader: false,
          checkInAt: null,
          checkOutAt: null,
          avatar: null,
        },
        {
          orderId: "order-1",
          employeeId: "employee-3",
          employeeCode: "NV003",
          employeeName: "Lê Văn C",
          employeePhone: null,
          employeeZaloName: null,
          isLeader: false,
          checkInAt: null,
          checkOutAt: null,
          avatar: null,
        },
      ],
      [
        {
          orderId: "order-1",
          employeeId: "employee-1",
          latitude: 21.03,
          longitude: 105.86,
          accuracy: 8,
          capturedAt: new Date("2026-08-20T08:05:00.000Z"),
        },
        {
          orderId: "order-1",
          employeeId: "employee-2",
          latitude: 21.04,
          longitude: 105.87,
          accuracy: 12,
          capturedAt: new Date("2026-08-20T08:06:00.000Z"),
        },
        {
          orderId: "order-1",
          employeeId: "employee-outside-order",
          latitude: 21.05,
          longitude: 105.88,
          accuracy: 10,
          capturedAt: new Date("2026-08-20T08:07:00.000Z"),
        },
      ],
    );

    expect(result[0].employees).toEqual([
      {
        id: "employee-1",
        code: "NV001",
        name: "Nguyễn Văn A",
        phone: "0900000001",
        zaloName: "Nguyễn A",
        isLeader: true,
        avatarUrl: "/uploads/avatar-a-thumb.jpg",
        checkInAt: "2026-08-20T08:01:00.000Z",
        checkOutAt: "2026-08-20T17:01:00.000Z",
        latestLocation: {
          latitude: 21.03,
          longitude: 105.86,
          accuracy: 8,
          capturedAt: "2026-08-20T08:05:00.000Z",
        },
      },
      {
        id: "employee-2",
        code: "NV002",
        name: "Trần Văn B",
        phone: null,
        zaloName: null,
        isLeader: false,
        avatarUrl: null,
        checkInAt: null,
        checkOutAt: null,
        latestLocation: {
          latitude: 21.04,
          longitude: 105.87,
          accuracy: 12,
          capturedAt: "2026-08-20T08:06:00.000Z",
        },
      },
      {
        id: "employee-3",
        code: "NV003",
        name: "Lê Văn C",
        phone: null,
        zaloName: null,
        isLeader: false,
        avatarUrl: null,
        checkInAt: null,
        checkOutAt: null,
        latestLocation: null,
      },
    ]);
  });

  it("uses OrderEmployee rows as the only source of field staff", () => {
    const result = buildProcessingOrderMapItems(
      [
        {
          orderId: "order-1",
          code: "HD-001",
          name: "Đơn đang xử lý",
          timeAt: new Date("2026-08-20T08:00:00.000Z"),
          status: OrderStatusEnum.PROCESSING,
          address: null,
        },
      ],
      [
        {
          orderId: "order-1",
          employeeId: "employee-1",
          employeeCode: "NV001",
          employeeName: "Nguyễn Văn A",
          employeePhone: null,
          employeeZaloName: null,
          isLeader: false,
          checkInAt: null,
          checkOutAt: null,
          avatar: null,
        },
        {
          orderId: "order-1",
          employeeId: "employee-2",
          employeeCode: "NV002",
          employeeName: "Trần Văn B",
          employeePhone: null,
          employeeZaloName: null,
          isLeader: true,
          checkInAt: null,
          checkOutAt: null,
          avatar: [],
        },
        {
          orderId: "order-1",
          employeeId: "employee-2",
          employeeCode: "NV002",
          employeeName: "Trần Văn B",
          employeePhone: null,
          employeeZaloName: null,
          isLeader: true,
          checkInAt: null,
          checkOutAt: null,
          avatar: [],
        },
      ],
      [
        {
          orderId: "order-1",
          employeeId: "employee-2",
          latitude: 21.03,
          longitude: 105.86,
          accuracy: 8,
          capturedAt: new Date("2026-08-20T08:05:00.000Z"),
        },
      ],
    );

    expect(result).toHaveLength(1);
    expect(result[0].employees).toEqual([
      {
        id: "employee-1",
        code: "NV001",
        name: "Nguyễn Văn A",
        phone: null,
        zaloName: null,
        isLeader: false,
        avatarUrl: null,
        checkInAt: null,
        checkOutAt: null,
        latestLocation: null,
      },
      {
        id: "employee-2",
        code: "NV002",
        name: "Trần Văn B",
        phone: null,
        zaloName: null,
        isLeader: true,
        avatarUrl: null,
        checkInAt: null,
        checkOutAt: null,
        latestLocation: {
          latitude: 21.03,
          longitude: 105.86,
          accuracy: 8,
          capturedAt: "2026-08-20T08:05:00.000Z",
        },
      },
    ]);
  });

  it("uses avatar file rows when the employee avatar column is empty", () => {
    const result = buildProcessingOrderMapItems(
      [
        {
          orderId: "order-1",
          code: "HD-001",
          name: "Đơn đang xử lý",
          timeAt: new Date("2026-08-20T08:00:00.000Z"),
          status: OrderStatusEnum.PROCESSING,
          address: null,
        },
      ],
      [
        {
          orderId: "order-1",
          employeeId: "employee-1",
          employeeCode: "NV001",
          employeeName: "Nguyễn Văn A",
          employeePhone: null,
          employeeZaloName: null,
          isLeader: false,
          checkInAt: null,
          checkOutAt: null,
          avatar: null,
        },
      ],
      [],
      [
        {
          employeeId: "employee-1",
          url: "/uploads/avatar-a.jpg",
          thumbnailUrl: "/uploads/avatar-a-thumb.jpg",
          isMain: true,
        },
      ],
    );

    expect(result[0].employees[0].avatarUrl).toBe("/uploads/avatar-a-thumb.jpg");
  });

  it("keeps an order visible when its address does not contain valid coordinates", () => {
    const result = buildProcessingOrderMapItems(
      [
        {
          orderId: "order-2",
          code: "HD-002",
          name: null,
          timeAt: new Date("2026-08-20T09:00:00.000Z"),
          status: OrderStatusEnum.PROCESSING,
          address: {
            detail: "Chưa có tọa độ",
            latitude: null,
            longitude: null,
          },
        },
      ],
      [],
      [],
    );

    expect(result[0].address).toEqual({
      detail: "Chưa có tọa độ",
      latitude: null,
      longitude: null,
    });
    expect(result[0].employees).toEqual([]);
  });
});
