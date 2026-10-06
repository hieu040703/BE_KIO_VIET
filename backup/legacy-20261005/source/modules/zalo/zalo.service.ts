import { injectable, inject } from "inversify";
import axios from "axios";
import FormData from "form-data";
import { config } from "@/shared/config/env";
import logger from "@/shared/utils/logger";
import redisHelper from "@/shared/utils/redis.helper";
import {
  GetTemplateDetailDto,
  GetTemplateListDto,
  RefreshTokenDto,
  SendMessageDto,
  SendUidMessageDto,
  GetMessageStatusDto,
} from "./zalo.validator";
import { ZaloMessageHistoryRepository } from "./zaloMessageHistory/zaloMessageHistory.repository";
import { ZALO_MESSAGE_HISTORY_TYPES } from "./zaloMessageHistory/zaloMessageHistory.types";
import { ZALO_ERROR_MESSAGES } from "./zaloErrorMessages";
import { ZaloTemplateRepository } from "./zaloTemplate/zaloTemplate.repository";
import { ZALO_TEMPLATE_TYPES } from "./zaloTemplate/zaloTemplate.types";
import { ZaloMessageStatusEnum, ZaloTemplateTypeEnum } from "./zalo.constance";

const ZALO_OAUTH_URL = "https://oauth.zaloapp.com/v4/oa/access_token";
const ZALO_OPEN_API_URL = "https://openapi.zalo.me";
const ZALO_BUSINESS_API_URL = "https://business.openapi.zalo.me";
const ZALO_TEMPLATE_IMAGE_UPLOAD_PATH = "/v2.0/template/uploadimage";
const ZALO_TEMPLATE_LIST_PATH = "/template/all";
const ZALO_TEMPLATE_DETAIL_PATH = "/template/info/v2";
const ZALO_PHONE_TEMPLATE_MESSAGE_PATH = "/message/template";
const ZALO_PHONE_MESSAGE_STATUS_PATH = "/message/status";
const ZALO_UID_TEMPLATE_MESSAGE_PATH = "/v3.0/oa/message/template";

export interface ZaloTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

export interface ZaloTemplateListResponse {
  error: number;
  message: string;
  data: ZaloTemplate[];
}

export interface ZaloTemplate {
  templateId: number;
  templateName: string;
  createdTime: number;
  status: string;
  templateQuality: string;
}

export interface ZaloTemplateDetailResponse {
  error: number;
  message: string;
  data: ZaloTemplateDetail;
}

export interface ZaloTemplateDetail {
  templateId: number;
  templateName: string;
  status: string;
  listParams: ZaloTemplateParam[];
  previewUrl: string;
  templateQuality: string;
  timeout: number;
  createdTime: number;
}

export interface ZaloTemplateParam {
  name: string;
  require: boolean;
  type: string;
  maxLength: number;
  minLength: number;
  acceptNull: boolean;
}

export interface ZaloUploadImageResponse {
  error: number;
  message: string;
  data: {
    token: string;
  };
}

export interface ZaloSendMessageResponse {
  error: number;
  message: string;
  data: {
    msg_id?: string;
    message_id?: string;
  };
}

export interface ZaloMessageStatusResponse {
  error: number;
  message: string;
  data: {
    msg_id: string;
    status: string; // SENDING | SENT | FAILED | REJECTED | THROTTLED
    sent_time: string;
    delivery_time: string;
    read_time: string;
    error_code: number;
    error_message: string;
  };
}

type PhoneTemplateMessagePayload = Omit<
  SendMessageDto,
  "tripId" | "customerId" | "driverId" | "templateType" | "mode"
> & {
  template_id: string;
  mode?: "development";
  tracking_id?: string;
};

type ResolvedPhoneTemplate = {
  templateId: string;
  templateName: string | null;
  templateType: ZaloTemplateTypeEnum | null;
};

export type ZaloMessageHistoryContext = {
  historyId?: string;
  orderId: string;
  customerId: string;
};

