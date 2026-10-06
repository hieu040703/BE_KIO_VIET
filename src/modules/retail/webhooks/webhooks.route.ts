import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailWebhooksController } from "./webhooks.controller";
import { RETAIL_WEBHOOKS_TYPES } from "./webhooks.types";
import { webhooksBodySchema, webhooksIdParamsSchema, webhooksQuerySchema } from "./webhooks.validator";

@injectable()
export class RetailWebhooksRouter {
  private router: Router;

  constructor(@inject(RETAIL_WEBHOOKS_TYPES.Controller) private webhooksController: RetailWebhooksController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "webhooks": ["read"] }),
      zodValidate(webhooksQuerySchema, "query"),
      this.webhooksController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "webhooks": ["create"] }),
      zodValidate(webhooksBodySchema, "body"),
      this.webhooksController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "webhooks": ["read"] }),
      zodValidate(webhooksIdParamsSchema, "params"),
      this.webhooksController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "webhooks": ["update"] }),
      zodValidate(webhooksIdParamsSchema, "params"),
      zodValidate(webhooksBodySchema, "body"),
      this.webhooksController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "webhooks": ["delete"] }),
      zodValidate(webhooksIdParamsSchema, "params"),
      this.webhooksController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
