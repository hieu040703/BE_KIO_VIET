import { Router } from "express";
import { injectable, inject } from "inversify";
import { CustomerController } from "./customer.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CustomerQuerySchema,
  CustomerParamsSchema,
} from "./customer.validator";
import { CUSTOMER_TYPES } from "./customer.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class CustomerRouter {
  private router: Router;

  constructor(@inject(CUSTOMER_TYPES.CustomerController) private customerController: CustomerController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All customer routes require authentication
    // this.router.use(authenticate);

    // GET /customers - Get all customers with filters
    this.router.get(
      "/",
      permissionMiddleware({ customer: ["read"] }),
      zodValidate(CustomerQuerySchema, "query"),
      this.customerController.getAllWithPagination,
    );

    // POST /customers - Create new customer
    this.router.post(
      "/",
      permissionMiddleware({ customer: ["create"] }),
      zodValidate(CreateCustomerSchema, "body"),
      this.customerController.create,
    );

    // GET /customers/:id - Get customer by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ customer: ["read"] }),
      zodValidate(CustomerParamsSchema, "params"),
      this.customerController.getById,
    );

    // PUT /customers/:id - Update customer
    this.router.put(
      "/:id",
      permissionMiddleware({ customer: ["update"] }),
      zodValidate(CustomerParamsSchema, "params"),
      zodValidate(UpdateCustomerSchema, "body"),
      this.customerController.update,
    );

    // DELETE /customers/:id - Delete customer
    this.router.delete(
      "/:id",
      permissionMiddleware({ customer: ["delete"] }),
      zodValidate(CustomerParamsSchema, "params"),
      this.customerController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
