import { Router } from "express";
import { injectable, inject } from "inversify";
import { ClientSupportRoomController } from "./client.supportRoom.controller";
import { SUPPORT_ROOM_TYPES } from "./supportRoom.types";
import { SUPPORT_ROOM_CHAT_MESSAGE_TYPES } from "./supportRoomChatMessage/supportRoomChatMessage.types";
import { SupportRoomChatMessageRouter } from "./supportRoomChatMessage/supportRoomChatMessage.route";

@injectable()
export class ClientSupportRoomRouter {
  private router: Router;

  constructor(
    @inject(SUPPORT_ROOM_TYPES.ClientSupportRoomController) private readonly controller: ClientSupportRoomController,
    @inject(SUPPORT_ROOM_CHAT_MESSAGE_TYPES.SupportRoomChatMessageRouter)
    private readonly chatMessageRouter: SupportRoomChatMessageRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /client/support-rooms/my-room  – get or create room for logged-in customer
    this.router.get("/my-room", this.controller.getMyRoom);

    // Nested: GET/POST /client/support-rooms/:supportRoomId/messages
    this.router.use("/:supportRoomId/messages", this.chatMessageRouter.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
