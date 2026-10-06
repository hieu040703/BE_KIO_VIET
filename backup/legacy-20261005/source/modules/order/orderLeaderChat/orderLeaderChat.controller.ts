import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "@/shared/base/BaseController";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { ORDER_LEADER_CHAT_TYPES } from "./orderLeaderChat.types";
import { OrderLeaderChatService } from "./orderLeaderChat.service";

@injectable()
export class OrderLeaderChatController extends BaseController<OrderLeaderChatService> {
  constructor(
    @inject(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatService)
    protected service: OrderLeaderChatService,
    @inject(COMMON_TYPES.TransactionManager)
    private readonly transactionManager: TransactionManager,
  ) {
    super(service);
  }

  getRoomInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getRoomInfo(req.params.orderId as string, req.user!.userId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  listMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.listMessages(
        req.params.orderId as string,
        req.query as any,
        req.user!.userId,
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  createMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.create(req.body, req, tx.manager),
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.countUnread(req.params.orderId as string, req.user!.userId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.markAsRead(req.params.orderId as string, req.body, req.user!.userId, tx.manager),
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.update(req.params.id as string, req.body, req, tx.manager),
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.delete(req.params.id as string, req, tx.manager),
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };
}
