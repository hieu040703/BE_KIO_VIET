import { Router } from "express";
import { injectable, inject } from "inversify";
import { AdminServiceOrderController } from "./admin.serviceOrder.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateServiceOrderSchema,
  UpdateServiceOrderSchema,
  ServiceOrderQuerySchema,
  ServiceOrderParamsSchema,
  ConfirmServiceOrderSchema,
  SubmitQuoteSchema,
  AdminServiceOrderCheckInSchema,
} from "./serviceOrder.validator";
import { SERVICE_ORDER_TYPES } from "./serviceOrder.types";
import { SERVICE_ORDER_CHAT_TYPES } from "./chat/serviceOrderChat.types";
import { ServiceOrderChatRouter } from "./chat/serviceOrderChat.route";
import { SERVICE_ORDER_RATING_TYPES } from "./serviceOrderRating/serviceOrderRating.types";
import { ServiceOrderRatingRouter } from "./serviceOrderRating/serviceOrderRating.route";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class AdminServiceOrderRouter {
  private router: Router;

  constructor(
    @inject(SERVICE_ORDER_TYPES.AdminServiceOrderController)
    private serviceOrderController: AdminServiceOrderController,
    @inject(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatRouter)
    private readonly serviceOrderChatRouter: ServiceOrderChatRouter,
    @inject(SERVICE_ORDER_RATING_TYPES.ServiceOrderRatingRouter)
    private readonly serviceOrderRatingRouter: ServiceOrderRatingRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /service-orders - Get all service orders with filters
    this.router.get(
      "/",
      permissionMiddleware({ serviceOrder: ["read"] }),
      zodValidate(ServiceOrderQuerySchema, "query"),
      this.serviceOrderController.getAllWithPagination,
    );

    // POST /service-orders - Create new service order
    this.router.post(
      "/",
      permissionMiddleware({ serviceOrder: ["create"] }),
      zodValidate(CreateServiceOrderSchema, "body"),
      this.serviceOrderController.create,
    );

    // GET /service-orders/:id - Get service order by ID
    this.router.get("/:id", zodValidate(ServiceOrderParamsSchema, "params"), this.serviceOrderController.getById);

    //# Mount chat router for service orders
    this.router.use("/:serviceOrderId/chat", this.serviceOrderChatRouter.getRouter());

    //# Additional routes for service order management
    this.router.use("/:serviceOrderId/ratings", this.serviceOrderRatingRouter.getRouter());

    // POST /service-orders/:id/cancel - Cancel service order
    this.router.post(
      "/:id/cancel",
      zodValidate(ServiceOrderParamsSchema, "params"),
      this.serviceOrderController.cancel,
    );

    // POST /service-orders/:id/confirm - Confirm service order
    this.router.post(
      "/:id/confirm",
      zodValidate(ServiceOrderParamsSchema, "params"),
      zodValidate(ConfirmServiceOrderSchema, "body"),
      this.serviceOrderController.confirm,
    );

    // POST /service-orders/:id/submit-quote - Step 2: Staff submits quote
    this.router.post(
      "/:id/submit-quote",
      zodValidate(ServiceOrderParamsSchema, "params"),
      zodValidate(SubmitQuoteSchema, "body"),
      this.serviceOrderController.submitQuote,
    );

    // POST /service-orders/:id/start - Step 5: Start processing
    this.router.post(
      "/:id/start",
      zodValidate(ServiceOrderParamsSchema, "params"),
      this.serviceOrderController.startProcessing,
    );

    this.router.post(
      "/:id/check-in",
      zodValidate(ServiceOrderParamsSchema, "params"),
      zodValidate(AdminServiceOrderCheckInSchema, "body"),
      this.serviceOrderController.checkIn,
    );

    // POST /service-orders/:id/complete - Step 6: Employee confirms completion
    this.router.post(
      "/:id/complete",
      zodValidate(ServiceOrderParamsSchema, "params"),
      this.serviceOrderController.completeByEmployee,
    );

    // PUT /service-orders/:id - Update service order
    this.router.put(
      "/:id",
      zodValidate(ServiceOrderParamsSchema, "params"),
      zodValidate(UpdateServiceOrderSchema, "body"),
      this.serviceOrderController.update,
    );

    // DELETE /service-orders/:id - Delete service order
    this.router.delete("/:id", zodValidate(ServiceOrderParamsSchema, "params"), this.serviceOrderController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
