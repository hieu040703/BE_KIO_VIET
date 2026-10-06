import { injectable, inject } from "inversify";
import { BaseController } from "@/shared/base/BaseController";
import { OrderCommentService } from "./orderComment.service";
import { ORDER_COMMENT_TYPES } from "./orderComment.types";
import { Request, Response } from "express";

@injectable()
export class OrderCommentController extends BaseController<OrderCommentService> {
  constructor(
    @inject(ORDER_COMMENT_TYPES.OrderCommentService)
    protected service: OrderCommentService,
  ) {
    super(service);
  }

  getChatParticipants = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
      const orderId = req.params.orderId as string;
      const data = await this.service.getChatParticipants(orderId);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
      const data = await this.service.create(req.body, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  markCommentsAsViewed = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
      const orderId = req.params.orderId as string;
      const userId = req.user?.userId;
      const commentId = (req.body as { commentId?: string } | undefined)
        ?.commentId;

      if (!orderId || !userId) {
        return res.status(400).json({ message: "Invalid orderId or userId" });
      }

      const data = await this.service.markCommentsAsViewed(
        orderId,
        userId,
        commentId,
      );

      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  getAllFileAttachments = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
      const orderId = req.params.orderId as string;
      const data = await this.service.getAllFileAttachments(orderId);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
