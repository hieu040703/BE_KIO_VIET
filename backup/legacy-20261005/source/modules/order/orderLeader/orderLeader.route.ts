import { Router } from "express";
import { injectable, inject } from "inversify";
import { OrderLeaderController } from "./orderLeader.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateOrderLeaderSchema,
  UpdateOrderLeaderSchema,
  OrderLeaderQuerySchema,
  OrderLeaderParamsSchema,
} from "./orderLeader.validator";
import { ORDER_LEADER_TYPES } from "./orderLeader.types";

@injectable()
export class OrderLeaderRouter {
  private router: Router;

  constructor(@inject(ORDER_LEADER_TYPES.OrderLeaderController) private orderLeaderController: OrderLeaderController) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All orderLeader routes require authentication
    // this.router.use(authenticate);

    // GET /orderLeaders - Get all orderLeaders with filters
    this.router.get("/", zodValidate(OrderLeaderQuerySchema, "query"), this.orderLeaderController.getAllWithPagination);

    // POST /orderLeaders - Create new orderLeader
    this.router.post("/", zodValidate(CreateOrderLeaderSchema, "body"), this.orderLeaderController.create);

    // GET /orderLeaders/:id - Get orderLeader by ID
    this.router.get("/:id", zodValidate(OrderLeaderParamsSchema, "params"), this.orderLeaderController.getById);

    // PUT /orderLeaders/:id - Update orderLeader
    this.router.put(
      "/:id",
      zodValidate(OrderLeaderParamsSchema, "params"),
      zodValidate(UpdateOrderLeaderSchema, "body"),
      this.orderLeaderController.update,
    );

    // DELETE /orderLeaders/:id - Delete orderLeader
    this.router.delete("/:id", zodValidate(OrderLeaderParamsSchema, "params"), this.orderLeaderController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
