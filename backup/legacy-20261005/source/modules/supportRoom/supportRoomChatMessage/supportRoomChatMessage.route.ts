import { Router } from "express";
import { injectable, inject } from "inversify";
import { SupportRoomChatMessageController } from "./supportRoomChatMessage.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import {
  CreateSupportRoomChatMessageSchema,
  SupportRoomChatMessageQuerySchema,
  SupportRoomChatParamsSchema,
} from "./supportRoomChatMessage.validator";
import { SUPPORT_ROOM_CHAT_MESSAGE_TYPES } from "./supportRoomChatMessage.types";

@injectable()
export class SupportRoomChatMessageRouter {
  private router: Router;

  constructor(
    @inject(SUPPORT_ROOM_CHAT_MESSAGE_TYPES.SupportRoomChatMessageController)
    private readonly controller: SupportRoomChatMessageController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /:supportRoomId/messages
    this.router.get(
      "/",
      zodValidate(SupportRoomChatParamsSchema, "params"),
      zodValidate(SupportRoomChatMessageQuerySchema, "query"),
      this.controller.listMessages,
    );

    // POST /:supportRoomId/messages
    this.router.post(
      "/",
      zodValidate(SupportRoomChatParamsSchema, "params"),
      zodValidate(CreateSupportRoomChatMessageSchema, "body"),
      this.controller.sendMessage,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
