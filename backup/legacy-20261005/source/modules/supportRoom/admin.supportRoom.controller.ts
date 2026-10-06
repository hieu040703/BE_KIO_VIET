import { injectable, inject } from "inversify";
import { NextFunction, Request, Response } from "express";
import { AdminSupportRoomService } from "./admin.supportRoom.service";
import { SUPPORT_ROOM_TYPES } from "./supportRoom.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class AdminSupportRoomController extends BaseController<AdminSupportRoomService> {
  constructor(@inject(SUPPORT_ROOM_TYPES.AdminSupportRoomService) protected service: AdminSupportRoomService) {
    super(service);
  }

  getRoomsWithLastMessage = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.service.getRoomsWithLastMessage(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.service.getUnreadCount();
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.service.markAsRead(id);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };
}
