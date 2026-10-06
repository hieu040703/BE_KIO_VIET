import { inject, injectable } from "inversify";
import { Router } from "express";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { ORDER_LEADER_CHAT_TYPES } from "./orderLeaderChat.types";
import { OrderLeaderChatController } from "./orderLeaderChat.controller";
import {
  CreateOrderLeaderChatSchema,
  OrderLeaderChatParamsSchema,
  OrderLeaderChatQuerySchema,
  OrderLeaderChatReadSchema,
  UpdateOrderLeaderChatSchema,
} from "./orderLeaderChat.validator";

@injectable()
export class OrderLeaderChatRouter {
  private readonly router: Router;

  constructor(
    @inject(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatController)
    private readonly controller: OrderLeaderChatController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/room", this.controller.getRoomInfo);
    this.router.get("/messages", zodValidate(OrderLeaderChatQuerySchema, "query"), this.controller.listMessages);
    this.router.post("/messages", zodValidate(CreateOrderLeaderChatSchema, "body"), this.controller.createMessage);
    this.router.get("/unread-count", this.controller.getUnreadCount);
    this.router.post("/read", zodValidate(OrderLeaderChatReadSchema, "body"), this.controller.markAsRead);
    this.router.put(
      "/messages/:id",
      zodValidate(OrderLeaderChatParamsSchema, "params"),
      zodValidate(UpdateOrderLeaderChatSchema, "body"),
      this.controller.updateMessage,
    );
    this.router.delete(
      "/messages/:id",
      zodValidate(OrderLeaderChatParamsSchema, "params"),
      this.controller.deleteMessage,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
