import { inject, injectable } from "inversify";
import jwt from "jsonwebtoken";
import axios from "axios";
import { Readable } from "stream";
import { config } from "@/shared/config/env";
import logger from "@/shared/utils/logger";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import { ApiResponse } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { CALL_HISTORY_TYPES } from "../callHistory/callHistory.types";
import { AdminCallHistoryRepository } from "../callHistory/admin.callHistory.repository";
import { CreateCallHistoryDto } from "../callHistory/callHistory.validator";
import { CallHistoryTypeEnum, NotificationTypeEnum, OrderStatusEnum } from "@/shared/constants/constance";
import { CUSTOMER_TYPES } from "../customer/customer.types";
import { CustomerRepository } from "../customer/customer.repository";
import { UserRepository } from "../user/user.repository";
import { USER_TYPES } from "../user/user.types";
import dayjs from "dayjs";
import { In, IsNull, MoreThan } from "typeorm";
import redisHelper from "@/shared/utils/redis.helper";
import { RedisSSEBroadcaster } from "@/shared/utils/redis-sse.utils";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { Customer } from "@/database/models/Customer";
import { AppError, BadRequestError, NotFoundError, ServiceUnavailableError } from "@/shared/types/errors";
import { ORDER_TYPES } from "../order/order.types";
import { OrderRepository } from "../order/order.repository";
import { EMPLOYEE_TYPES } from "../employee/employee.types";
import { EmployeeRepository } from "../employee/employee.repository";
import { CALL_NAVIGATION_TYPES } from "../callNavigation/callNavigation.types";
import { CallNavigationRepository } from "../callNavigation/callNavigation.repository";
import { CallNavigationRelations, CallNavigationSelectFull } from "../callNavigation/callNavigation.select";
import { Utils } from "@/shared/utils/utils";
import { ORDER_EMPLOYEE_TYPES } from "../order/orderEmployee/orderEmployee.types";
import { OrderEmployeeRepository } from "../order/orderEmployee/orderEmployee.repository";
import { EmployeeSelectBasic } from "../employee/employee.select";
import { ORDER_COMMENT_TYPES } from "../order/orderComment/orderComment.types";
import { OrderCommentService } from "../order/orderComment/orderComment.service";

type StringeeCallEndpointType = "internal" | "external";

interface StringeeSccoRecordAction {
  action: "record";
  eventUrl: string;
  format: "mp3" | "wav";
}

interface StringeeSccoConnectAction {
  action: "connect";
  from: {
    type: StringeeCallEndpointType;
    number: string;
    alias: string;
  };
  to: {
    type: StringeeCallEndpointType;
    number: string;
    alias: string;
  };
  customData?: string;
  timeout?: number;
}

interface StringeeRecordingStream {
  stream: Readable;
  statusCode: number;
  headers: Record<string, string>;
}

interface StringeeCallHistoryContext {
  callType?: CallHistoryTypeEnum;
  orderId?: string | null;
  callerId?: string | null;
  receiverId?: string | null;
  callerPhoneNumber?: string | null;
  receiverPhoneNumber?: string | null;
}

/**
 * Stringee Service
 *
 * Xử lý tích hợp Stringee Voice Call API:
 * - Generate access token cho client SDK (xác thực người dùng)
 * - Generate REST API token cho server-to-server calls
 * - Xử lý answer_url webhook (trả về SCCO cho Stringee Server)
 * - Xử lý event_url webhook (nhận sự kiện cuộc gọi)
 * - Make outbound call từ server (server-to-phone)
 *
 * Flow 2: App-to-phone call:
 * 1. Client App (Stringee SDK) gọi makeCall(from, to)
 * 2. Stringee Server gửi GET request tới answer_url của server
 * 3. Server trả về SCCO (Stringee Call Control Object)
 * 4. Stringee Server thực hiện cuộc gọi tới số điện thoại
 *
 * Flow 3: Receive a phone call (phone-to-app):
 * 1. Số điện thoại Stringee nhận cuộc gọi từ bên ngoài
 * 2. Stringee Server gửi GET request tới answer_url (fromInternal=false)
 * 3. Server trả về SCCO với to.type="internal" để route cuộc gọi vào app
 * 4. Stringee Server chuyển cuộc gọi tới Client App (Stringee SDK)
 */
