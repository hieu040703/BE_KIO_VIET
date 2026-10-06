jest.mock("@/shared/config/firebase", () => ({
  __esModule: true,
  default: {
    messaging: jest.fn(),
  },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import admin from "@/shared/config/firebase";
import {
  FIREBASE_TOKEN_CLEANUP_CRON,
  isPermanentFirebaseTokenError,
  processFirebaseTokenCleanup,
  validateFirebaseTokens,
  type FirebaseTokenCleanupJobDeps,
} from "../firebaseTokenCleanup.job";

describe("Firebase token cleanup job", () => {
  it("runs every day at 01:00 in the configured cron expression", () => {
    expect(FIREBASE_TOKEN_CLEANUP_CRON).toBe("0 0 1 * * *");
  });

  it.each([
    "messaging/registration-token-not-registered",
    "messaging/invalid-registration-token",
  ])("recognizes %s as a permanent token error", (code) => {
    expect(isPermanentFirebaseTokenError({ code })).toBe(true);
  });

  it("does not classify transient Firebase errors as a permanent token error", () => {
    expect(isPermanentFirebaseTokenError({ code: "messaging/server-unavailable" })).toBe(false);
    expect(isPermanentFirebaseTokenError({ code: "messaging/message-rate-exceeded" })).toBe(false);
  });

  it("validates tokens in batches and clears only tokens rejected permanently", async () => {
    const findFirebaseTokens = jest
      .fn()
      .mockResolvedValueOnce([
        { id: "token-1", firebaseToken: "valid-token" },
        { id: "token-2", firebaseToken: "invalid-token" },
      ])
      .mockResolvedValueOnce([]);
    const validateTokens = jest.fn().mockResolvedValue(["invalid-token"]);
    const clearFirebaseTokens = jest.fn().mockResolvedValue(1);
    const deps: FirebaseTokenCleanupJobDeps = {
      findFirebaseTokens,
      validateFirebaseTokens: validateTokens,
      clearFirebaseTokens,
    };

    await expect(processFirebaseTokenCleanup(deps)).resolves.toEqual({
      tokensChecked: 2,
      tokensRemoved: 1,
      batches: 1,
    });

    expect(findFirebaseTokens).toHaveBeenNthCalledWith(1, undefined, 500);
    expect(findFirebaseTokens).toHaveBeenNthCalledWith(2, "token-2", 500);
    expect(validateTokens).toHaveBeenCalledWith(["valid-token", "invalid-token"]);
    expect(clearFirebaseTokens).toHaveBeenCalledWith(["invalid-token"]);
  });

  it("keeps moving the cursor when a batch has no invalid token", async () => {
    const findFirebaseTokens = jest
      .fn()
      .mockResolvedValueOnce([{ id: "token-1", firebaseToken: "valid-token" }])
      .mockResolvedValueOnce([{ id: "token-2", firebaseToken: "valid-token-2" }])
      .mockResolvedValueOnce([]);
    const validateTokens = jest.fn().mockResolvedValue([]);
    const clearFirebaseTokens = jest.fn();
    const deps: FirebaseTokenCleanupJobDeps = {
      findFirebaseTokens,
      validateFirebaseTokens: validateTokens,
      clearFirebaseTokens,
    };

    await expect(processFirebaseTokenCleanup(deps, { batchSize: 1 })).resolves.toEqual({
      tokensChecked: 2,
      tokensRemoved: 0,
      batches: 2,
    });

    expect(findFirebaseTokens).toHaveBeenNthCalledWith(2, "token-1", 1);
    expect(findFirebaseTokens).toHaveBeenNthCalledWith(3, "token-2", 1);
    expect(clearFirebaseTokens).not.toHaveBeenCalled();
  });

  it("maps permanent FCM failures to their corresponding tokens in dry-run mode", async () => {
    const sendEachForMulticast = jest.fn().mockResolvedValue({
      responses: [
        { success: true },
        { success: false, error: { code: "messaging/registration-token-not-registered" } },
        { success: false, error: { code: "messaging/server-unavailable" } },
        { success: false, error: { code: "messaging/invalid-registration-token" } },
      ],
    });
    (admin.messaging as jest.Mock).mockReturnValue({ sendEachForMulticast });

    await expect(
      validateFirebaseTokens(["valid-token", "expired-token", "temporary-error-token", "malformed-token"]),
    ).resolves.toEqual(["expired-token", "malformed-token"]);

    expect(sendEachForMulticast).toHaveBeenCalledWith(
      {
        tokens: ["valid-token", "expired-token", "temporary-error-token", "malformed-token"],
        data: { tokenValidation: "true" },
      },
      true,
    );
  });
});
