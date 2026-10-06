import { Router } from "express";
import { injectable, inject } from "inversify";
import { OrderController } from "./order.controller";
import { ORDER_TYPES } from "./order.types";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { ClientOrderQuerySchema } from "./order.validator";
import { ClientOrderController } from "./client.order.controller";

@injectable()
export class ClientOrderRouter {
  private router: Router;

  constructor(@inject(ORDER_TYPES.ClientOrderController) private orderController: ClientOrderController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /client/orders - Get all orders with filters
    this.router.get(
      "/",
      zodValidate(ClientOrderQuerySchema, "query"),
      this.orderController.getFileInAllOrderByCustomer.bind(this.orderController),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
