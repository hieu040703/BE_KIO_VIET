import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailWebhookDeliveriesController } from "./webhookDeliveries.controller";
import { RETAIL_WEBHOOK_DELIVERIES_TYPES } from "./webhookDeliveries.types";
import { webhookDeliveriesBodySchema, webhookDeliveriesIdParamsSchema, webhookDeliveriesQuerySchema } from "./webhookDeliveries.validator";

@injectable()
export class RetailWebhookDeliveriesRouter {
  private router: Router;

  constructor(@inject(RETAIL_WEBHOOK_DELIVERIES_TYPES.Controller) private webhookDeliveriesController: RetailWebhookDeliveriesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "webhook-deliveries": ["read"] }),
      zodValidate(webhookDeliveriesQuerySchema, "query"),
      this.webhookDeliveriesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "webhook-deliveries": ["create"] }),
      zodValidate(webhookDeliveriesBodySchema, "body"),
      this.webhookDeliveriesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "webhook-deliveries": ["read"] }),
      zodValidate(webhookDeliveriesIdParamsSchema, "params"),
      this.webhookDeliveriesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "webhook-deliveries": ["update"] }),
      zodValidate(webhookDeliveriesIdParamsSchema, "params"),
      zodValidate(webhookDeliveriesBodySchema, "body"),
      this.webhookDeliveriesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "webhook-deliveries": ["delete"] }),
      zodValidate(webhookDeliveriesIdParamsSchema, "params"),
      this.webhookDeliveriesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