@injectable()
export class StringeeService {
  private apiKeySid: string;
  private apiKeySecret: string;

  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(
    @inject(CALL_HISTORY_TYPES.AdminCallHistoryRepository) private callHistoryRepository: AdminCallHistoryRepository,
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
    @inject(CALL_NAVIGATION_TYPES.CallNavigationRepository) private callNavigationRepository: CallNavigationRepository,
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeRepository) private orderEmployeeRepository: OrderEmployeeRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentService) private orderCommentService: OrderCommentService,
  ) {
    this.apiKeySid = config.STRINGEE_API_KEY_SID;
    this.apiKeySecret = config.STRINGEE_API_KEY_SECRET;
  }

  private isValidUuid(value?: string | null): value is string {
    if (!value) {
      return false;
    }

    return StringeeService.UUID_REGEX.test(value);
  }

  private normalizeUserId(value?: string | null, context?: string): string | null {
    if (this.isValidUuid(value)) {
      return value;
    }

    if (value) {
      logger.warn(`[Stringee] Ignoring invalid UUID userId${context ? ` for ${context}` : ""}: ${value}`);
    }

    return null;
  }

  private async resolveExistingUserId(value?: string | null, context?: string): Promise<string | null> {
    const normalizedUserId = this.normalizeUserId(value, context);

    if (!normalizedUserId) {
      return null;
    }

    const user = await this.userRepository.findById(normalizedUserId);

    if (!user) {
      logger.warn(`[Stringee] Ignoring missing userId${context ? ` for ${context}` : ""}: ${normalizedUserId}`);
      return null;
    }

    return normalizedUserId;
  }

  private parseStringeeCustomData(value?: unknown): Record<string, unknown> {
    if (!value) {
      return {};
    }

    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
    } catch (error) {
      logger.warn(`[Stringee] Invalid custom payload received from Stringee`);
      return {};
    }
  }

  private getEmployeeDisplayName(employee?: { zaloName?: string | null; name?: string | null } | null): string | null {
    return employee?.zaloName || employee?.name || null;
  }

  private parseCallHistoryContext(value?: unknown): StringeeCallHistoryContext {
    const data = this.parseStringeeCustomData(value);
    const callType = data.callType === CallHistoryTypeEnum.ATA || data.callType === CallHistoryTypeEnum.PTP
      ? data.callType
      : undefined;

    return {
      callType,
      orderId: typeof data.orderId === "string" ? data.orderId : null,
      callerId: this.normalizeUserId(typeof data.callerId === "string" ? data.callerId : null, "callerId"),
      receiverId: this.normalizeUserId(typeof data.receiverId === "string" ? data.receiverId : null, "receiverId"),
      callerPhoneNumber:
        typeof data.callerPhoneNumber === "string" ? data.callerPhoneNumber : null,
      receiverPhoneNumber:
        typeof data.receiverPhoneNumber === "string" ? data.receiverPhoneNumber : null,
    };
  }

  private isPhoneLike(value?: string): boolean {
    return Boolean(value && /^\+?\d{8,15}$/.test(value));
  }

  private buildConnectScco(params: {
    from: string;
    to: string;
    fromType: StringeeCallEndpointType;
    toType: StringeeCallEndpointType;
    fromAlias?: string;
    toAlias?: string;
    customData?: Record<string, unknown>;
    timeout?: number;
  }): (StringeeSccoConnectAction | StringeeSccoRecordAction)[] {
    const { from, to, fromType, toType, fromAlias, toAlias, customData, timeout = 45 } = params;

    return [
      {
        action: "record",
        eventUrl: config.STRINGEE_RECORDING_URL,
        format: "mp3",
      },
      {
        action: "connect",
        from: {
          type: fromType,
          number: from,
          alias: fromAlias || from,
        },
        to: {
          type: toType,
          number: to,
          alias: toAlias || to,
        },
        customData: JSON.stringify({
          ...customData,
          timestamp: Date.now(),
        }),
        timeout,
      },
    ];
  }

  /**
   * Generate access token cho Stringee Client SDK
   * Client dùng token này để kết nối tới Stringee Server và thực hiện cuộc gọi
   *
   * JWT Format theo tài liệu Stringee:
   * - Header: { typ: "JWT", alg: "HS256", cty: "stringee-api;v=1" }
   * - Payload: { jti, iss, exp, userId }
   * - Signature: HMACSHA256 với apiKeySecret
   */
  generateAccessToken(userId: string, rest_api?: boolean): string {
    console.log(`[Stringee] Generating access token for userId: ${userId}`);
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // Token hết hạn sau 1 giờ

    const header = {
      typ: "JWT",
      alg: "HS256" as const,
      cty: "stringee-api;v=1",
    };

    const payload = {
      jti: `${this.apiKeySid}-${now}`,
      iss: this.apiKeySid,
      exp: exp,
      userId: userId,
      subscribe: "online_status,call_status,agent_manual_status",
      attributes: [
        {
          attribute: "onlineStatus",
          topic: "online_status",
        },
        {
          attribute: "call",
          topic: "call_status",
        },
        {
          attribute: "manualStatus",
          topic: "agent_manual_status",
        },
      ],
    };

    if (rest_api) {
      Object.assign(payload, { rest_api: true, exp: now + 2592000 }); // Token REST API có thể có thời hạn dài hơn, ví dụ 30 ngày
    }

    console.log(payload, this.apiKeySecret);

    const token = jwt.sign(payload, this.apiKeySecret, {
      algorithm: "HS256",
      header: header,
    });

    logger.info(`[Stringee] Generated access token for userId: ${userId}`);
    return token;
  }

  /**
   * Generate REST API token cho server-to-server calls
   * Dùng khi gọi Stringee REST API từ server (ví dụ: make outbound call)
   *
   * Khác với access token client: payload có rest_api: true thay vì userId
   */
  async generateRestApiToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 2592000; // Token REST API có thể có thời hạn dài hơn, ví dụ 30 ngày

    const header = {
      typ: "JWT",
      alg: "HS256" as const,
      cty: "stringee-api;v=1",
    };

    const payload = {
      jti: `${this.apiKeySid}-${now}`,
      iss: this.apiKeySid,
      exp: exp,
      rest_api: true,
    };

    const token = jwt.sign(payload, this.apiKeySecret, {
      algorithm: "HS256",
      header: header,
    });

    const tokenCacheKey = this.getRestApiTokenCacheKey();
    const tokenExisting = await redisHelper.get(tokenCacheKey);
    if (tokenExisting) {
      return tokenExisting;
    }

    // Write token to redis
    await redisHelper.set(tokenCacheKey, token, 2592000); // Lưu token trong Redis với TTL 30 ngày

    return token;
  }

  /**
   * Xử lý answer_url - trả về SCCO cho các flow cuộc gọi
   *
   * Flow 1 (App-to-app): fromInternal=true
   *   GET answer_url?from=user_1&to=user_2&fromInternal=true&userId=user_1&callId=xxx
   *   → SCCO: from.type="internal", to.type="internal"
   *
   * Flow 2 (App-to-phone): fromInternal=true
   *   GET answer_url?from=phone_number_1&to=phone_number_2&fromInternal=true&userId=user_1&callId=xxx
   *   → SCCO: from.type="internal", to.type="external"
   *
   * Flow 3 (Phone-to-app): fromInternal=false
   *   GET answer_url?from=caller_phone&to=stringee_number&fromInternal=false&callId=xxx&uuid=xxx
   *   → SCCO: from.type="external", to.type="internal" (route cuộc gọi vào app)
   *
   * Flow 4 (Phone-to-phone): fromInternal=false
   *   GET answer_url?from=caller_phone&to=caller_phone&fromInternal=false&callId=xxx&uuid=xxx
   *   → SCCO: from.type="external", to.type="external" (route cuộc gọi vào app)
   */
  async handleAnswerUrl(params: {
    from?: string;
    to?: string;
    fromInternal?: string;
    userId?: string;
    callId?: string;
    uuid?: string;
    custom?: {
      contractCode: string;
      contractName: string;
    };
  }): Promise<object[]> {
    const { from, to, fromInternal, userId, callId, uuid, custom } = params;

    //# Flow 1: App-to-App call (fromInternal=true, from/to là userId nhân viên)
    if (fromInternal === "true" && from && to) {
      const fromEmp = await this.employeeRepository.findByUserId(from);
      const toEmp = await this.employeeRepository.findByUserId(to);
      const callerId = fromEmp?.user?.id || this.normalizeUserId(userId || from, "ATA callerId");
      const receiverId = toEmp?.user?.id || this.normalizeUserId(to, "ATA receiverId");
      const callerPhoneNumber = this.getEmployeeDisplayName(fromEmp) || from;
      const receiverPhoneNumber = this.getEmployeeDisplayName(toEmp) || to;

      const scco = [
        {
          action: "record",
          eventUrl: config.STRINGEE_RECORDING_URL,
          format: "mp3",
        },
        {
          action: "connect",
          from: {
            type: "internal",
            number: from,
            alias: from,
          },
          to: {
            type: "internal",
            number: to,
            alias: to,
          },
          customData: JSON.stringify({
            userId: userId,
            callId: callId,
            timestamp: Date.now(),
            employee: fromEmp,
            callType: CallHistoryTypeEnum.ATA,
            callerId,
            receiverId,
            callerPhoneNumber,
            receiverPhoneNumber,
            contractCode: custom?.contractCode || null,
            contractName: custom?.contractName || null,
          }),
          timeout: 45,
        },
      ];

      // gửi thông báo fcm đánh thức mobile
      FirebaseUtils.SentFirebaseWithUser({
        userId: to,
        title: "Cuộc gọi đến",
        content: "Bạn nhận được cuộc gọi",
        data: { callId: callId, type: NotificationTypeEnum.CALL, employee: fromEmp },
      });

      return scco;
    }

    //# Flow 2: App-to-phone call (fromInternal=true, to là số điện thoại bên ngoài)
    // if (fromInternal === "true") {
    //   const scco = [
    //     {
    //       action: "record",
    //       eventUrl: config.STRINGEE_RECORDING_URL,
    //       format: "mp3",
    //     },
    //     {
    //       action: "connect",
    //       from: {
    //         type: "internal",
    //         number: from || config.STRINGEE_VIRTUAL_NUMBER.split(",")[0],
    //         alias: from || config.STRINGEE_VIRTUAL_NUMBER.split(",")[0],
    //       },
    //       to: {
    //         type: "external",
    //         number: to,
    //         alias: to,
    //       },
    //       customData: JSON.stringify({
    //         userId: userId,
    //         callId: callId,
    //         timestamp: Date.now(),
    //       }),
    //       timeout: 45,
    //     },
    //   ];
    //   console.log("data call:", userId, to, callId);
    //   if (userId && to && callId) {
    //     const result = await this.handleDriverCallCustomer(userId, to, callId);
    //     console.log("result", result);
    //     if (result) {
    //       logger.info(`[Stringee] Returning SCCO for app-to-phone call: ${JSON.stringify(scco)}`);
    //       return scco;
    //     } else {
    //       //? Nếu không tìm thấy chuyến đi nào phù hợp để điều hướng cuộc gọi, có thể trả về SCCO mặc định
    //       scco[1].to!.number = config.HOTLINE_NUMBER; // Mặc định route đến số tổng đài nếu không có điều hướng nào khác
    //       scco[1].to!.alias = config.HOTLINE_NUMBER;
    //     }
    //   }
    //   console.log("scco", scco);
    //   return scco;
    // }

    //# Flow 3: Phone-to-app call (fromInternal=false)
    // Cuộc gọi từ số điện thoại bên ngoài → route vào Client App (Stringee SDK)
    // - from: số điện thoại người gọi (external)
    // - to: user trong app sẽ nhận cuộc gọi (internal)
    // - Dùng STRINGEE_AGENT_USER_ID làm user mặc định nhận cuộc gọi

    // const scco = [
    //   {
    //     action: "record",
    //     eventUrl: config.STRINGEE_RECORDING_URL,
    //     format: "mp3",
    //   },
    //   {
    //     action: "connect",
    //     from: {
    //       type: "external",
    //       number: from,
    //       alias: from,
    //     },
    //     to: {
    //       type: "internal",
    //       number: config.STRINGEE_AGENT_USER_ID,
    //       alias: to, // Số Stringee nhận cuộc gọi
    //     },
    //     customData: JSON.stringify({
    //       callId: callId,
    //       uuid: uuid,
    //       callerNumber: from,
    //       stringeeNumber: to,
    //       timestamp: Date.now(),
    //       customerName: "",
    //     }),
    //     timeout: 45,
    //   },
    // ];

    // ? get info customer from phone number
    // if (from) {
    //   const customer = await this.customerRepository.findByPhoneNumber(from);
    //   if (customer) {
    //     scco[1].customData = JSON.stringify({
    //       callId: callId,
    //       uuid: uuid,
    //       callerNumber: from,
    //       stringeeNumber: to,
    //       timestamp: Date.now(),
    //       customerName: customer.name,
    //     });
    //   }
    //   const navigation = await this.getIdNavigationByCustomerPhone(from);
    //   console.log("navigation:", navigation);
    //   if (navigation) {
    //     scco[1].to!.number = navigation; // Route cuộc gọi đến userId được xác định từ call navigation
    //   }
    // }

    //# Flow 4: Phone-to-phone call (fallback nếu không route được vào app)

    //? from là số điện thoại gọi thực của người gọi(ví dụ: 84888382699), to là số điện thoại ảo của Stringee nhận cuộc gọi (ví dụ: 1110001013), hệ thống sẽ tìm số điện thoại thật tương ứng với số ảo này để hiển thị cho khách hàng khi gọi vào, đồng thời tìm điều hướng cuộc gọi để xác định xem nên route vào app (nếu có điều hướng) hay route đến số tổng đài (nếu không có điều hướng)
    const stringeeRealPhoneNumbers = config.STRINGEE_REAL_NUMBER.split(",").map((num) => num.trim());
    const stringeeVirtualPhoneNumbers = config.STRINGEE_VIRTUAL_NUMBER.split(",").map((num) => num.trim());

    if (!from || !to) {
      throw new BadRequestError("Thiếu dữ liệu cuộc gọi, liên hệ Stringee");
    }

    const indexVirtualNumber = stringeeVirtualPhoneNumbers.indexOf(to);
    //? trường hợp này sẽ không xảy ra vì Stringee sẽ chỉ gửi đến answer_url những số ảo đã đăng ký, tuy nhiên vẫn nên check để tránh lỗi nếu có request lạ gửi đến
    if (indexVirtualNumber === -1) {
      throw new BadRequestError(`Dữ liệu cuộc gọi không chính xác, liên hệ Stringee`);
    }

    //? Lấy số điện thoại thật đã được gọi
    const correspondingRealNumber = stringeeRealPhoneNumbers[indexVirtualNumber];

    const scco: any[] = [
      {
        action: "record",
        eventUrl: config.STRINGEE_RECORDING_URL,
        format: "mp3",
      },
    ];

    const callMetadata: Record<string, unknown> = {
      callType: CallHistoryTypeEnum.PTP,
      callId: callId,
      uuid: uuid,
      callerNumber: from,
      stringeeNumber: to,
      timestamp: Date.now(),
      customerName: "",
      orderId: null,
      callerId: null,
      receiverId: null,
      callerPhoneNumber: from,
      receiverPhoneNumber: config.HOTLINE_NUMBER,
    };

    const sccoOptions = {
      action: "connect",
      from: {
        type: "external",
        number: from, //the caller's phone number
        alias: to, //your phone number which bought from Stringee
      },
      to: {
        type: "external", //external: the call is routed to phone
        number: config.HOTLINE_NUMBER, // mặc định để là hotline
        alias: config.HOTLINE_NUMBER,
      },
      customData: "",
    };

    //? Kiểm tra xem số gọi đi có phải là nhân viên không
    const employee = await this.employeeRepository.findEmployeeByPhone(Utils.normalizePhoneNumber(from));

    console.log("Stringee call employee:", employee?.id, "---", employee?.name);
    console.log("Stringee call employee user:", employee?.user?.id, "---", employee?.user?.username);

    //$ nếu có employee tức là nhân viên gọi đi cho khách hàng
    if (employee) {
      //? tìm điều hướng hệ thống đã tạo cho nhân viên này, nhân viên bắt buộc phải gọi vào số điện thoại thật của stringee mà hệ thống đã tạo điều hướng, nếu gọi vào số khác sẽ không tìm thấy điều hướng và sẽ route đến số tổng đài
      const navigation = await this.callNavigationRepository.findByOption({
        where: {
          userId: employee.user.id,
          stringeePhone: correspondingRealNumber,
          priority: 1,
        },
        select: CallNavigationSelectFull,
        relations: {
          user: true,
          customer: true,
        },
      });
      if (!navigation) {
        throw new NotFoundError("Không tìm thấy điều hướng phù hợp cho nhân viên này");
      }

      if (!navigation.orderId) {
        throw new NotFoundError("Không tìm thấy đơn hàng phù hợp cho điều hướng này");
      }

      // lấy thông tin đơn hàng
      const order = await this.orderRepository.findByOption({
        where: {
          id: navigation.orderId,
        },
        select: { id: true, code: true, name: true, customerPhone: true, customerId: true },
      });

      if (!order) {
        throw new NotFoundError("Không tìm thấy đơn hàng phù hợp cho điều hướng này");
      }

      //$ create comment if update
      await this.orderCommentService.create(
        {
          orderId: order.id,
          userId: null,
          content: `Nhân viên ${employee.zaloName || employee.name} đang thực hiện cuộc gọi tới khách hàng`,
        },
        undefined,
        undefined,
      );

      if (navigation.customerId !== order.customerId) {
        throw new NotFoundError("Thông tin khách hàng không khớp với đơn hàng trong điều hướng");
      }

      const customerPhone = order.customerPhone || navigation.customer.phone;

      //? cập nhật số điện thoại khách hàng
      Object.assign(sccoOptions.to, {
        number: Utils.normalizeStringeePhoneNumber(customerPhone),
        alias: Utils.normalizeStringeePhoneNumber(customerPhone),
      });
      Object.assign(callMetadata, {
        callId: callId,
        uuid: uuid,
        callerNumber: from,
        stringeeNumber: Utils.normalizeStringeePhoneNumber(customerPhone),
        timestamp: Date.now(),
        customerName: navigation.customer.name,
        orderId: navigation.orderId,
        callerId: employee.user?.id || null,
        receiverId: null,
        callerPhoneNumber: from,
        receiverPhoneNumber: Utils.normalizeStringeePhoneNumber(customerPhone),
      });

      // update callId in call navigation
      await this.callNavigationRepository.update(navigation.id, {
        callId: callId,
      });

      //========================== ELSE ================================//
    } else {
      //$ nếu không phải nhân viên gọi đi, có thể là cuộc gọi từ khách hàng đến nhân viên => nếu tìm thấy nhân viên thì điều hướng đến số của nhân viên OR nếu không thấy điều hướng đến số tổng đài
      //? tìm xem số gọi đến có phải là khách hàng không
      let customer = await this.customerRepository.findByOption({
        where: {
          phone: Utils.normalizePhoneNumber(from),
        },
      });
      let matchedOrderId: string | null = null;

      if (!customer) {
        // tìm xem số điện thoại này có thuộc 1 đơn hàng nào không (customerPhone) và trạng thái là đang xử lý
        const order = await this.orderRepository.findByOption({
          where: {
            customerPhone: Utils.normalizePhoneNumber(from),
            status: In([OrderStatusEnum.PENDING, OrderStatusEnum.PROCESSING]),
          },
          select: { id: true, code: true, name: true, customerPhone: true, customerId: true },
        });

        if (order) {
          matchedOrderId = order.id;
          customer = await this.customerRepository.findByOption({
            where: {
              id: order.customerId,
            },
          });
        }
      }

      console.log("String call Customer:", customer);

      // cờ đánh dấu đã tìm được nhân viên điều hướng chưa
      let flag = false;

      if (customer) {
        Object.assign(callMetadata, {
          callId: callId,
          uuid: uuid,
          callerNumber: from,
          stringeeNumber: Utils.normalizeStringeePhoneNumber(customer.phone),
          timestamp: Date.now(),
          customerName: customer.name,
          callerPhoneNumber: from,
          orderId: matchedOrderId,
        });

        // tìm điều hướng của khách hàng với số cố định stringee trên và phải còn hiệu dụng.
        const navigations = await this.callNavigationRepository.findByOptions({
          where: {
            customerId: customer.id,
            stringeePhone: correspondingRealNumber,
            expiresAt: IsNull(),
          },
          select: CallNavigationSelectFull,
          relations: CallNavigationRelations,
        });

        if (navigations.length > 0) {
          // ưu tiên chuyển hướng đến điều hướng có cập nhật gần hiện tại nhất (tức là người trước đó mới gọi cho khách)
          const selectCall = navigations.sort(
            (a, b) => dayjs(b.updatedAt).toDate().getTime() - dayjs(a.updatedAt).toDate().getTime(),
          );

          // lấy điều hướng đầu tiên
          const orderId = selectCall[0].orderId;
          const userId = selectCall[0].userId;
          Object.assign(callMetadata, { orderId });

          const employeeId = await this.userRepository.getEmployeeByUserId(userId);

          if (employeeId) {
            const employee = await this.employeeRepository.findById(employeeId);
            if (employee && employee.phone) {
              Object.assign(sccoOptions.to, {
                number: Utils.normalizeStringeePhoneNumber(employee.phone),
                alias: Utils.normalizeStringeePhoneNumber(employee.phone),
              });

              Object.assign(callMetadata, {
                orderId,
                receiverId: await this.resolveExistingUserId(userId, "PTP receiverId"),
                receiverPhoneNumber: Utils.normalizeStringeePhoneNumber(employee.phone),
              });

              // đánh dấu cờ
              flag = true;
            }
          }

          //? Ưu tiên điều hướng đến cho nhân viên đầu cánh
          // tìm điều hướng của nhân viên đầu cánh
          // // lấy danh sách nhân viên đầu cánh của đơn hàng
          // const employeeLeader = await this.orderEmployeeRepository.findByOptions({
          //   where: {
          //     orderId: orderId,
          //     isLeader: true,
          //   },
          //   select: {
          //     id: true,
          //     orderId: true,
          //     employeeId: true,
          //     employee: {
          //       id: true,
          //       name: true,
          //       phone: true,
          //       user: {
          //         id: true,
          //       },
          //     },
          //   },
          //   relations: {
          //     employee: {
          //       user: true,
          //     },
          //   },
          // });

          // if (employeeLeader.length > 0) {
          //   // tìm nhân viên có trong bản ghi điều hướng
          //   const employeeReceiveCall = employeeLeader
          //     .map((el) => el.employee)
          //     .filter((e) => {
          //       if (!e.user) return false;
          //       return navigations.find((n) => n.userId === e.user.id);
          //     });

          //   if (employeeReceiveCall.length > 0) {
          //     // lặp qua mỗi nhân viên , ai có phone thì điều hướng đến và thoát khỏi vòng lặp
          //     for (const emp of employeeReceiveCall) {
          //       if (!emp.phone) continue;
          //       Object.assign(sccoOptions.to, {
          //         number: Utils.normalizeStringeePhoneNumber(emp.phone),
          //         alias: Utils.normalizeStringeePhoneNumber(emp.phone),
          //       });

          //       // đánh dấu cờ
          //       flag = true;

          //       break;
          //     }
          //   }
          // }

          // nếu không điều hướng được đến nhân viên đầu cánh nào thì chuyển qua số quản lý chi nhánh
          if (!flag) {
            const order = await this.orderRepository.findByOption({
              where: {
                id: orderId,
              },
              select: {
                id: true,
                branchManagerId: true,
                branchManager: {
                  id: true,
                  phone: true,
                  name: true,
                  zaloName: true,
                  user: {
                    id: true,
                  },
                },
              },
              relations: {
                branchManager: {
                  user: true,
                },
              },
            });

            if (order && order.branchManager && order.branchManager.phone) {
              Object.assign(sccoOptions.to, {
                number: Utils.normalizeStringeePhoneNumber(order.branchManager.phone),
                alias: Utils.normalizeStringeePhoneNumber(order.branchManager.phone),
              });

              Object.assign(callMetadata, {
                orderId,
                receiverId: order.branchManager.user?.id || null,
                receiverPhoneNumber: Utils.normalizeStringeePhoneNumber(order.branchManager.phone),
              });

              flag = true;
            }
          }
        }
      }

      // nếu không thể điều hướng được đến nhân viên nào thì chuyến hướng đến hotline của công ty
      if (!flag) {
        Object.assign(sccoOptions.to, {
          number: config.HOTLINE_NUMBER,
          alias: config.HOTLINE_NUMBER,
        });
      }
    }

    sccoOptions.customData = JSON.stringify(callMetadata);
    scco.push(sccoOptions);

    logger.info(
      `[Stringee] Returning SCCO for phone-to-app call (route to ${scco[1].to!.number}): ${JSON.stringify(scco)}`,
    );

    return scco;
  }

  /**
   * Xử lý event_url - nhận sự kiện cuộc gọi từ Stringee Server
   *
   * Stringee gửi POST request tới event_url khi trạng thái cuộc gọi thay đổi:
   * - created: cuộc gọi được tạo
   * - started: cuộc gọi bắt đầu
   * - ringing: đang đổ chuông
   * - answered: đã trả lời
   * - ended: kết thúc
   */
  async handleEventUrl(body: {
    call_status?: string;
    call_id?: string;
    from?: { number?: string; type?: string; alias?: string };
    to?: { number?: string; type?: string; alias?: string };
    duration?: number;
    answerDuration?: number;
    endCallCause?: string;
    endedBy?: string;
    request_from_user_id?: string;
    [key: string]: any;
  }): Promise<ApiResponse<any>> {
    const { call_status, call_id, from, to, duration, answerDuration, endCallCause, endedBy, callCreatedReason } = body;

    // logger.info(`[Stringee] Event received - callId: ${call_id}, status: ${call_status}`);

    // Xử lý theo trạng thái cuộc gọi
    switch (call_status) {
      case "created":
        logger.info(`[Stringee] Call created: ${call_id}`);
        break;
      case "started":
        logger.info(`[Stringee] Call started: ${call_id}`);
        await this.handleStartedCall(body);
        break;
      case "ringing":
        logger.info(`[Stringee] Call ringing: ${call_id}`);
        await this.handleRingRingCall(body);
        break;
      case "answered":
        logger.info(`[Stringee] Call answered: ${call_id}`);
        await this.handleAnsweredCall(body);
        break;
      case "ended":
        logger.info(
          `[Stringee] Call ended: ${call_id}, duration: ${duration}s, answerDuration: ${answerDuration}s, cause: ${endCallCause}, endedBy: ${endedBy}`,
        );
        // TODO: Có thể lưu call history vào database tại đây
        await this.handleEndedCall(body);
        break;
      default:
        logger.warn(`[Stringee] Unknown call status: ${call_status} for call: ${call_id}`);
    }

    return ApiResponseHandler.getSuccess("OK");
  }

  /**
   * Handle recording_url - nhận URL file ghi âm từ Stringee Server sau khi cuộc gọi kết thúc
   * Stringee gửi POST request tới recording_url với body chứa recording_url, call_id, duration, ...
   * Server có thể lưu URL này vào database để sau này truy cập hoặc tải file ghi âm về
   * @param body
   */
  async handleRecordingUrl(body: {
    call_id?: string;
    recording_url?: string;
    start_time: number;
    end_time: number;
    fromNumber?: string;
    toNumber?: string;
    [key: string]: any;
  }): Promise<void> {
    const { call_id, recording_url, start_time, end_time, fromNumber, toNumber } = body;

    logger.info(`[Stringee] Recording URL received for callId: ${call_id}, hasRecordingUrl: ${Boolean(recording_url)}`);
    const history = await this.callHistoryRepository.findOne({ callId: call_id });

    if (history) {
      await this.callHistoryRepository.update(history.id, {
        recordingUrl: recording_url || null,
      });
    }

    logger.info(`[Stringee] Recording URL received for callId: ${call_id}`);
  }

  private buildRecordingDownloadUrl(recordingReference: string): string {
    const value = recordingReference.trim();
    const allowedHosts = new Set([
      "api.stringee.com",
      "icc-api.stringee.com",
      "asia-3.api.stringee.com",
      new URL(config.STRINGEE_API_BASE_URL).hostname,
    ]);
    const recordingPathPattern = /^\/v1\/call\/(?:recording|play)\/([^/]+)\/?$/;
    const extractRecordingId = (path: string): string | undefined => {
      const pathMatch = path.match(recordingPathPattern);
      if (!pathMatch?.[1]) {
        return undefined;
      }

      try {
        return decodeURIComponent(pathMatch[1]);
      } catch {
        return undefined;
      }
    };
    let recordingId: string | undefined;

    try {
      const parsedUrl = new URL(value);
      if (["http:", "https:"].includes(parsedUrl.protocol) && allowedHosts.has(parsedUrl.hostname)) {
        recordingId = extractRecordingId(parsedUrl.pathname);
      }
    } catch {
      recordingId = extractRecordingId(value);
    }

    if (!recordingId && /^[^/?#\s]+$/.test(value)) {
      recordingId = value;
    }

    if (!recordingId) {
      throw new BadRequestError("Invalid Stringee recording URL");
    }

    return `${config.STRINGEE_API_BASE_URL}/v1/call/recording/${encodeURIComponent(recordingId)}`;
  }

  private getRestApiTokenCacheKey(): string {
    return `STRINGEE_REST_API_TOKEN:${this.apiKeySid}`;
  }

  /**
   * Lấy stream bản ghi âm từ Stringee bằng REST token server-side.
   * Browser không thể tự thêm X-STRINGEE-AUTH vào thẻ audio hoặc link tải,
   * vì vậy endpoint này làm proxy và chuyển tiếp Range header để hỗ trợ tua.
   */
  async getRecordingStream(
    callHistoryId: string,
    range?: string,
    download: boolean = false,
  ): Promise<StringeeRecordingStream> {
    const history = await this.callHistoryRepository.findById(callHistoryId);

    if (!history?.recordingUrl) {
      throw new NotFoundError("Recording not found");
    }

    const recordingUrl = this.buildRecordingDownloadUrl(history.callId || history.recordingUrl);

    const token = await this.generateRestApiToken();

    try {
      const response = await axios.get<Readable>(recordingUrl.toString(), {
        responseType: "stream",
        timeout: 30_000,
        validateStatus: () => true,
        headers: {
          "X-STRINGEE-AUTH": token,
          ...(range ? { Range: range } : {}),
        },
      });

      if (response.status < 200 || response.status >= 300) {
        if (typeof response.data?.destroy === "function") {
          response.data.destroy();
        }
        logger.error(`[Stringee] Recording proxy failed with status ${response.status}`);
        if (response.status === 401 || response.status === 403) {
          throw new ServiceUnavailableError(`Stringee authentication failed (HTTP ${response.status})`);
        }
        if (response.status === 404) {
          throw new NotFoundError("Recording not found on Stringee");
        }
        throw new ServiceUnavailableError(`Stringee recording request failed (HTTP ${response.status})`);
      }

      const headers: Record<string, string> = {};
      for (const headerName of ["content-type", "content-length", "content-range", "accept-ranges"]) {
        const headerValue = response.headers[headerName];
        if (typeof headerValue === "string") {
          headers[headerName] = headerValue;
        }
      }

      headers["content-disposition"] = download
        ? `attachment; filename="call-recording-${callHistoryId}.mp3"`
        : "inline";

      return {
        stream: response.data,
        statusCode: response.status,
        headers,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : undefined;
      const errorMessage = error instanceof Error ? error.message : "unknown error";
      logger.error(
        `[Stringee] Recording proxy error for call history ${callHistoryId}: ${
          errorCode ? `${errorCode} - ` : ""
        }${errorMessage}`,
      );
      throw new ServiceUnavailableError(
        errorCode ? `Stringee recording request failed (${errorCode})` : "Unable to retrieve recording from Stringee",
      );
    }
  }

  async handleStartedCall(body: {
    call_status?: string;
    call_id?: string;
    from?: { number?: string; type?: string; alias?: string };
    to?: { number?: string; type?: string; alias?: string };
    duration?: number;
    answerDuration?: number;
    endCallCause?: string;
    endedBy?: string;
    request_from_user_id?: string;
    [key: string]: any;
  }): Promise<void> {
    const { call_id, from, to } = body;
    const customData = this.parseCallHistoryContext(body.customData);
    const clientCustomData = this.parseCallHistoryContext(body.clientCustomData);
    const callContext = Object.keys(customData).some((key) => customData[key as keyof StringeeCallHistoryContext] != null)
      ? customData
      : clientCustomData;
    const isInternalCall = from?.type === "internal" && to?.type === "internal";
    const callType = isInternalCall || callContext.callType === CallHistoryTypeEnum.ATA
      ? CallHistoryTypeEnum.ATA
      : CallHistoryTypeEnum.PTP;

    let callerId = callContext.callerId ?? null;
    let receiverId = callContext.receiverId ?? null;
    let callerPhoneNumber = callContext.callerPhoneNumber || from?.number || "";
    let receiverPhoneNumber = callContext.receiverPhoneNumber || to?.number || "";

    if (callType === CallHistoryTypeEnum.ATA) {
      const fromEmployee = from?.number
        ? await this.employeeRepository.findByUserId(from.number)
        : null;
      const toEmployee = to?.number ? await this.employeeRepository.findByUserId(to.number) : null;

      callerId = callerId || fromEmployee?.user?.id || (await this.resolveExistingUserId(from?.number, "ATA callerId"));
      receiverId = receiverId || toEmployee?.user?.id || (await this.resolveExistingUserId(to?.number, "ATA receiverId"));
      callerPhoneNumber =
        callContext.callerPhoneNumber || this.getEmployeeDisplayName(fromEmployee) || from?.number || "";
      receiverPhoneNumber =
        callContext.receiverPhoneNumber || this.getEmployeeDisplayName(toEmployee) || to?.number || "";
    }

    const dataCreateCallHistory: CreateCallHistoryDto = {
      startTime: new Date(),
      callerPhoneNumber,
      receiverPhoneNumber,
      callId: call_id || "",
      callType,
      callerId,
      receiverId,
      orderId: callContext.orderId ?? null,
    };

    const existingHistory = await this.callHistoryRepository.findOne({ callId: call_id });

    if (existingHistory) {
      await this.callHistoryRepository.update(existingHistory.id, {
        ...dataCreateCallHistory,
        callerId: dataCreateCallHistory.callerId ?? existingHistory.callerId,
        receiverId: dataCreateCallHistory.receiverId ?? existingHistory.receiverId,
        orderId: dataCreateCallHistory.orderId ?? existingHistory.orderId,
      });
      return;
    }

    await this.callHistoryRepository.create(dataCreateCallHistory);
  }

  async handleRingRingCall(body: {
    call_status?: string;
    call_id?: string;
    actor?: string;
    from?: { number?: string; type?: string; alias?: string };
    to?: { number?: string; type?: string; alias?: string };
    duration?: number;
    answerDuration?: number;
    endCallCause?: string;
    endedBy?: string;
    request_from_user_id?: string;
    [key: string]: any;
  }): Promise<void> {
    const {
      call_status,
      call_id,
      actor,
      from,
      to,
      duration,
      answerDuration,
      endCallCause,
      endedBy,
      request_from_user_id,
      callCreatedReason,
    } = body;
    if (callCreatedReason === "EXTERNAL_CALL_IN") {
      // if (to?.number) {
      //   await redisHelper.set(`stringee-call:${to.number}`, "true", 300);
      // }
    } else {
      if (request_from_user_id) {
        await redisHelper.set(`stringee-call:${request_from_user_id}`, "true", 300);
      }
    }
  }

  async handleAnsweredCall(body: {
    call_status?: string;
    call_id?: string;
    actor?: string;
    from?: { number?: string; type?: string; alias?: string };
    to?: { number?: string; type?: string; alias?: string };
    duration?: number;
    answerDuration?: number;
    endCallCause?: string;
    endedBy?: string;
    request_from_user_id?: string;
    [key: string]: any;
  }): Promise<void> {
    const {
      call_status,
      call_id,
      actor,
      from,
      to,
      duration,
      answerDuration,
      endCallCause,
      endedBy,
      request_from_user_id,
      callCreatedReason,
    } = body;
    if (callCreatedReason === "EXTERNAL_CALL_IN") {
      // if (to?.number) {
      //   await redisHelper.set(`stringee-call:${to.number}`, "true", 300);
      // }
    } else {
      // if (request_from_user_id) {
      //   await redisHelper.set(`stringee-call:${request_from_user_id}`, "true", 300);
      // }
    }
  }

  async handleEndedCall(body: {
    call_status?: string;
    call_id?: string;
    from?: { number?: string; type?: string; alias?: string };
    to?: { number?: string; type?: string; alias?: string };
    duration?: number;
    answerDuration?: number;
    endCallCause?: string;
    endedBy?: string;
    request_from_user_id?: string;
    [key: string]: any;
  }): Promise<void> {
    const {
      call_status,
      call_id,
      from,
      to,
      duration,
      answerDuration,
      endCallCause,
      endedBy,
      callCreatedReason,
      request_from_user_id,
    } = body;

    // find history by call_id, update duration and endCallCause
    const history = await this.callHistoryRepository.findOne({ callId: call_id });

    if (history) {
      await this.callHistoryRepository.update(history.id, {
        endTime: new Date(),
        duration: duration,
        answerDuration: answerDuration,
        endCallCause: endCallCause,
        endedBy: endedBy,
      });

      if (history.callerId) {
        //? find socket ID of userId
        const socketContent = {
          type: "stringee-call-ended",
          endTime: new Date(),
          duration: duration,
          answerDuration: answerDuration,
          endCallCause: endCallCause,
          endedBy: endedBy,
        };

        SocketUtils.sendSocketToUser("stringee-call-ended", history.callerId, socketContent);

        // find in redis and delete
        await redisHelper.del(`stringee-call:${history.callerId}`);
      }
    }

    // Notify mobile app via SSE so incoming UI can be closed immediately
    // when remote side hangs up.
    const targetUserId = history?.callerId || this.normalizeUserId(to?.number, `ended call ${call_id}`);
    if (targetUserId) {
      await RedisSSEBroadcaster.sendToUser(targetUserId, "stringee-call-ended", {
        type: "stringee-call-ended",
        status: call_status || "ended",
        callId: call_id || "",
        stringeeCallId: call_id || "",
        endedBy: endedBy || "",
        endCallCause: endCallCause || "",
        duration: duration || 0,
        answerDuration: answerDuration || 0,
        from: from?.number || "",
        to: to?.number || "",
      });

      await FirebaseUtils.SentFirebaseWithUser({
        userId: targetUserId,
        title: "Cuộc gọi kết thúc",
        content: `Cuộc gọi từ khách hàng đã kết thúc`,
        data: {
          type: "stringee-call-ended",
          callId: call_id || "",
          stringeeCallId: call_id || "",
          endedBy: endedBy || "",
          endCallCause: endCallCause || "",
          duration: duration || 0,
          answerDuration: answerDuration || 0,
          from: from?.number || "",
          to: to?.number || "",
        },
      });
    }
  }

  /**
   * Make outbound call từ server (server-to-phone) qua REST API
   *
   * Gọi Stringee REST API để thực hiện cuộc gọi từ server:
   * POST {STRINGEE_API_BASE_URL}/v1/call2/callout
   * Header: X-STRINGEE-AUTH: <rest_api_token>
   */
  async makeOutboundCall(params: { from: string; to: string; customData?: string }): Promise<any> {
    const { from, to, customData } = params;

    const token = await this.generateRestApiToken();

    const requestBody = {
      from: {
        type: "external",
        number: from || config.STRINGEE_VIRTUAL_NUMBER.split(",")[0],
        alias: from || config.STRINGEE_VIRTUAL_NUMBER.split(",")[0],
      },
      to: [
        {
          type: "external",
          number: to,
          alias: to,
        },
      ],
      actions: [
        {
          action: "connect",
          from: {
            type: "external",
            number: from || config.STRINGEE_VIRTUAL_NUMBER.split(",")[0],
            alias: from || config.STRINGEE_VIRTUAL_NUMBER.split(",")[0],
          },
          to: {
            type: "external",
            number: to,
            alias: to,
          },
          customData: customData || "",
        },
      ],
    };

    try {
      logger.info(`[Stringee] Making outbound call from ${from} to ${to}`);

      const response = await axios.post(`${config.STRINGEE_API_BASE_URL}/v1/call2/callout`, requestBody, {
        headers: {
          "X-STRINGEE-AUTH": token,
          "Content-Type": "application/json",
        },
      });

      logger.info(`[Stringee] Outbound call response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: any) {
      logger.error(`[Stringee] Outbound call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Route incoming-call push theo đúng kênh của từng thiết bị:
   *  - iOS có voipToken active → APNs PushKit VoIP push (duy nhất)
   *  - Android có fcmToken active → FCM data push (duy nhất)
   *  - Không gửi cả hai cho cùng thiết bị
   *  - Fallback về FCM qua tokens table nếu chưa có device_push_registrations
   */
  private async sendIncomingCallPush(opts: {
    targetUserId: string;
    callId: string;
    callerNumber: string;
    customer: Customer | null;
    stringeeCallId?: string;
    driverId?: string;
  }): Promise<void> {
    const { targetUserId, callId, callerNumber, stringeeCallId, customer, driverId } = opts;

    let callerName = "Khách hàng";

    if (customer) {
      callerName = customer.name || callerNumber || "";
    }

    await FirebaseUtils.SentFirebaseWithUser({
      userId: targetUserId,
      title: "Cuộc gọi mới",
      content: `Bạn có cuộc gọi mới từ khách hàng ${callerName}`,
      data: {
        type: "incoming_call",
        callId,
        callerNumber,
        stringeeCallId: stringeeCallId || callId,
      },
    });

    // const devices = await this.devicePushRegistrationRepository.findActiveByUserId(targetUserId);

    // if (devices.length === 0) {
    //   logger.info(`[Stringee] No device registrations for ${targetUserId}, fallback to legacy FCM`);
    //   await FirebaseUtils.SentFirebaseWithUser({
    //     userId: targetUserId,
    //     title: "Cuộc gọi mới",
    //     content: `Bạn có cuộc gọi mới từ ${callerNumber || "số lạ"}`,
    //     data: {
    //       type: "incoming_call",
    //       callId,
    //       callerNumber,
    //       stringeeCallId: stringeeCallId || callId,
    //     },
    //   });
    //   return;
    // }

    // const apnsPayload = ApnsUtils.buildIncomingCallPayload({
    //   callId,
    //   callerNumber,
    //   stringeeCallId,
    //   customerId,
    //   driverId,
    // });

    // // FCM data payload — all values must be strings
    // const fcmData: Record<string, string> = {
    //   type: "incoming_call",
    //   schemaVersion: "2026-03-12",
    //   provider: "backend",
    //   call: JSON.stringify({ id: callId, kind: "audio", timeoutMs: 45000 }),
    //   caller: JSON.stringify({ displayName: "Khách hàng", number: callerNumber }),
    //   navigation: JSON.stringify({ route: "incoming-call", autoAnswer: false }),
    //   meta: JSON.stringify({
    //     stringeeCallId: stringeeCallId || callId,
    //     customerId: customerId || "",
    //     driverId: driverId || "",
    //   }),
    // };

    // for (const device of devices) {
    //   if (device.platform === "ios" && device.voipToken) {
    //     // iOS: APNs VoIP push only
    //     const env = device.pushEnvironment === "sandbox" ? "sandbox" : "production";
    //     try {
    //       await ApnsUtils.sendVoipPush(device.voipToken, env, apnsPayload);
    //       logger.info(`[Stringee] APNs VoIP push sent to device ${device.deviceId} (${env})`);
    //     } catch (err: any) {
    //       logger.error(`[Stringee] APNs push failed for device ${device.deviceId}: ${err.message}`);
    //     }
    //   } else if (device.platform === "android" && device.fcmToken) {
    //     // Android: FCM data push only
    //     try {
    //       await FirebaseUtils.SentFirebaseWithToken({
    //         token: device.fcmToken,
    //         title: "",
    //         content: "",
    //         data: fcmData,
    //       });
    //       logger.info(`[Stringee] FCM data push sent to device ${device.deviceId}`);
    //     } catch (err: any) {
    //       logger.error(`[Stringee] FCM push failed for device ${device.deviceId}: ${err.message}`);
    //     }
    //   }
    // }
  }

  /**
   * Get all users online in stringee (có thể dùng để kiểm tra trước khi điều hướng cuộc gọi vào app)
   */
  async getUserOnline(): Promise<{
    count: number;
    pageSize: number;
    users: Array<{
      canCallout: boolean;
      canReceive: boolean;
      userId: string;
      displayName: string;
    }>;
  }> {
    return new Promise(async (resolve, reject) => {
      // get token from redis

      let token = await redisHelper.get(this.getRestApiTokenCacheKey());

      if (!token) {
        logger.warn("[Stringee] No REST API token found in Redis, generating a new one");
        token = await this.generateRestApiToken();
        logger.info("[Stringee] New REST API token generated and stored in Redis");
      }

      axios
        .get(`${config.STRINGEE_API_BASE_URL}/v1/user`, {
          headers: {
            "X-STRINGEE-AUTH": token,
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          logger.error(`[Stringee] Check user online failed: ${error.message}`);
          reject(error);
        });
    });
  }

  async getUserStatus(userId: string): Promise<any> {
    const token = await this.generateRestApiToken();

    try {
      logger.info(`Getting user status for userId ${userId}`);

      const response = await axios.get(`${config.STRINGEE_API_BASE_URL}/v1/users/${userId}`, {
        headers: {
          "X-STRINGEE-AUTH": token,
          "Content-Type": "application/json",
        },
      });

      logger.info(`[Stringee] Get user status response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: any) {
      logger.error(`[Stringee] Get user status failed: ${error.message}`);
      throw error;
    }
  }

  async stopCall(callId: string): Promise<any> {
    const token = await this.generateRestApiToken();

    try {
      logger.info(`stopping call with callId ${callId}`);

      const response = await axios.post(
        `${config.STRINGEE_API_BASE_URL}/v1/call2/stop`,
        {
          callId: callId,
        },
        {
          headers: {
            "X-STRINGEE-AUTH": token,
            "Content-Type": "application/json",
          },
        },
      );

      logger.info(`[Stringee] Stop call response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: any) {
      logger.error(`[Stringee] Stop call failed: ${error.message}`);
      throw error;
    }
  }

  async updateUserStatus(userId: string, manualStatus: { attribute: string; value?: string }[]): Promise<any> {
    const token = await this.generateRestApiToken();

    console.log("token", token);

    try {
      logger.info(`updating user status for userId ${userId} with manualStatus ${JSON.stringify(manualStatus)}`);

      const response = await axios.put(
        `${config.STRINGEE_API_BASE_URL}/v1/users/${userId}/attributes`,
        {
          manualStatus,
        },
        {
          headers: {
            "X-STRINGEE-AUTH": token,
            "Content-Type": "application/json",
          },
        },
      );

      logger.info(`[Stringee] Update user status response: ${response.status} - ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: any) {
      logger.error(`[Stringee] Update user status failed: ${error.message}`);
      throw error;
    }
  }
}
