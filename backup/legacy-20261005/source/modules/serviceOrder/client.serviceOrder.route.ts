import { Router } from "express";
import { injectable, inject } from "inversify";
import { ClientServiceOrderController } from "./client.serviceOrder.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import {
  CustomerCreateServiceOrderSchema,
  CustomerUpdateServiceOrderSchema,
  ServiceOrderQuerySchema,
  ServiceOrderParamsSchema,
  CustomerConfirmCompletedServiceOrderSchema,
  CustomerCreateServiceOrderRatingSchema,
  CustomerConfirmQuoteSchema,
  CustomerEstimateServiceOrderPriceSchema,
} from "./serviceOrder.validator";
import { SERVICE_ORDER_TYPES } from "./serviceOrder.types";
import { SERVICE_ORDER_CHAT_TYPES } from "./chat/serviceOrderChat.types";
import { ServiceOrderChatRouter } from "./chat/serviceOrderChat.route";

@injectable()
export class ClientServiceOrderRouter {
  private router: Router;

  constructor(
    @inject(SERVICE_ORDER_TYPES.ClientServiceOrderController)
    private serviceOrderController: ClientServiceOrderController,
    @inject(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatRouter)
    private readonly serviceOrderChatRouter: ServiceOrderChatRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use("/:serviceOrderId/chat", this.serviceOrderChatRouter.getRouter());

    this.router.get(
      "/",
      zodValidate(ServiceOrderQuerySchema, "query"),
      this.serviceOrderController.getAllWithPagination,
    );

    this.router.post("/", zodValidate(CustomerCreateServiceOrderSchema, "body"), this.serviceOrderController.create);

    // POST /client/service-orders/estimated-price - Step 2: Customer estimates price
    this.router.post(
      "/estimated-price",
      zodValidate(CustomerEstimateServiceOrderPriceSchema, "body"),
      this.serviceOrderController.estimatePrice,
    );

    this.router.get("/:id", zodValidate(ServiceOrderParamsSchema, "params"), this.serviceOrderController.getById);

    this.router.post(
      "/:id/cancel",
      zodValidate(ServiceOrderParamsSchema, "params"),
      this.serviceOrderController.cancelOrder,
    );

    this.router.post(
      "/:id/confirm-complete",
      zodValidate(ServiceOrderParamsSchema, "params"),
      zodValidate(CustomerConfirmCompletedServiceOrderSchema, "body"),
      this.serviceOrderController.confirmCompleted,
    );

    this.router.post(
      "/:id/ratings",
      zodValidate(ServiceOrderParamsSchema, "params"),
      zodValidate(CustomerCreateServiceOrderRatingSchema, "body"),
      this.serviceOrderController.createCustomerRating,
    );

    // POST /client/service-orders/:id/confirm-quote - Step 3: Customer confirms quote
    this.router.post(
      "/:id/confirm-quote",
      zodValidate(ServiceOrderParamsSchema, "params"),
      zodValidate(CustomerConfirmQuoteSchema, "body"),
      this.serviceOrderController.confirmQuote,
    );

    this.router.put(
      "/:id",
      zodValidate(ServiceOrderParamsSchema, "params"),
      zodValidate(CustomerUpdateServiceOrderSchema, "body"),
      this.serviceOrderController.update,
    );

    this.router.delete("/:id", zodValidate(ServiceOrderParamsSchema, "params"), this.serviceOrderController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
