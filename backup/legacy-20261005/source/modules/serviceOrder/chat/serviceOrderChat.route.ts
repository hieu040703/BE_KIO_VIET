import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { SERVICE_ORDER_CHAT_TYPES } from "./serviceOrderChat.types";
import { ServiceOrderChatController } from "./serviceOrderChat.controller";
import {
  AddChatParticipantSchema,
  RemoveChatParticipantSchema,
  CreateServiceOrderChatMessageSchema,
  ServiceOrderChatMessageQuerySchema,
  ServiceOrderChatParamsSchema,
} from "./serviceOrderChat.validator";

@injectable()
export class ServiceOrderChatRouter {
  private readonly router: Router;

  constructor(
    @inject(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatController)
    private readonly controller: ServiceOrderChatController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/room",
      zodValidate(ServiceOrderChatParamsSchema, "params"),
      this.controller.getRoomInfo,
    );
    this.router.get(
      "/messages",
      zodValidate(ServiceOrderChatParamsSchema, "params"),
      zodValidate(ServiceOrderChatMessageQuerySchema, "query"),
      this.controller.listMessages,
    );
    this.router.post(
      "/messages",
      zodValidate(ServiceOrderChatParamsSchema, "params"),
      zodValidate(CreateServiceOrderChatMessageSchema, "body"),
      this.controller.createMessage,
    );
    // Participant management (admin only)
    this.router.post(
      "/participants",
      zodValidate(ServiceOrderChatParamsSchema, "params"),
      zodValidate(AddChatParticipantSchema, "body"),
      this.controller.addParticipant,
    );
    this.router.delete(
      "/participants/:targetUserId",
      zodValidate(ServiceOrderChatParamsSchema, "params"),
      zodValidate(RemoveChatParticipantSchema, "params"),
      this.controller.removeParticipant,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
