import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "@/shared/base/BaseController";
import { ANNOUNCEMENT_TYPES } from "./announcement.types";
import { AnnouncementService } from "./announcement.service";

@injectable()
export class AnnouncementController extends BaseController<AnnouncementService> {
  constructor(@inject(ANNOUNCEMENT_TYPES.AnnouncementService) protected service: AnnouncementService) {
    super(service);
  }

  send = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await this.service.sendAnnouncement(id, userId, req);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };
}
