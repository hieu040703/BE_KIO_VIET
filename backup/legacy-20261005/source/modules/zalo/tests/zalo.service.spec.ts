import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { ZaloMessageStatusEnum, ZaloTemplateTypeEnum } from "../zalo.constance";
import { ZaloService } from "../zalo.service";

const createService = (sendResult: unknown) => {
  const historyCreate = jest.fn().mockResolvedValue(undefined);
  const historyUpdate = jest.fn().mockResolvedValue(undefined);
  const attemptSend = jest.fn();

  if (sendResult instanceof Error) {
    attemptSend.mockRejectedValue(sendResult);
  } else {
    attemptSend.mockResolvedValue(sendResult);
  }

  const service = Object.create(ZaloService.prototype) as ZaloService;
  Object.assign(service as any, {
    zaloMessageHistoryRepository: { create: historyCreate, update: historyUpdate },
    resolvePhoneTemplate: jest.fn().mockResolvedValue({
      templateId: "123456",
      templateName: "Thông báo đơn hàng",
      templateType: ZaloTemplateTypeEnum.CREATE,
    }),
    attemptSend,
  });

  return { service, historyCreate, historyUpdate };
};

const dto = {
  phone: "0901234567",
  templateType: ZaloTemplateTypeEnum.CREATE,
  template_id: "",
  template_data: {
    name: "Nguyễn Văn A",
    phone: "0901234567",
    code: "HD001",
    address: "Hà Nội",
    date: "10:00:00 21/08/2026",
    status: "PENDING",
    price: 1_000_000,
    employee_count: 1,
    note: "",
    stringee: "",
  },
} as any;

describe("ZaloService.sendMessage history", () => {
  it("records a SENT history with order context when Zalo accepts the message", async () => {
    const { service, historyCreate } = createService({ error: 0, data: { msg_id: "msg-1" } });

    await service.sendMessage(dto, { orderId: "order-1", customerId: "customer-1" });

    expect(historyCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        customerId: "customer-1",
        templateId: 123456,
        templateName: "Thông báo đơn hàng",
        templateType: ZaloTemplateTypeEnum.CREATE,
        phone: "0901234567",
        msgId: "msg-1",
        status: ZaloMessageStatusEnum.SENT,
        errorCode: null,
        errorMessage: null,
        templateData: dto.template_data,
        requestPayload: dto,
        sentAt: expect.any(Date),
      }),
    );
  });

  it("records a FAILED history before propagating a Zalo error", async () => {
    const error = Object.assign(new Error("Zalo rejected the message"), { errorCode: 123 });
    const { service, historyCreate } = createService(error);

    await expect(service.sendMessage(dto, { orderId: "order-1", customerId: "customer-1" })).rejects.toThrow(
      "Zalo rejected the message",
    );

    expect(historyCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        customerId: "customer-1",
        status: ZaloMessageStatusEnum.FAILED,
        msgId: null,
        errorCode: 123,
        errorMessage: "Zalo rejected the message",
        requestPayload: dto,
        sentAt: expect.any(Date),
      }),
    );
  });

  it("stores the documented Vietnamese message for a known Zalo error code", async () => {
    const error = Object.assign(new Error("Zalo send message error -108: Phone number invalid"), {
      errorCode: -108,
    });
    const { service, historyCreate } = createService(error);

    await expect(service.sendMessage(dto, { orderId: "order-1", customerId: "customer-1" })).rejects.toThrow(
      "Zalo send message error -108: Phone number invalid",
    );

    expect(historyCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ZaloMessageStatusEnum.FAILED,
        errorCode: -108,
        errorMessage: "Số điện thoại không hợp lệ",
      }),
    );
  });

  it("updates the existing history instead of creating a new one when resending", async () => {
    const { service, historyCreate, historyUpdate } = createService({ error: 0, data: { msg_id: "msg-2" } });

    await service.sendMessage(dto, {
      historyId: "history-1",
      orderId: "order-1",
      customerId: "customer-1",
    });

    expect(historyCreate).not.toHaveBeenCalled();
    expect(historyUpdate).toHaveBeenCalledWith(
      "history-1",
      expect.objectContaining({
        orderId: "order-1",
        customerId: "customer-1",
        status: ZaloMessageStatusEnum.SENT,
        msgId: "msg-2",
        errorCode: null,
        errorMessage: null,
        sentAt: expect.any(Date),
      }),
    );
  });

  it("updates the existing history with FAILED when resending fails", async () => {
    const error = Object.assign(new Error("Zalo resend failed"), { errorCode: 456 });
    const { service, historyCreate, historyUpdate } = createService(error);

    await expect(
      service.sendMessage(dto, {
        historyId: "history-1",
        orderId: "order-1",
        customerId: "customer-1",
      }),
    ).rejects.toThrow("Zalo resend failed");

    expect(historyCreate).not.toHaveBeenCalled();
    expect(historyUpdate).toHaveBeenCalledWith(
      "history-1",
      expect.objectContaining({
        status: ZaloMessageStatusEnum.FAILED,
        msgId: null,
        errorCode: 456,
        errorMessage: "Zalo resend failed",
      }),
    );
  });
});
