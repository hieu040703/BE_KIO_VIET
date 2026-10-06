import { Router } from "express";
import { injectable, inject } from "inversify";
import { OrderDetailController } from "./orderDetail.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateOrderDetailSchema,
  CreateOrderDetailBodySchema,
  OrderIdParamsSchema,
  UpdateOrderDetailSchema,
  OrderDetailQuerySchema,
  OrderDetailParamsSchema,
} from "./orderDetail.validator";
import { ORDER_DETAIL_TYPES } from "./orderDetail.types";

@injectable()
export class OrderDetailRouter {
  private router: Router;

  constructor(@inject(ORDER_DETAIL_TYPES.OrderDetailController) private orderDetailController: OrderDetailController) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All orderDetail routes require authentication
    // this.router.use(authenticate);

    // GET /orderDetails - Get all orderDetails with filters
    this.router.get("/", zodValidate(OrderDetailQuerySchema, "query"), this.orderDetailController.getAllWithPagination);

    // POST /orderDetails - Create new orderDetail
    this.router.post(
      "/",
      zodValidate(OrderIdParamsSchema, "params"),
      zodValidate(CreateOrderDetailBodySchema, "body"),
      this.orderDetailController.create.bind(this.orderDetailController),
    );

    // GET /orderDetails/:id - Get orderDetail by ID
    this.router.get("/:id", zodValidate(OrderDetailParamsSchema, "params"), this.orderDetailController.getById);

    // PUT /orderDetails/:id - Update orderDetail
    this.router.put(
      "/:id",
      zodValidate(OrderDetailParamsSchema, "params"),
      zodValidate(UpdateOrderDetailSchema, "body"),
      this.orderDetailController.update.bind(this.orderDetailController),
    );

    // DELETE /orderDetails/:id - Delete orderDetail
    this.router.delete(
      "/:id",
      zodValidate(OrderDetailParamsSchema, "params"),
      this.orderDetailController.delete.bind(this.orderDetailController),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
