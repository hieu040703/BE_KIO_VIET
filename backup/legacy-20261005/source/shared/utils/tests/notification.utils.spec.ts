import {
  buildOrderMentionNotification,
  formatOrderNotificationTitle,
} from "../notification.utils";

describe("formatOrderNotificationTitle", () => {
  it("prefixes an order title with the order code", () => {
    expect(formatOrderNotificationTitle("DH10002", "Bạn có tin nhắn mới")).toBe(
      "[DH10002]: Bạn có tin nhắn mới",
    );
  });

  it("does not duplicate an existing order prefix", () => {
    expect(
      formatOrderNotificationTitle(
        "DH10002",
        "[DH10002]: Cập nhật thông tin hợp đồng",
      ),
    ).toBe("[DH10002]: Cập nhật thông tin hợp đồng");
  });

  it("keeps non-order notification titles unchanged", () => {
    expect(formatOrderNotificationTitle(undefined, "Thông báo hệ thống")).toBe(
      "Thông báo hệ thống",
    );
  });

});

describe("buildOrderMentionNotification", () => {
  it("builds the requested title and content for a tagged employee", () => {
    expect(
      buildOrderMentionNotification(
        { code: "DH10002", name: "Hợp đồng 001" },
        { name: "Người gửi", username: "nguoi.gui" },
      ),
    ).toEqual({
      title: "[DH10002] bạn có tin nhắn mới",
      content: "Người gửi đã nhắc đến bạn trong hợp đồng Hợp đồng 001",
    });
  });
});
