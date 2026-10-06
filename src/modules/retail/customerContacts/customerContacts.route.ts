import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerContactsController } from "./customerContacts.controller";
import { RETAIL_CUSTOMER_CONTACTS_TYPES } from "./customerContacts.types";
import { customerContactsBodySchema, customerContactsIdParamsSchema, customerContactsQuerySchema } from "./customerContacts.validator";

@injectable()
export class RetailCustomerContactsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_CONTACTS_TYPES.Controller) private customerContactsController: RetailCustomerContactsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-contacts": ["read"] }),
      zodValidate(customerContactsQuerySchema, "query"),
      this.customerContactsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-contacts": ["create"] }),
      zodValidate(customerContactsBodySchema, "body"),
      this.customerContactsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-contacts": ["read"] }),
      zodValidate(customerContactsIdParamsSchema, "params"),
      this.customerContactsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-contacts": ["update"] }),
      zodValidate(customerContactsIdParamsSchema, "params"),
      zodValidate(customerContactsBodySchema, "body"),
      this.customerContactsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-contacts": ["delete"] }),
      zodValidate(customerContactsIdParamsSchema, "params"),
      this.customerContactsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
