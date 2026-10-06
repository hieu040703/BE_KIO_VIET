import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { StringeeService } from "./stringee.service";
import { STRINGEE_TYPES } from "./stringee.types";
import logger from "@/shared/utils/logger";
import { ApiResponseHandler } from "@/shared/utils/response.utils";

/**
 * Stringee Controller
 *
 * Endpoints:
 * 1. POST /generate-token       - Generate access token cho client SDK
 * 2. GET  /answer-url            - Webhook cho Stringee Server lấy SCCO (answer_url)
 * 3. POST /event-url             - Webhook cho Stringee Server gửi call events (event_url)
 * 4. POST /make-call             - Make outbound call từ server (REST API)
 * 5. GET  /generate-rest-token   - Generate REST API token (cho testing)
 * 6. GET  /recordings/:id        - Proxy stream bản ghi âm có xác thực
 */
@injectable()
export class StringeeController {
  constructor(@inject(STRINGEE_TYPES.StringeeService) private stringeeService: StringeeService) {
    // Bind context cho các method
    this.generateToken = this.generateToken.bind(this);
    this.answerUrl = this.answerUrl.bind(this);
    this.eventUrl = this.eventUrl.bind(this);
    this.makeCall = this.makeCall.bind(this);
    this.generateRestToken = this.generateRestToken.bind(this);
    this.handleRecordingUrl = this.handleRecordingUrl.bind(this);
    this.getRecording = this.getRecording.bind(this);
    this.getUserOnline = this.getUserOnline.bind(this);
    this.getUserStatus = this.getUserStatus.bind(this);
    this.updateUserStatus = this.updateUserStatus.bind(this);
  }

  /**
   * Generate access token cho Stringee Client SDK
   * Client dùng token này để connect tới Stringee Server
   *
   * POST /stringee/generate-token
   * Body: { userId: string }
   */
  async generateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("[Stringee] generateToken called with body:", req.body);
    try {
      const userId = req.user?.userId;
      const rest_api = req.body.rest_api ? req.body.rest_api : undefined;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const token = this.stringeeService.generateAccessToken(userId, rest_api);

      res.status(200).json({
        statusCode: 200,
        success: true,
        data: {
          token,
          userId,
          expiresIn: 3600, // 1 hour
        },
        message: "Token generated successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  /**
   * Webhook answer_url - Stringee Server gọi khi có cuộc gọi mới
   * Trả về SCCO (Stringee Call Control Object) để hướng dẫn xử lý cuộc gọi
   *
   * Flow 1 (App-to-app): fromInternal=true
   *   GET /stringee/answer-url?from=user_1&to=user_2&fromInternal=true&userId=user_1&callId=xxx
   *   → SCCO route cuộc gọi tới user trong Client App
   *
   * Flow 2 (App-to-phone): fromInternal=true
   *   GET /stringee/answer-url?from=phone_1&to=phone_2&fromInternal=true&userId=xxx&callId=xxx
   *   → SCCO route cuộc gọi ra số điện thoại bên ngoài
   *
   * Flow 3 (Phone-to-app): fromInternal=false
   *   GET /stringee/answer-url?from=caller_phone&to=stringee_number&fromInternal=false&callId=xxx&uuid=xxx
   *   → SCCO route cuộc gọi vào Client App
   */
  async answerUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to, fromInternal, userId, callId, uuid, custom } = req.query;

      logger.info(`[Stringee] answer_url webhook called with query: ${JSON.stringify(req.query)}`);

      const scco = await this.stringeeService.handleAnswerUrl({
        from: from as string,
        to: to as string,
        uuid: uuid as string,
        callId: callId as string,
        fromInternal: fromInternal as string,
        userId: userId as string,
        custom: custom ? JSON.parse(custom as string) : undefined,
      });

      // Stringee yêu cầu response trả về trực tiếp JSON array SCCO
      res.status(200).json(scco);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  /**
   * Webhook event_url - Stringee Server gửi sự kiện cuộc gọi
   * Nhận notification khi trạng thái cuộc gọi thay đổi
   *
   * POST /stringee/event-url
   * Body: { call_status, call_id, from, to, duration, ... }
   */
  async eventUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // logger.info(`[Stringee] event_url webhook called with body: ${JSON.stringify(req.body)}`);

      const result = await this.stringeeService.handleEventUrl(req.body);

      res.status(result.statusCode).json(result);
    } catch (error) {
      logger.error(`[Stringee] event_url error:`, error);
      res.status(200).json(ApiResponseHandler.getSuccess("ACK_WITH_ERROR"));
    }
  }

  async handleRecordingUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // logger.info(`[Stringee] recording_url webhook called with body: ${JSON.stringify(req.body)}`);

      await this.stringeeService.handleRecordingUrl(req.body);

      res.status(200).json({
        success: true,
        message: "Recording URL received",
      });
    } catch (error) {
      logger.error(`[Stringee] recording_url error:`, error);
      next(error);
    }
  }

  /**
   * Proxy bản ghi âm từ Stringee để browser không phải tự gửi REST token.
   * Hỗ trợ Range header cho audio player và query download=1 cho nút tải file.
   */
  async getRecording(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const callHistoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!callHistoryId) {
        res.status(400).json({
          success: false,
          message: "Call history ID is required",
        });
        return;
      }

      const { stream, statusCode, headers } = await this.stringeeService.getRecordingStream(
        callHistoryId,
        req.headers.range,
        req.query.download === "1" || req.query.download === "true",
      );

      res.status(statusCode);
      Object.entries(headers).forEach(([name, value]) => res.setHeader(name, value));

      stream.on("error", (error) => {
        if (res.headersSent) {
          res.destroy(error);
          return;
        }

        next(error);
      });
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Make outbound call từ server (server-to-phone)
   *
   * POST /stringee/make-call
   * Body: { from: string, to: string, customData?: string }
   */
  async makeCall(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to, customData } = req.body;

      const result = await this.stringeeService.makeOutboundCall({
        from,
        to,
        customData,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Outbound call initiated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate REST API token cho testing
   *
   * GET /stringee/generate-rest-token
   */
  async generateRestToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.stringeeService.generateRestApiToken();

      res.status(200).json({
        success: true,
        data: {
          token,
          expiresIn: 2592000,
        },
        message: "REST API token generated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserOnline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.stringeeService.getUserOnline();

      res.status(200).json({
        success: true,
        data: result,
        message: "User online retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const result = await this.stringeeService.getUserStatus(userId);

      res.status(200).json({
        success: true,
        data: result,
        message: "User status retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const manualStatus = req.body.manualStatus as { attribute: string; value?: string }[];

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      // if (!manualStatus || !Array.isArray(manualStatus)) {
      //   res.status(400).json({
      //     success: false,
      //     message: "manualStatus must be an array of { attribute, value }",
      //   });
      //   return;
      // }

      const result = await this.stringeeService.updateUserStatus(userId, manualStatus);

      res.status(200).json({
        success: true,
        data: result,
        message: "User status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
