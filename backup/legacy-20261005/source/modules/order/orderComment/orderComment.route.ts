import { Router } from "express";
import { injectable, inject } from "inversify";
import { OrderCommentController } from "./orderComment.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { ORDER_COMMENT_TYPES } from "./orderComment.types";
import {
  OrderCommentQuerySchema,
  CreateOrderCommentSchema,
  OrderCommentParamsSchema,
  UpdateOrderCommentSchema,
  MarkCommentsAsViewedSchema,
} from "./orderComment.validator";

@injectable()
export class OrderCommentRouter {
  private router: Router;

  constructor(
    @inject(ORDER_COMMENT_TYPES.OrderCommentController)
    private orderCommentController: OrderCommentController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /orderComments/participants - Get users linked to OrderEmployee, OrderLeader, or order creator
    this.router.get(
      "/participants",
      this.orderCommentController.getChatParticipants,
    );

    // GET /orderComments/attachments - Get all file attachments for an order
    this.router.get(
      "/attachments",
      this.orderCommentController.getAllFileAttachments.bind(
        this.orderCommentController,
      ),
    );

    // GET /orderComments - Get all orderComments with filters
    this.router.get(
      "/",
      zodValidate(OrderCommentQuerySchema, "query"),
      this.orderCommentController.getAllWithPagination.bind(
        this.orderCommentController,
      ),
    );

    // POST /orderComments/mark-as-viewed - Mark comments as viewed for an order
    this.router.post(
      "/mark-as-viewed",
      zodValidate(MarkCommentsAsViewedSchema, "body"),
      this.orderCommentController.markCommentsAsViewed.bind(
        this.orderCommentController,
      ),
    );

    // POST /orderComments - Create new orderComment
    this.router.post(
      "/",
      zodValidate(CreateOrderCommentSchema, "body"),
      this.orderCommentController.create.bind(this.orderCommentController),
    );

    // GET /orderComments/:id - Get orderComment by ID
    this.router.get(
      "/:id",
      zodValidate(OrderCommentParamsSchema, "params"),
      this.orderCommentController.getById.bind(this.orderCommentController),
    );

    // PUT /orderComments/:id - Update orderComment
    this.router.put(
      "/:id",
      zodValidate(OrderCommentParamsSchema, "params"),
      zodValidate(UpdateOrderCommentSchema, "body"),
      this.orderCommentController.update.bind(this.orderCommentController),
    );

    // DELETE /orderComments/:id - Delete orderComment
    this.router.delete(
      "/:id",
      zodValidate(OrderCommentParamsSchema, "params"),
      this.orderCommentController.delete.bind(this.orderCommentController),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
