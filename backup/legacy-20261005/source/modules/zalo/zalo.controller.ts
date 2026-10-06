import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { ZaloService } from "./zalo.service";
import { ZALO_TYPES } from "./zalo.types";
import {
  RefreshTokenSchema,
  GetTemplateListSchema,
  GetTemplateDetailSchema,
  SendMessageSchema,
  SendUidMessageSchema,
  GetMessageStatusSchema,
} from "./zalo.validator";

@injectable()
export class ZaloController {
  constructor(@inject(ZALO_TYPES.ZaloService) private zaloService: ZaloService) {}

  /**
   * POST /zalo/refresh-token
   * Body: { refresh_token: string }
   * Dùng Refresh Token để lấy Access Token mới.
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = RefreshTokenSchema.parse(req.body);
      const result = await this.zaloService.refreshAccessToken(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /zalo/upload-image
   * Header: access_token
   * Form: file (image)
   * Upload ảnh để dùng trong Zalo Template Message.
   */
  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = req.headers["access_token"] as string;
      if (!accessToken) {
        res.status(400).json({ success: false, message: "access_token header is required" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: "Image file is required" });
        return;
      }

      const result = await this.zaloService.uploadImage(
        accessToken,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /zalo/templates
   * Header: access_token
   * Query: offset, limit, status
   * Lấy danh sách Template ZBS.
   */
  getTemplateList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = req.headers["access_token"] as string | undefined;
      const dto = GetTemplateListSchema.parse(req.query);
      const result = await this.zaloService.getTemplateList(accessToken, dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /zalo/templates/:template_id
   * Header: access_token
   * Lấy thông tin chi tiết Template ZBS theo template_id.
   */
  getTemplateDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = req.headers["access_token"] as string | undefined;
      const dto = GetTemplateDetailSchema.parse({ template_id: req.params.template_id });
      const result = await this.zaloService.getTemplateDetail(accessToken, dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /zalo/messages
   * Header: access_token
   * Body: { phone, template_id, template_data, tracking_id? }
   * Gửi tin ZBS Template Message qua số điện thoại (production).
   */
  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = SendMessageSchema.parse(req.body);
      const result = await this.zaloService.sendMessage(dto, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /zalo/messages/dev
   * Header: access_token
   * Body: { phone, template_id, template_data, tracking_id? }
   * Gửi tin ZBS Template Message qua số điện thoại (development mode).
   */
  sendMessageDev = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = SendMessageSchema.parse(req.body);
      const result = await this.zaloService.sendMessageDev(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /zalo/messages/uid
   * Body: { user_id, template_id, template_data, tracking_id? }
   * Gửi ZBS Template Message qua UID theo OA API v3.
   */
  sendUidTemplateMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = SendUidMessageSchema.parse(req.body);
      const result = await this.zaloService.sendUidTemplateMessage(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /zalo/messages/status
   * Header: access_token
   * Query: msg_id
   * Lấy thông tin trạng thái gửi tin ZBS qua SĐT.
   */
  getMessageStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = req.headers["access_token"] as string | undefined;
      const dto = GetMessageStatusSchema.parse(req.query);
      const result = await this.zaloService.getMessageStatus(accessToken, dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
