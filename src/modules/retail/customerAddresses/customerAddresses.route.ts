import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerAddressesController } from "./customerAddresses.controller";
import { RETAIL_CUSTOMER_ADDRESSES_TYPES } from "./customerAddresses.types";
import { customerAddressesBodySchema, customerAddressesIdParamsSchema, customerAddressesQuerySchema } from "./customerAddresses.validator";

@injectable()
export class RetailCustomerAddressesRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_ADDRESSES_TYPES.Controller) private customerAddressesController: RetailCustomerAddressesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-addresses": ["read"] }),
      zodValidate(customerAddressesQuerySchema, "query"),
      this.customerAddressesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-addresses": ["create"] }),
      zodValidate(customerAddressesBodySchema, "body"),
      this.customerAddressesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-addresses": ["read"] }),
      zodValidate(customerAddressesIdParamsSchema, "params"),
      this.customerAddressesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-addresses": ["update"] }),
      zodValidate(customerAddressesIdParamsSchema, "params"),
      zodValidate(customerAddressesBodySchema, "body"),
      this.customerAddressesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-addresses": ["delete"] }),
      zodValidate(customerAddressesIdParamsSchema, "params"),
      this.customerAddressesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
