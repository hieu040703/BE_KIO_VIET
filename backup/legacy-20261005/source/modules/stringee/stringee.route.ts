import { Router } from "express";
import { injectable, inject } from "inversify";
import { StringeeController } from "./stringee.controller";
import { STRINGEE_TYPES } from "./stringee.types";
import { MakeCallSchema } from "./stringee.validator";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { authenticate } from "@/shared/middleware/auth.middleware";
import { adminMiddleware } from "@/shared/middleware/admin.middleware";

/**
 * Common Stringee Router (KHÔNG yêu cầu xác thực)
 *
 * Các webhook endpoint mà Stringee Server gọi tới - KHÔNG cần xác thực
 * vì Stringee Server không gửi auth token của hệ thống.
 *
 * Routes:
 * - GET  /answer-url  - Webhook: Stringee Server lấy SCCO để xử lý cuộc gọi
 * - POST /event-url   - Webhook: Stringee Server gửi call status events
 */
@injectable()
export class StringeeRouter {
  private router: Router;

  constructor(@inject(STRINGEE_TYPES.StringeeController) private stringeeController: StringeeController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /stringee/generate-token - Generate access token cho Stringee Client SDK
    this.router.post("/generate-token", authenticate, this.stringeeController.generateToken);

    // POST /stringee/make-call - Make outbound call từ server
    this.router.post("/make-call", authenticate, zodValidate(MakeCallSchema, "body"), this.stringeeController.makeCall);

    // GET /stringee/generate-rest-token - Generate REST API token (cho testing)
    this.router.get("/generate-rest-token", authenticate, this.stringeeController.generateRestToken);

    // GET /stringee/answer-url - Webhook cho Stringee Server lấy SCCO
    // Stringee gửi GET request với query params: from, to, fromInternal, userId, projectId, callId
    this.router.get("/answer-url", this.stringeeController.answerUrl);

    // POST /stringee/event-url - Webhook nhận call events từ Stringee Server
    // Stringee gửi POST request với body chứa call_status, call_id, from, to, duration, ...
    this.router.post("/event-url", this.stringeeController.eventUrl);

    // POST /stringee/recording-url - Webhook nhận recording URL từ Stringee Server
    // Stringee gửi POST request với body chứa call_id, recording_url, from, to, ...
    this.router.post("/recording-url", this.stringeeController.handleRecordingUrl);

    // GET /v1/common/stringee/recordings/:id - Proxy bản ghi âm có xác thực ứng dụng
    this.router.get(
      "/recordings/:id",
      authenticate,
      adminMiddleware,
      this.stringeeController.getRecording,
    );

    // GET /stringee/user-online
    this.router.get("/user-online", this.stringeeController.getUserOnline);

    // GET /stringee/user-status/:userId
    this.router.get("/user-status/:userId", this.stringeeController.getUserStatus);

    // PUT /stringee/user-status/:userId - Body: { manualStatus: { attribute: string, value: string }[] }
    this.router.put("/user-status/:userId", authenticate, this.stringeeController.updateUserStatus);
  }

  public getRouter(): Router {
    return this.router;
  }
}
