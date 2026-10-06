import "reflect-metadata";
import { Readable } from "stream";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/shared/utils/redis.helper", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock("@/shared/utils/firebase/firebase.utils", () => ({
  FirebaseUtils: {
    SentFirebaseWithUser: jest.fn(),
  },
}));

jest.mock("@/shared/utils/redis-sse.utils", () => ({
  RedisSSEBroadcaster: {
    sendToUser: jest.fn(),
  },
}));

jest.mock("@/shared/utils/socket.utils", () => ({
  SocketUtils: {
    sendSocketToUser: jest.fn(),
  },
}));

jest.mock("../../order/orderComment/orderComment.service", () => ({
  OrderCommentService: class {},
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

import axios from "axios";
import { config } from "@/shared/config/env";
import redisHelper from "@/shared/utils/redis.helper";
import { StringeeService } from "../stringee.service";

const mockedAxiosGet = axios.get as jest.Mock;
const mockedRedisGet = redisHelper.get as jest.Mock;

describe("StringeeService.getRecordingStream", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    config.STRINGEE_API_BASE_URL = "https://asia-3.api.stringee.com";
  });

  it("sends the REST auth header and forwards the browser range request to Stringee", async () => {
    const stream = Readable.from(["audio-data"]);
    mockedAxiosGet.mockResolvedValue({
      status: 206,
      data: stream,
      headers: {
        "content-type": "audio/mpeg",
        "content-length": "10",
        "content-range": "bytes 0-9/100",
        "accept-ranges": "bytes",
        "content-disposition": "inline",
      },
    });

    const callHistoryRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "history-1",
        recordingUrl: "https://api.stringee.com/v1/call/recording/call-1",
      }),
    };
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository,
      generateRestApiToken: jest.fn().mockResolvedValue("rest-token"),
    });

    const result = await service.getRecordingStream("history-1", "bytes=0-9");

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "https://asia-3.api.stringee.com/v1/call/recording/call-1",
      expect.objectContaining({
        responseType: "stream",
        headers: {
          "X-STRINGEE-AUTH": "rest-token",
          Range: "bytes=0-9",
        },
      }),
    );
    expect(result).toEqual({
      stream,
      statusCode: 206,
      headers: {
        "content-type": "audio/mpeg",
        "content-length": "10",
        "content-range": "bytes 0-9/100",
        "accept-ranges": "bytes",
        "content-disposition": "inline",
      },
    });
  });

  it("normalizes Stringee play URLs to the authenticated recorded-file endpoint", async () => {
    const stream = Readable.from(["audio-data"]);
    mockedAxiosGet.mockResolvedValue({
      status: 200,
      data: stream,
      headers: { "content-type": "audio/mpeg" },
    });
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository: {
        findById: jest.fn().mockResolvedValue({
          id: "history-1",
          recordingUrl: "https://api.stringee.com/v1/call/play/call-1?access_token=stale-token",
        }),
      },
      generateRestApiToken: jest.fn().mockResolvedValue("rest-token"),
    });

    await service.getRecordingStream("history-1");

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "https://asia-3.api.stringee.com/v1/call/recording/call-1",
      expect.anything(),
    );
  });

  it.each(["api.stringee.com", "icc-api.stringee.com", "asia-3.api.stringee.com"])(
    "routes stored URLs from %s to the configured region without stale tokens",
    (host) => {
      const service = Object.create(StringeeService.prototype) as any;
      expect(service.buildRecordingDownloadUrl(`https://${host}/v1/call/play/call-1?access_token=old`))
        .toBe("https://asia-3.api.stringee.com/v1/call/recording/call-1");
      config.STRINGEE_API_BASE_URL = "https://api.stringee.com";
      expect(service.buildRecordingDownloadUrl(`https://${host}/v1/call/recording/call-1`))
        .toBe("https://api.stringee.com/v1/call/recording/call-1");
    },
  );

  it("accepts a raw recording ID from the recording webhook", async () => {
    const stream = Readable.from(["audio-data"]);
    mockedAxiosGet.mockResolvedValue({
      status: 200,
      data: stream,
      headers: { "content-type": "audio/mpeg" },
    });
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository: {
        findById: jest.fn().mockResolvedValue({
          id: "history-1",
          recordingUrl: "call-vn-1-FBD02F8DVN-1522686858914",
        }),
      },
      generateRestApiToken: jest.fn().mockResolvedValue("rest-token"),
    });

    await service.getRecordingStream("history-1");

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "https://asia-3.api.stringee.com/v1/call/recording/call-vn-1-FBD02F8DVN-1522686858914",
      expect.anything(),
    );
  });

  it("uses the Stringee callId before parsing the stored recording URL", async () => {
    const stream = Readable.from(["audio-data"]);
    mockedAxiosGet.mockResolvedValue({
      status: 200,
      data: stream,
      headers: { "content-type": "audio/mpeg" },
    });
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository: {
        findById: jest.fn().mockResolvedValue({
          id: "history-1",
          callId: "call-vn-1-FBD02F8DVN-1522686858914",
          recordingUrl: "https://api.stringee.com/v1/call/play/another-record-id",
        }),
      },
      generateRestApiToken: jest.fn().mockResolvedValue("rest-token"),
    });

    await service.getRecordingStream("history-1");

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "https://asia-3.api.stringee.com/v1/call/recording/call-vn-1-FBD02F8DVN-1522686858914",
      expect.anything(),
    );
  });

  it("rejects a call history without a recording instead of making an unauthenticated upstream request", async () => {
    const callHistoryRepository = {
      findById: jest.fn().mockResolvedValue({ id: "history-1", recordingUrl: null }),
    };
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository,
      generateRestApiToken: jest.fn(),
    });

    await expect(service.getRecordingStream("history-1")).rejects.toThrow("Recording not found");

    expect(service.generateRestApiToken).not.toHaveBeenCalled();
    expect(mockedAxiosGet).not.toHaveBeenCalled();
  });

  it("rejects non-Stringee recording URLs before making an upstream request", async () => {
    const callHistoryRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "history-1",
        recordingUrl: "https://example.com/recording.mp3",
      }),
    };
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository,
      generateRestApiToken: jest.fn(),
    });

    await expect(service.getRecordingStream("history-1")).rejects.toThrow(
      "Invalid Stringee recording URL",
    );

    expect(service.generateRestApiToken).not.toHaveBeenCalled();
    expect(mockedAxiosGet).not.toHaveBeenCalled();
  });

  it("marks the proxied response as an attachment when download is requested", async () => {
    const stream = Readable.from(["audio-data"]);
    mockedAxiosGet.mockResolvedValue({
      status: 200,
      data: stream,
      headers: { "content-type": "audio/mpeg" },
    });
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository: {
        findById: jest.fn().mockResolvedValue({
          id: "history-1",
          recordingUrl: "https://api.stringee.com/v1/call/recording/call-1",
        }),
      },
      generateRestApiToken: jest.fn().mockResolvedValue("rest-token"),
    });

    const result = await service.getRecordingStream("history-1", undefined, true);

    expect(result.headers["content-disposition"]).toBe(
      'attachment; filename="call-recording-history-1.mp3"',
    );
  });

  it("reports a safe upstream status when Stringee rejects the recording request", async () => {
    const destroy = jest.fn();
    mockedAxiosGet.mockResolvedValue({
      status: 403,
      data: { destroy },
      headers: {},
    });
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository: {
        findById: jest.fn().mockResolvedValue({
          id: "history-1",
          recordingUrl: "call-vn-1-FBD02F8DVN-1522686858914",
        }),
      },
      generateRestApiToken: jest.fn().mockResolvedValue("rest-token"),
    });

    await expect(service.getRecordingStream("history-1")).rejects.toThrow(
      "Stringee authentication failed (HTTP 403)",
    );
    expect(destroy).toHaveBeenCalled();
  });

  it("reports a safe network error code when the Stringee request cannot connect", async () => {
    mockedAxiosGet.mockRejectedValue(Object.assign(new Error("socket hang up"), { code: "ECONNRESET" }));
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository: {
        findById: jest.fn().mockResolvedValue({
          id: "history-1",
          recordingUrl: "call-vn-1-FBD02F8DVN-1522686858914",
        }),
      },
      generateRestApiToken: jest.fn().mockResolvedValue("rest-token"),
    });

    await expect(service.getRecordingStream("history-1")).rejects.toThrow(
      "Stringee recording request failed (ECONNRESET)",
    );
  });

  it("namespaces the cached REST token by Stringee API key", async () => {
    mockedRedisGet.mockResolvedValue("cached-token");
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      apiKeySid: "sid-1",
      apiKeySecret: "secret-1",
    });

    await expect(service.generateRestApiToken()).resolves.toBe("cached-token");

    expect(mockedRedisGet).toHaveBeenCalledWith("STRINGEE_REST_API_TOKEN:sid-1");
  });
});

