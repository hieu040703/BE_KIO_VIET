import { UserRoleEnum } from "@/shared/constants/constance";
import {
  canAccessOrderLeaderChat,
  getOrderLeaderChatNotificationRecipients,
  isMessageAfterCursor,
} from "../orderLeaderChat.policy";

describe("OrderLeaderChat policy", () => {
  it("allows ADMIN for every order", () => {
    expect(
      canAccessOrderLeaderChat(
        { role: UserRoleEnum.ADMIN, employeeId: null },
        ["employee-1"],
      ),
    ).toBe(true);
  });

  it("allows MANAGER only when their employee is an active order leader", () => {
    expect(
      canAccessOrderLeaderChat(
        { role: UserRoleEnum.MANAGER, employeeId: "employee-1" },
        ["employee-1"],
      ),
    ).toBe(true);

    expect(
      canAccessOrderLeaderChat(
        { role: UserRoleEnum.MANAGER, employeeId: "employee-2" },
        ["employee-1"],
      ),
    ).toBe(false);
  });

  it("allows a non-admin user through active OrderLeader membership", () => {
    expect(
      canAccessOrderLeaderChat(
        { role: UserRoleEnum.EMPLOYEE, employeeId: "employee-1" },
        ["employee-1"],
      ),
    ).toBe(true);

    expect(
      canAccessOrderLeaderChat(
        { role: UserRoleEnum.USER, employeeId: null },
        ["employee-1"],
      ),
    ).toBe(false);
  });

  it("allows the employee who created the order", () => {
    expect(
      canAccessOrderLeaderChat(
        { role: UserRoleEnum.MANAGER, employeeId: "creator-1" },
        ["leader-1"],
        "creator-1",
      ),
    ).toBe(true);

    expect(
      canAccessOrderLeaderChat(
        { role: UserRoleEnum.MANAGER, employeeId: "employee-2" },
        ["leader-1"],
        "creator-1",
      ),
    ).toBe(false);
  });

  it("orders messages by timeAt and uses id only as a deterministic tie-breaker", () => {
    const cursor = { timeAt: new Date("2026-08-14T10:00:00.000Z"), id: "a" };

    expect(
      isMessageAfterCursor(
        { timeAt: new Date("2026-08-14T10:00:01.000Z"), id: "z" },
        cursor,
      ),
    ).toBe(true);
    expect(
      isMessageAfterCursor(
        { timeAt: new Date("2026-08-14T10:00:00.000Z"), id: "z" },
        cursor,
      ),
    ).toBe(true);
    expect(
      isMessageAfterCursor(
        { timeAt: new Date("2026-08-14T09:59:59.000Z"), id: "z" },
        cursor,
      ),
    ).toBe(false);
  });
});

describe("OrderLeaderChat notification recipients", () => {
  it("separates tagged recipients from generic chat recipients", () => {
    expect(
      getOrderLeaderChatNotificationRecipients(
        ["admin-user-id", "tagged-user-id", "sender-user-id"],
        "sender-user-id",
        ["tagged-user-id", "sender-user-id"],
      ),
    ).toEqual({
      recipientIds: ["admin-user-id", "tagged-user-id"],
      taggedRecipientIds: ["tagged-user-id"],
      genericRecipientIds: ["admin-user-id"],
    });
  });
});
