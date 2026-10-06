jest.mock("@/shared/config/firebase", () => ({
  __esModule: true,
  default: {
    messaging: jest.fn(),
  },
}));

jest.mock("@/modules/container", () => ({
  container: {
    get: jest.fn(),
  },
}));

import admin from "@/shared/config/firebase";
import { container } from "@/modules/container";
import { FirebaseUtils } from "../firebase.utils";

describe("FirebaseUtils order title contract", () => {
  const sendEachForMulticast = jest.fn();
  const send = jest.fn();
  const tokenRepository = {
    findByOptions: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sendEachForMulticast.mockResolvedValue({
      failureCount: 0,
      responses: [{ success: true }],
    });
    send.mockResolvedValue({ messageId: "message-1" });
    (admin.messaging as jest.Mock).mockReturnValue({
      sendEachForMulticast,
      send,
    });
    tokenRepository.findByOptions.mockResolvedValue([
      { firebaseToken: "token-1" },
    ]);
    (container.get as jest.Mock).mockReturnValue(tokenRepository);
  });

  it.each([
    [
      "user",
      () =>
        FirebaseUtils.SentFirebaseWithUser({
          userId: "user-1",
          orderCode: "DH10002",
          title: "Bạn có tin nhắn mới",
          content: "Nội dung",
        }),
    ],
    [
      "token",
      () =>
        FirebaseUtils.SentFirebaseWithToken({
          token: "token-1",
          orderCode: "DH10002",
          title: "Bạn có tin nhắn mới",
          content: "Nội dung",
        }),
    ],
  ])(
    "prefixes the %s notification title",
    async (_target, sendNotification) => {
      await sendNotification();

      expect(sendEachForMulticast).toHaveBeenCalledWith(
        expect.objectContaining({
          notification: expect.objectContaining({
            title: "[DH10002]: Bạn có tin nhắn mới",
          }),
        }),
      );
    },
  );

  it("prefixes topic notification titles", async () => {
    await FirebaseUtils.SentFirebaseWithTopic({
      topic: "users",
      orderCode: "DH10002",
      title: "Cập nhật thông tin hợp đồng",
      content: "Nội dung",
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        notification: expect.objectContaining({
          title: "[DH10002]: Cập nhật thông tin hợp đồng",
        }),
      }),
    );
  });
});