describe("StringeeService.handleStartedCall", () => {
  const callerId = "11111111-1111-4111-8111-111111111111";
  const receiverId = "22222222-2222-4222-8222-222222222222";
  const orderId = "33333333-3333-4333-8333-333333333333";

  it("persists ATA metadata and employee display names from Stringee customData", async () => {
    const callHistoryRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository,
      employeeRepository: {
        findByUserId: jest.fn().mockImplementation(async (userId: string) => ({
          name: userId === callerId ? "Nhân viên A" : "Nhân viên B",
          zaloName: userId === callerId ? "Zalo A" : null,
          user: { id: userId },
        })),
      },
      userRepository: {
        findById: jest.fn(),
      },
    });

    await service.handleStartedCall({
      call_id: "call-ata-1",
      from: { type: "internal", number: callerId },
      to: { type: "internal", number: receiverId },
      customData: JSON.stringify({
        callType: "ATA",
        callerId,
        receiverId,
        callerPhoneNumber: "Zalo A",
        receiverPhoneNumber: "Nhân viên B",
      }),
    });

    expect(callHistoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        callId: "call-ata-1",
        callType: "ATA",
        callerId,
        receiverId,
        callerPhoneNumber: "Zalo A",
        receiverPhoneNumber: "Nhân viên B",
        orderId: null,
      }),
    );
  });

  it("persists PTP employee/customer identities and related order", async () => {
    const callHistoryRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      callHistoryRepository,
      employeeRepository: {
        findByUserId: jest.fn(),
      },
      userRepository: {
        findById: jest.fn(),
      },
    });

    await service.handleStartedCall({
      call_id: "call-ptp-1",
      from: { type: "external", number: "84901234567" },
      to: { type: "external", number: "84907654321" },
      customData: JSON.stringify({
        callType: "PTP",
        orderId,
        callerId,
        receiverId: null,
        callerPhoneNumber: "84901234567",
        receiverPhoneNumber: "84907654321",
      }),
    });

    expect(callHistoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        callId: "call-ptp-1",
        callType: "PTP",
        orderId,
        callerId,
        receiverId: null,
        callerPhoneNumber: "84901234567",
        receiverPhoneNumber: "84907654321",
      }),
    );
  });
});

