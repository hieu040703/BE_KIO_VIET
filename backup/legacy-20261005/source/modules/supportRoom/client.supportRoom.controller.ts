import { injectable, inject } from "inversify";
import { NextFunction, Request, Response } from "express";
import { ClientSupportRoomService } from "./client.supportRoom.service";
import { SUPPORT_ROOM_TYPES } from "./supportRoom.types";

@injectable()
export class ClientSupportRoomController {
  constructor(
    @inject(SUPPORT_ROOM_TYPES.ClientSupportRoomService) private readonly service: ClientSupportRoomService,
  ) {}

  getMyRoom = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await this.service.getOrCreateMyRoom(userId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };
}