@injectable()
export class ZaloService {
  constructor(
    @inject(ZALO_MESSAGE_HISTORY_TYPES.ZaloMessageHistoryRepository)
    private zaloMessageHistoryRepository: ZaloMessageHistoryRepository,
    @inject(ZALO_TEMPLATE_TYPES.ZaloTemplateRepository)
    private zaloTemplateRepository: ZaloTemplateRepository,
  ) {}

  private get appId(): string {
    return config.ZALO_APP_ID;
  }

  private get secretKey(): string {
    return config.ZALO_APP_SECRET;
  }

  async getAccessToken(): Promise<string> {
    const tokenFromRedis = await redisHelper.get("ZALO_ACCESS_TOKEN");
    if (tokenFromRedis) return tokenFromRedis;
    return process.env.ZALO_ACCESS_TOKEN || "";
  }

  private async getRefreshToken(): Promise<string> {
    const refreshToken = (await redisHelper.get("ZALO_REFRESH_TOKEN")) || process.env.ZALO_REFRESH_TOKEN;
    if (!refreshToken) {
      throw new Error("[ZaloService] Zalo access token is missing and refresh token was not found.");
    }

    return refreshToken;
  }

  private async refreshStoredAccessToken(): Promise<string> {
    const refreshToken = await this.getRefreshToken();
    const tokenData = await this.refreshAccessToken({ refresh_token: refreshToken });
    return tokenData.access_token;
  }

  private async getValidAccessToken(forceRefresh = false): Promise<string> {
    if (forceRefresh) {
      return this.refreshStoredAccessToken();
    }

    const accessToken = await this.getAccessToken();
    if (accessToken) return accessToken;

    logger.warn("[ZaloService] Zalo access token missing, refreshing...");
    return this.refreshStoredAccessToken();
  }

