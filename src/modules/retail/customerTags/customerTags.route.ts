import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerTagsController } from "./customerTags.controller";
import { RETAIL_CUSTOMER_TAGS_TYPES } from "./customerTags.types";
import { customerTagsBodySchema, customerTagsIdParamsSchema, customerTagsQuerySchema } from "./customerTags.validator";

@injectable()
export class RetailCustomerTagsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_TAGS_TYPES.Controller) private customerTagsController: RetailCustomerTagsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-tags": ["read"] }),
      zodValidate(customerTagsQuerySchema, "query"),
      this.customerTagsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-tags": ["create"] }),
      zodValidate(customerTagsBodySchema, "body"),
      this.customerTagsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-tags": ["read"] }),
      zodValidate(customerTagsIdParamsSchema, "params"),
      this.customerTagsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-tags": ["update"] }),
      zodValidate(customerTagsIdParamsSchema, "params"),
      zodValidate(customerTagsBodySchema, "body"),
      this.customerTagsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-tags": ["delete"] }),
      zodValidate(customerTagsIdParamsSchema, "params"),
      this.customerTagsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
