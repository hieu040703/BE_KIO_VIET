import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import { SERVICE_ORDER_CHAT_TYPES } from "./serviceOrderChat.types";
import { ServiceOrderChatService } from "./serviceOrderChat.service";
import { BadRequestError } from "@/shared/types/errors";

@injectable()
export class ServiceOrderChatController {
  constructor(
    @inject(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatService)
    private readonly chatService: ServiceOrderChatService,
  ) {}

  listMessages = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const userId = req.user?.userId;
      const serviceOrderId = req.params.serviceOrderId as string;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!serviceOrderId) {
        throw new BadRequestError("Service order ID is required");
      }

      const result = await this.chatService.listMessages(serviceOrderId, req.query as any, userId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  createMessage = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const userId = req.user?.userId;
      const { serviceOrderId } = req.params as { serviceOrderId: string };
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await this.chatService.createMessage(serviceOrderId, req.body, userId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  getRoomInfo = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const userId = req.user?.userId;
      const { serviceOrderId } = req.params as { serviceOrderId: string };

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const data = await this.chatService.getRoomInfo(serviceOrderId, userId);
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: "OK",
        data,
      });
    } catch (error) {
      next(error);
      return;
    }
  };

  addParticipant = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const userId = req.user?.userId;
      const { serviceOrderId } = req.params as { serviceOrderId: string };

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await this.chatService.addParticipant(serviceOrderId, req.body, userId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  removeParticipant = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const userId = req.user?.userId;
      const { serviceOrderId, targetUserId } = req.params as { serviceOrderId: string; targetUserId: string };

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await this.chatService.removeParticipant(serviceOrderId, targetUserId, userId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };
}
