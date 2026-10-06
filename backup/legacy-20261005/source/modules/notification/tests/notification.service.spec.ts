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
    SentFirebaseWithUser: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("@/shared/utils/socket.utils", () => ({
  __esModule: true,
  SocketUtils: {
    sendSocketToMultipleUsers: jest.fn(),
    sendSocketToUser: jest.fn(),
  },
}));

import { NotificationTypeEnum } from "@/shared/constants/constance";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { NotificationService } from "../notification.service";

describe("NotificationService order title contract", () => {
  it("uses the order code in the persisted, socket, and Firebase titles", async () => {
    const createdAt = new Date("2026-09-04T01:05:00.000Z");
    const updatedAt = new Date("2026-09-04T01:05:00.000Z");
    const notificationRepository = {
      create: jest.fn().mockResolvedValue({
        id: "notification-1",
        title: "[DH10002]: Bạn có tin nhắn mới",
        content: "Nội dung",
        type: NotificationTypeEnum.CHAT,
        objectId: "order-1",
        metadata: { orderId: "order-1" },
        timeAt: createdAt,
        createdAt,
        updatedAt,
      }),
    };
    const notificationDetailRepository = {
      createMany: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(
      NotificationService.prototype,
    ) as NotificationService;

    Object.assign(service as any, {
      notificationRepository,
      notificationDetailRepository,
    });

    await service.createNotificationForMultipleUsers(
      ["user-1"],
      {
        title: "Bạn có tin nhắn mới",
        content: "Nội dung",
        type: NotificationTypeEnum.CHAT,
        objectId: "order-1",
        metadata: { orderId: "order-1" },
      },
      {} as any,
      { orderCode: "DH10002" },
    );

    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "[DH10002]: Bạn có tin nhắn mới" }),
      expect.anything(),
    );
    expect(SocketUtils.sendSocketToMultipleUsers).toHaveBeenCalledWith(
      "notification",
      ["user-1"],
      expect.objectContaining({
        id: "notification-1",
        title: "[DH10002]: Bạn có tin nhắn mới",
        content: "Nội dung",
        type: NotificationTypeEnum.CHAT,
        objectId: "order-1",
        metadata: { orderId: "order-1" },
        timeAt: createdAt,
        createdAt,
        updatedAt,
        isRead: false,
      }),
    );
    expect(FirebaseUtils.SentFirebaseWithUser).toHaveBeenCalledWith(
      expect.objectContaining({
        orderCode: "DH10002",
        title: "[DH10002]: Bạn có tin nhắn mới",
      }),
    );
  });

  it("adds the warning icon once to ALERT titles across all delivery channels", async () => {
    const notificationRepository = {
      create: jest.fn().mockImplementation((data) => ({
        id: "notification-alert-1",
        ...data,
      })),
    };
    const notificationDetailRepository = {
      createMany: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(
      NotificationService.prototype,
    ) as NotificationService;

    Object.assign(service as any, {
      notificationRepository,
      notificationDetailRepository,
    });

    await service.createNotificationForMultipleUsers(
      ["user-alert-1"],
      {
        title: "Yêu cầu xác nhận nhận đơn hàng",
        content: "Nội dung cảnh báo",
        type: NotificationTypeEnum.ALERT,
      },
      {} as any,
      { orderCode: "DH_ALERT" },
    );

    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "[DH_ALERT]: ⚠️ Yêu cầu xác nhận nhận đơn hàng",
        type: NotificationTypeEnum.ALERT,
      }),
      expect.anything(),
    );
    expect(SocketUtils.sendSocketToMultipleUsers).toHaveBeenCalledWith(
      "notification",
      ["user-alert-1"],
      expect.objectContaining({
        title: "[DH_ALERT]: ⚠️ Yêu cầu xác nhận nhận đơn hàng",
        type: NotificationTypeEnum.ALERT,
      }),
    );
    expect(FirebaseUtils.SentFirebaseWithUser).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "[DH_ALERT]: ⚠️ Yêu cầu xác nhận nhận đơn hàng",
      }),
    );
  });

  it("does not duplicate the warning icon when the caller already includes it", async () => {
    const notificationRepository = {
      create: jest.fn().mockImplementation((data) => ({
        id: "notification-alert-2",
        ...data,
      })),
    };
    const notificationDetailRepository = {
      createMany: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(
      NotificationService.prototype,
    ) as NotificationService;

    Object.assign(service as any, {
      notificationRepository,
      notificationDetailRepository,
    });

    await service.createNotificationForMultipleUsers(
      ["user-alert-2"],
      {
        title: "⚠️ Nhân viên chưa checkin",
        content: "Nội dung cảnh báo",
        type: NotificationTypeEnum.ALERT,
      },
      {} as any,
      { orderCode: "DH_CHECKIN" },
    );

    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "[DH_CHECKIN]: ⚠️ Nhân viên chưa checkin",
      }),
      expect.anything(),
    );
  });

  it("also adds the warning icon to ALERT titles in test-send", async () => {
    const notificationRepository = {
      create: jest.fn().mockImplementation((data) => ({
        id: "notification-alert-test-send",
        ...data,
      })),
    };
    const notificationDetailRepository = {
      create: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(
      NotificationService.prototype,
    ) as NotificationService;

    Object.assign(service as any, {
      notificationRepository,
      notificationDetailRepository,
    });

    await service.testSendNotification(
      "user-alert-test-send",
      {
        title: "Cảnh báo kiểm tra",
        content: "Nội dung cảnh báo",
        type: NotificationTypeEnum.ALERT,
      },
      {} as any,
    );

    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "⚠️ Cảnh báo kiểm tra",
        type: NotificationTypeEnum.ALERT,
      }),
      expect.anything(),
    );
  });
});