  /**
   * Dùng Refresh Token để lấy Access Token mới.
   * Access Token có hiệu lực 25 giờ, Refresh Token có hiệu lực 3 tháng (chỉ dùng 1 lần).
   * Sau khi gọi thành công sẽ nhận được cả Access Token và Refresh Token mới.
   */
  async refreshAccessToken(dto: RefreshTokenDto): Promise<ZaloTokenResponse> {
    const params = new URLSearchParams();
    params.append("refresh_token", dto.refresh_token);
    params.append("app_id", this.appId);
    params.append("grant_type", "refresh_token");

    const response = await axios.post<ZaloTokenResponse>(ZALO_OAUTH_URL, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        secret_key: this.secretKey,
      },
    });

    const tokenData = response.data;

    // Lưu access_token vào Redis với TTL 25 giờ (90000 giây)
    await redisHelper.set("ZALO_ACCESS_TOKEN", tokenData.access_token, 90000);
    // Lưu refresh_token vào Redis với TTL 30 ngày (2592000 giây)
    await redisHelper.set("ZALO_REFRESH_TOKEN", tokenData.refresh_token, 2592000);

    logger.info(`[ZaloService] refreshAccessToken success - expires_in: ${tokenData.expires_in}s`);
    return tokenData;
  }

  /**
   * Upload ảnh lên Zalo để dùng trong Template Message.
   * Trả về token ảnh dùng khi tạo template.
   * - Định dạng hỗ trợ: JPG, PNG
   * - Kích thước tối đa: 1MB
   */
  async uploadImage(
    accessToken: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<ZaloUploadImageResponse> {
    const form = new FormData();
    form.append("file", fileBuffer, {
      filename: originalName,
      contentType: mimeType,
    });

    const response = await axios.post<ZaloUploadImageResponse>(
      `${ZALO_OPEN_API_URL}${ZALO_TEMPLATE_IMAGE_UPLOAD_PATH}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          access_token: accessToken,
        },
      },
    );

    if (response.data.error !== 0) {
      throw new Error(`Zalo upload image error ${response.data.error}: ${response.data.message}`);
    }

    logger.info(`[ZaloService] uploadImage success - token: ${response.data.data?.token}`);
    return response.data;
  }

  /**
   * Lấy danh sách Template ZBS.
   * Hỗ trợ phân trang và lọc theo trạng thái.
   */
  async getTemplateList(accessToken: string | undefined, dto: GetTemplateListDto): Promise<ZaloTemplateListResponse> {
    const resolvedAccessToken = accessToken || (await this.getValidAccessToken());
    const params: Record<string, string | number> = {
      offset: dto.offset,
      limit: dto.limit,
    };

    if (dto.status) {
      params["status"] = dto.status;
    }

    const response = await axios.get<ZaloTemplateListResponse>(`${ZALO_BUSINESS_API_URL}${ZALO_TEMPLATE_LIST_PATH}`, {
      headers: {
        access_token: resolvedAccessToken,
      },
      params,
    });

    if (response.data.error !== 0) {
      throw new Error(`Zalo get template list error ${response.data.error}: ${response.data.message}`);
    }

    logger.info(`[ZaloService] getTemplateList - total: ${response.data.data?.length ?? 0}`);
    return response.data;
  }

  /**
   * Lấy thông tin chi tiết một Template ZBS theo template_id.
   */
  async getTemplateDetail(
    accessToken: string | undefined,
    dto: GetTemplateDetailDto,
  ): Promise<ZaloTemplateDetailResponse> {
    const resolvedAccessToken = accessToken || (await this.getValidAccessToken());
    const response = await axios.get<ZaloTemplateDetailResponse>(
      `${ZALO_BUSINESS_API_URL}${ZALO_TEMPLATE_DETAIL_PATH}`,
      {
        headers: {
          access_token: resolvedAccessToken,
        },
        params: {
          template_id: dto.template_id,
        },
      },
    );

    if (response.data.error !== 0) {
      throw new Error(`Zalo get template detail error ${response.data.error}: ${response.data.message}`);
    }

    logger.info(`[ZaloService] getTemplateDetail - template_id: ${dto.template_id}`);
    return response.data;
  }

  /**
   * Gửi tin ZBS Template Message qua số điện thoại (production mode).
   * Số điện thoại phải là thành viên đã follow OA.
   */
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000; // 1s, 2s, 3s (tăng dần)

  /** Thực hiện 1 lần gửi template message, throw nếu thất bại */
  private isAccessTokenError(errorCode?: number, message?: string): boolean {
    const normalizedMessage = (message ?? "").toLowerCase();
    return (
      normalizedMessage.includes("access token") ||
      normalizedMessage.includes("access_token") ||
      normalizedMessage.includes("invalid token") ||
      normalizedMessage.includes("expired token") ||
      errorCode === -216
    );
  }

  private async postTemplateMessage(
    zaloPayload: PhoneTemplateMessagePayload,
    apiPath: string,
    accessToken: string,
  ): Promise<ZaloSendMessageResponse> {
    const response = await axios.post<ZaloSendMessageResponse>(`${ZALO_BUSINESS_API_URL}${apiPath}`, zaloPayload, {
      headers: { access_token: accessToken, "Content-Type": "application/json" },
    });

    return response.data;
  }

  private async attemptSend(
    zaloPayload: PhoneTemplateMessagePayload,
    apiPath: string,
  ): Promise<ZaloSendMessageResponse> {
    const accessToken = await this.getValidAccessToken();
    let responseData: ZaloSendMessageResponse;

    try {
      responseData = await this.postTemplateMessage(zaloPayload, apiPath, accessToken);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status !== 401 && status !== 403) {
        throw error;
      }

      logger.warn(`[ZaloService] sendMessage access token rejected (${status}), refreshing...`);
      const refreshedAccessToken = await this.getValidAccessToken(true);
      responseData = await this.postTemplateMessage(zaloPayload, apiPath, refreshedAccessToken);
    }

    if (responseData.error !== 0 && this.isAccessTokenError(responseData.error, responseData.message)) {
      logger.warn(`[ZaloService] sendMessage access token invalid (${responseData.error}), refreshing...`);
      const refreshedAccessToken = await this.getValidAccessToken(true);
      responseData = await this.postTemplateMessage(zaloPayload, apiPath, refreshedAccessToken);
    }

    if (responseData.error !== 0) {
      const error = new Error(`Zalo send message error ${responseData.error}: ${responseData.message}`);
      Object.assign(error, { errorCode: responseData.error });
      throw error;
    }

    return responseData;
  }

  private async resolvePhoneTemplate(dto: SendMessageDto): Promise<ResolvedPhoneTemplate> {
    if (dto.templateType) {
      const template = await this.zaloTemplateRepository.findByOption({
        where: { type: dto.templateType },
      });

      if (!template?.templateId) {
        throw new Error(`[ZaloService] Zalo template type ${dto.templateType} is not configured.`);
      }

      const templateId = template.templateId;

      return {
        templateId,
        templateName: template.name ?? null,
        templateType: template.type,
      };
    }

    if (dto.template_id) {
      return {
        templateId: dto.template_id,
        templateName: null,
        templateType: null,
      };
    }

    throw new Error("[ZaloService] template_id or templateType is required.");
  }

  private getHistoryTemplateId(templateId: string | null | undefined): number | null {
    if (!templateId) return null;

    const parsedTemplateId = Number(templateId);
    return Number.isInteger(parsedTemplateId) ? parsedTemplateId : null;
  }

  private getHistoryErrorCode(error: any): number | null {
    const errorCode = error?.errorCode ?? error?.response?.data?.error_code ?? error?.response?.data?.error;
    return typeof errorCode === "number" ? errorCode : null;
  }

  private getHistoryErrorMessage(errorCode: number | null, fallbackMessage: string): string {
    return errorCode !== null ? (ZALO_ERROR_MESSAGES[errorCode] ?? fallbackMessage) : fallbackMessage;
  }

  private async persistMessageHistory(
    dto: SendMessageDto,
    context: ZaloMessageHistoryContext,
    templateConfig: ResolvedPhoneTemplate | null,
    status: ZaloMessageStatusEnum,
    sentAt: Date,
    msgId: string | null,
    errorCode: number | null,
    errorMessage: string | null,
  ): Promise<void> {
    const historyData = {
      orderId: context.orderId,
      customerId: context.customerId,
      templateId: this.getHistoryTemplateId(templateConfig?.templateId ?? dto.template_id),
      templateName: templateConfig?.templateName ?? null,
      templateType: templateConfig?.templateType ?? dto.templateType ?? null,
      phone: dto.phone,
      msgId,
      status,
      errorCode,
      errorMessage: errorMessage?.slice(0, 500) ?? null,
      templateData: dto.template_data as Record<string, any>,
      requestPayload: dto as Record<string, any>,
      sentAt,
    };

    if (context?.historyId) {
      await this.zaloMessageHistoryRepository.update(context.historyId, historyData);
      return;
    }

    await this.zaloMessageHistoryRepository.create(historyData);
  }

  async sendMessage(dto: SendMessageDto, context: ZaloMessageHistoryContext): Promise<ZaloSendMessageResponse> {
    const sentAt = new Date();
    let msgId: string | null = null;
    let status = ZaloMessageStatusEnum.SENDING;
    let errorCode: number | null = null;
    let errorMessage: string | null = null;
    let templateConfig: ResolvedPhoneTemplate | null = null;

    try {
      const { templateType, ...zaloPayloadWithoutContext } = dto;
      templateConfig = await this.resolvePhoneTemplate(dto);
      const zaloPayload: PhoneTemplateMessagePayload = {
        ...zaloPayloadWithoutContext,
        // mode: "development",
        template_id: templateConfig.templateId,
      };

      console.log("payload sent zalo:", zaloPayload);
      const response = await this.attemptSend(zaloPayload, ZALO_PHONE_TEMPLATE_MESSAGE_PATH);
      msgId = response.data?.msg_id ?? response.data?.message_id ?? null;
      status = ZaloMessageStatusEnum.SENT;
      logger.info(`[ZaloService] sendMessage success - msg_id: ${msgId}, phone: ${dto.phone}`);
      return response;
    } catch (error: any) {
      const rawErrorMessage = error?.message ?? "Unknown error";
      errorCode = this.getHistoryErrorCode(error);
      errorMessage = this.getHistoryErrorMessage(errorCode, rawErrorMessage);
      status = ZaloMessageStatusEnum.FAILED;

      logger.error(`[ZaloService] sendMessage failed: ${rawErrorMessage}`);
      throw error;
    } finally {
      await this.persistMessageHistory(dto, context, templateConfig, status, sentAt, msgId, errorCode, errorMessage);
    }
  }

  /**
   * Gửi tin ZBS Template Message qua số điện thoại (development mode).
   * Dùng để test mà không cần số điện thoại đã follow OA.
   * Tin nhắn sẽ chỉ được gửi tới tài khoản Zalo của người dùng đang đăng nhập developer.
   */
  async sendMessageDev(dto: SendMessageDto): Promise<ZaloSendMessageResponse> {
    const { templateType, ...zaloPayloadWithoutContext } = dto;
    const templateConfig = await this.resolvePhoneTemplate(dto);
    const developmentPayload: PhoneTemplateMessagePayload = {
      ...zaloPayloadWithoutContext,
      template_id: templateConfig.templateId,
      mode: "development" as const,
    };
    const sentAt = new Date();
    let msgId: string | null = null;
    let status = ZaloMessageStatusEnum.SENDING;
    let errorCode: number | null = null;
    let errorMessage: string | null = null;

    try {
      const response = await this.attemptSend(developmentPayload, ZALO_PHONE_TEMPLATE_MESSAGE_PATH);
      msgId = response.data?.msg_id ?? response.data?.message_id ?? null;
      status = ZaloMessageStatusEnum.SENT;
      logger.info(`[ZaloService] sendMessageDev success - msg_id: ${msgId}, phone: ${dto.phone}`);
      return response;
    } catch (error: any) {
      errorMessage = error?.message ?? "Unknown error";

      status = ZaloMessageStatusEnum.FAILED;
      logger.error(`[ZaloService] sendMessageDev failed after ${ZaloService.MAX_RETRIES} attempts: ${errorMessage}`);
      throw error;
    }
  }

  async sendUidTemplateMessage(dto: SendUidMessageDto): Promise<ZaloSendMessageResponse> {
    const accessToken = await this.getValidAccessToken();
    const response = await axios.post<ZaloSendMessageResponse>(
      `${ZALO_OPEN_API_URL}${ZALO_UID_TEMPLATE_MESSAGE_PATH}`,
      dto,
      {
        headers: { access_token: accessToken, "Content-Type": "application/json" },
      },
    );

    if (response.data.error !== 0) {
      throw new Error(`Zalo send UID template message error ${response.data.error}: ${response.data.message}`);
    }

    logger.info(
      `[ZaloService] sendUidTemplateMessage success - message_id: ${
        response.data.data?.message_id ?? response.data.data?.msg_id
      }, user_id: ${dto.user_id}`,
    );
    return response.data;
  }

  /**
   * Lấy thông tin trạng thái gửi tin ZBS qua SĐT theo msg_id.
   */
  async getMessageStatus(
    accessToken: string | undefined,
    dto: GetMessageStatusDto,
  ): Promise<ZaloMessageStatusResponse> {
    const resolvedAccessToken = accessToken || (await this.getValidAccessToken());
    const response = await axios.get<ZaloMessageStatusResponse>(
      `${ZALO_BUSINESS_API_URL}${ZALO_PHONE_MESSAGE_STATUS_PATH}`,
      {
        headers: {
          access_token: resolvedAccessToken,
        },
        params: {
          msg_id: dto.msg_id,
        },
      },
    );

    if (response.data.error !== 0) {
      throw new Error(`Zalo get message status error ${response.data.error}: ${response.data.message}`);
    }

    logger.info(`[ZaloService] getMessageStatus - msg_id: ${dto.msg_id}, status: ${response.data.data?.status}`);
    return response.data;
  }
}
