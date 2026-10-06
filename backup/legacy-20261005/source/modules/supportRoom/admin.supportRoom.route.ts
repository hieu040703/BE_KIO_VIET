import { Router } from "express";
import { injectable, inject } from "inversify";
import { AdminSupportRoomController } from "./admin.supportRoom.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import {
  CreateSupportRoomSchema,
  UpdateSupportRoomSchema,
  SupportRoomQuerySchema,
  SupportRoomParamsSchema,
} from "./supportRoom.validator";
import { SUPPORT_ROOM_TYPES } from "./supportRoom.types";
import { SUPPORT_ROOM_CHAT_MESSAGE_TYPES } from "./supportRoomChatMessage/supportRoomChatMessage.types";
import { SupportRoomChatMessageRouter } from "./supportRoomChatMessage/supportRoomChatMessage.route";

@injectable()
export class AdminSupportRoomRouter {
  private router: Router;

  constructor(
    @inject(SUPPORT_ROOM_TYPES.AdminSupportRoomController) private supportRoomController: AdminSupportRoomController,
    @inject(SUPPORT_ROOM_CHAT_MESSAGE_TYPES.SupportRoomChatMessageRouter)
    private readonly chatMessageRouter: SupportRoomChatMessageRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /support-rooms/unread-count
    this.router.get("/unread-count", this.supportRoomController.getUnreadCount);

    // GET /support-rooms (with last message info)
    this.router.get(
      "/",
      zodValidate(SupportRoomQuerySchema, "query"),
      this.supportRoomController.getRoomsWithLastMessage,
    );

    // POST /support-rooms
    this.router.post("/", zodValidate(CreateSupportRoomSchema, "body"), this.supportRoomController.create);

    // GET /support-rooms/:id
    this.router.get("/:id", zodValidate(SupportRoomParamsSchema, "params"), this.supportRoomController.getById);

    // PUT /support-rooms/:id/mark-read
    this.router.put("/:id/mark-read", zodValidate(SupportRoomParamsSchema, "params"), this.supportRoomController.markAsRead);

    // PUT /support-rooms/:id
    this.router.put(
      "/:id",
      zodValidate(SupportRoomParamsSchema, "params"),
      zodValidate(UpdateSupportRoomSchema, "body"),
      this.supportRoomController.update,
    );

    // DELETE /support-rooms/:id
    this.router.delete("/:id", zodValidate(SupportRoomParamsSchema, "params"), this.supportRoomController.delete);

    // Nested: GET/POST /support-rooms/:supportRoomId/messages
    this.router.use("/:supportRoomId/messages", this.chatMessageRouter.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
