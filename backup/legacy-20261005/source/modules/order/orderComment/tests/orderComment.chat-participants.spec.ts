import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/shared/utils/firebase/firebase.utils", () => ({
  __esModule: true,
  FirebaseUtils: {
    SentFirebaseWithUser: jest.fn(),
  },
}));

jest.mock("@/shared/utils/socket.utils", () => ({
  __esModule: true,
  SocketUtils: {
    getRoomMembers: jest.fn().mockResolvedValue([]),
    getUserSocket: jest.fn().mockReturnValue([]),
    broadcastToRoom: jest.fn(),
    sendSocketToUser: jest.fn(),
  },
}));

import { Request } from "express";
import { OrderCommentService } from "../orderComment.service";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";

describe("OrderCommentService chat participants", () => {
  it("returns unique users linked to OrderEmployee, OrderLeader, and order creator", async () => {
    const service = Object.create(
      OrderCommentService.prototype,
    ) as OrderCommentService;

    Object.assign(service as any, {
      orderEmployeeRepository: {
        findByOptions: jest.fn().mockResolvedValue([
          {
            employeeId: "employee-1",
            employee: {
              id: "employee-1",
              name: "Nhân viên 1",
              zaloName: "Zalo 1",
              user: { id: "user-1" },
            },
          },
          {
            employeeId: "employee-without-user",
            employee: {
              id: "employee-without-user",
              name: "Chưa có tài khoản",
              zaloName: "Chưa có tài khoản",
            },
          },
        ]),
      },
      orderLeaderRepository: {
        findByOptions: jest.fn().mockResolvedValue([
          {
            employeeId: "employee-1",
            employee: {
              id: "employee-1",
              name: "Nhân viên 1",
              zaloName: "Zalo 1",
              user: { id: "user-1" },
            },
          },
          {
            employeeId: "employee-2",
            employee: {
              id: "employee-2",
              name: "Quản lý đơn",
              zaloName: "Zalo quản lý",
              user: { id: "user-2" },
            },
          },
        ]),
      },
      orderRepository: {
        findByOption: jest.fn().mockResolvedValue({
          createdByEmployeeId: "employee-3",
          createdByEmployee: {
            id: "employee-3",
            name: "Nhân viên tạo đơn",
            zaloName: "Zalo tạo đơn",
            user: { id: "user-3" },
          },
        }),
      },
    });

    const response = await (service as any).getChatParticipants("order-id");

    expect(response.data).toEqual([
      {
        userId: "user-1",
        employeeId: "employee-1",
        name: "Nhân viên 1",
        zaloName: "Zalo 1",
      },
      {
        userId: "user-2",
        employeeId: "employee-2",
        name: "Quản lý đơn",
        zaloName: "Zalo quản lý",
      },
      {
        userId: "user-3",
        employeeId: "employee-3",
        name: "Nhân viên tạo đơn",
        zaloName: "Zalo tạo đơn",
      },
    ]);
  });

  it("notifies users linked to OrderLeader in the common order chat", async () => {
    const senderId = "sender-user-id";
    const notificationRepository = {
      create: jest.fn(),
    };
    const service = Object.create(
      OrderCommentService.prototype,
    ) as OrderCommentService;

    Object.assign(service as any, {
      userRepository: {
        findById: jest
          .fn()
          .mockResolvedValue({ id: senderId, name: "Người gửi" }),
        findAdminUser: jest
          .fn()
          .mockResolvedValue({ id: "admin-user-id", name: "Admin" }),
        findByOptions: jest.fn().mockResolvedValue([]),
      },
      orderEmployeeRepository: {
        getAllUsersByOrderId: jest
          .fn()
          .mockResolvedValue([
            { id: "order-employee-user-id", name: "Nhân viên" },
          ]),
      },
      orderLeaderRepository: {
        getAllUsersByOrderId: jest
          .fn()
          .mockResolvedValue([
            { id: "order-leader-user-id", name: "Quản lý đơn" },
          ]),
      },
      orderRepository: {
        findById: jest
          .fn()
          .mockResolvedValue({ id: "order-id", code: "DH10002", name: "Hợp đồng 001" }),
      },
      notificationRepository,
    });

    await service.actionAfterCreate(
      {
        orderId: "order-id",
        userId: senderId,
        content: "Cập nhật tiến độ",
      } as any,
      { user: { userId: senderId } } as Request,
      {} as any,
    );

    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "[DH10002]: Tin nhắn mới",
        details: expect.arrayContaining([
          { userId: "order-employee-user-id", isRead: false },
          { userId: "order-leader-user-id", isRead: false },
          { userId: "admin-user-id", isRead: false },
        ]),
      }),
      expect.anything(),
    );
  });

  it("sends the requested mention notification to tagged users", async () => {
    const senderId = "sender-user-id";
    const taggedUserId = "tagged-user-id";
    const notificationRepository = {
      create: jest.fn(),
    };
    const service = Object.create(
      OrderCommentService.prototype,
    ) as OrderCommentService;

    Object.assign(service as any, {
      userRepository: {
        findById: jest.fn().mockResolvedValue({ id: senderId, name: "Người gửi" }),
        findAdminUser: jest.fn().mockResolvedValue(null),
        findByOptions: jest.fn().mockResolvedValue([{ id: taggedUserId }]),
      },
      orderEmployeeRepository: {
        getAllUsersByOrderId: jest.fn().mockResolvedValue([]),
      },
      orderLeaderRepository: {
        getAllUsersByOrderId: jest.fn().mockResolvedValue([]),
      },
      orderRepository: {
        findById: jest.fn().mockResolvedValue({
          id: "order-id",
          code: "DH10002",
          name: "Hợp đồng 001",
        }),
      },
      notificationRepository,
    });

    await service.actionAfterCreate(
      {
        orderId: "order-id",
        userId: senderId,
        content: "Nội dung gốc",
        tags: [taggedUserId],
      } as any,
      { user: { userId: senderId } } as Request,
      {} as any,
    );

    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "[DH10002] bạn có tin nhắn mới",
        content: "Người gửi đã nhắc đến bạn trong hợp đồng Hợp đồng 001",
        details: [{ userId: taggedUserId, isRead: false }],
      }),
      expect.anything(),
    );
    expect(FirebaseUtils.SentFirebaseWithUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: taggedUserId,
        title: "[DH10002] bạn có tin nhắn mới",
        content: "Người gửi đã nhắc đến bạn trong hợp đồng Hợp đồng 001",
      }),
    );
  });
});
