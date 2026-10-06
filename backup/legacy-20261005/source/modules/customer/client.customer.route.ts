import { Router } from "express";
import { injectable, inject } from "inversify";
import { CustomerController } from "./customer.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { authenticate } from "@/shared/middleware/auth.middleware";
import { clientMiddleware } from "@/shared/middleware/client.middleware";

import { ClientQuerySchema, UpdateClientCustomerProfileSchema } from "./customer.validator";
import { CUSTOMER_TYPES } from "./customer.types";

@injectable()
export class ClientCustomerRouter {
  private router: Router;

  constructor(@inject(CUSTOMER_TYPES.CustomerController) private customerController: CustomerController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.put(
      "/profile",
      authenticate,
      clientMiddleware,
      zodValidate(UpdateClientCustomerProfileSchema, "body"),
      this.customerController.updateProfile.bind(this.customerController),
    );

    // GET /customers - Get all customers with filters
    this.router.get(
      "/:id/attachments",
      zodValidate(ClientQuerySchema, "query"),
      this.customerController.getAttachmentInOrders.bind(this.customerController),
    );
    this.router.get(
      "/:id/debts",
      zodValidate(ClientQuerySchema, "query"),
      this.customerController.getDebts.bind(this.customerController),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
