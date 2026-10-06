import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { ZaloMessageHistoryService } from "../zaloMessageHistory.service";

describe("ZaloMessageHistoryService.resend", () => {
  it("passes the current history id so the resend updates the same record", async () => {
    const history = {
      id: "history-1",
      orderId: "order-1",
      customerId: "customer-1",
      requestPayload: { phone: "0901234567" },
    };
    const findById = jest.fn().mockResolvedValue(history);
    const sendMessage = jest.fn().mockResolvedValue({ error: 0 });
    const service = Object.create(ZaloMessageHistoryService.prototype) as ZaloMessageHistoryService;

    Object.assign(service as any, {
      zaloMessageHistoryRepository: { findById },
      zaloService: { sendMessage },
    });

    await service.resend("history-1");

    expect(sendMessage).toHaveBeenCalledWith(history.requestPayload, {
      historyId: "history-1",
      orderId: "order-1",
      customerId: "customer-1",
    });
  });
});
