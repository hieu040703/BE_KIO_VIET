import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import { SUPPORT_ROOM_CHAT_MESSAGE_TYPES } from "./supportRoomChatMessage.types";
import { SupportRoomChatMessageService } from "./supportRoomChatMessage.service";

@injectable()
export class SupportRoomChatMessageController {
  constructor(
    @inject(SUPPORT_ROOM_CHAT_MESSAGE_TYPES.SupportRoomChatMessageService)
    private readonly chatService: SupportRoomChatMessageService,
  ) {}

  listMessages = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const userId = req.user?.userId;
      const { supportRoomId } = req.params as { supportRoomId: string };
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await this.chatService.listMessages(supportRoomId, req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const userId = req.user?.userId;
      const { supportRoomId } = req.params as { supportRoomId: string };
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await this.chatService.sendMessage(supportRoomId, userId, req.body);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };
}