describe("StringeeService.handleAnswerUrl call metadata", () => {
  const callerId = "11111111-1111-4111-8111-111111111111";
  const receiverId = "22222222-2222-4222-8222-222222222222";
  const orderId = "33333333-3333-4333-8333-333333333333";

  it("passes ATA identities and employee names to the event webhook", async () => {
    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      employeeRepository: {
        findByUserId: jest.fn().mockImplementation(async (userId: string) => ({
          name: userId === callerId ? "Nhân viên A" : "Nhân viên B",
          zaloName: userId === callerId ? "Zalo A" : null,
          user: { id: userId },
        })),
      },
    });

    const result = await service.handleAnswerUrl({
      from: callerId,
      to: receiverId,
      fromInternal: "true",
      userId: callerId,
      callId: "call-ata-2",
    });
    const metadata = JSON.parse(result[1].customData);

    expect(metadata).toEqual(
      expect.objectContaining({
        callType: "ATA",
        callerId,
        receiverId,
        callerPhoneNumber: "Zalo A",
        receiverPhoneNumber: "Nhân viên B",
      }),
    );
  });

  it("passes PTP order and routed employee receiver to the event webhook", async () => {
    const originalConfig = {
      realNumber: config.STRINGEE_REAL_NUMBER,
      virtualNumber: config.STRINGEE_VIRTUAL_NUMBER,
      hotlineNumber: config.HOTLINE_NUMBER,
    };
    config.STRINGEE_REAL_NUMBER = "84990000001";
    config.STRINGEE_VIRTUAL_NUMBER = "1110001013";
    config.HOTLINE_NUMBER = "84991111111";

    const service = Object.create(StringeeService.prototype) as any;
    Object.assign(service, {
      employeeRepository: {
        findEmployeeByPhone: jest.fn().mockResolvedValue(null),
        findById: jest.fn().mockResolvedValue({ phone: "84907654321" }),
      },
      customerRepository: {
        findByOption: jest.fn().mockResolvedValue({
          id: "customer-1",
          name: "Khách hàng",
          phone: "84901234567",
        }),
      },
      callNavigationRepository: {
        findByOptions: jest.fn().mockResolvedValue([
          { id: "navigation-1", orderId, userId: receiverId, updatedAt: new Date() },
        ]),
      },
      userRepository: {
        getEmployeeByUserId: jest.fn().mockResolvedValue("employee-1"),
        findById: jest.fn().mockResolvedValue({ id: receiverId }),
      },
    });

    try {
      const result = await service.handleAnswerUrl({
        from: "84901234567",
        to: "1110001013",
        fromInternal: "false",
        callId: "call-ptp-2",
      });
      const metadata = JSON.parse(result[1].customData);

      expect(metadata).toEqual(
        expect.objectContaining({
          callType: "PTP",
          orderId,
          callerId: null,
          receiverId,
          callerPhoneNumber: "84901234567",
          receiverPhoneNumber: "84907654321",
        }),
      );
    } finally {
      config.STRINGEE_REAL_NUMBER = originalConfig.realNumber;
      config.STRINGEE_VIRTUAL_NUMBER = originalConfig.virtualNumber;
      config.HOTLINE_NUMBER = originalConfig.hotlineNumber;
    }
  });
});
