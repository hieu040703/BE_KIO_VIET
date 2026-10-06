import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerTagMapsController } from "./customerTagMaps.controller";
import { RETAIL_CUSTOMER_TAG_MAPS_TYPES } from "./customerTagMaps.types";
import { customerTagMapsBodySchema, customerTagMapsIdParamsSchema, customerTagMapsQuerySchema } from "./customerTagMaps.validator";

@injectable()
export class RetailCustomerTagMapsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_TAG_MAPS_TYPES.Controller) private customerTagMapsController: RetailCustomerTagMapsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-tag-maps": ["read"] }),
      zodValidate(customerTagMapsQuerySchema, "query"),
      this.customerTagMapsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-tag-maps": ["create"] }),
      zodValidate(customerTagMapsBodySchema, "body"),
      this.customerTagMapsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-tag-maps": ["read"] }),
      zodValidate(customerTagMapsIdParamsSchema, "params"),
      this.customerTagMapsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-tag-maps": ["update"] }),
      zodValidate(customerTagMapsIdParamsSchema, "params"),
      zodValidate(customerTagMapsBodySchema, "body"),
      this.customerTagMapsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-tag-maps": ["delete"] }),
      zodValidate(customerTagMapsIdParamsSchema, "params"),
      this.customerTagMapsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
