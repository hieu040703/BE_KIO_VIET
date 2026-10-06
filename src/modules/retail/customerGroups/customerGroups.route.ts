import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerGroupsController } from "./customerGroups.controller";
import { RETAIL_CUSTOMER_GROUPS_TYPES } from "./customerGroups.types";
import { customerGroupsBodySchema, customerGroupsIdParamsSchema, customerGroupsQuerySchema } from "./customerGroups.validator";

@injectable()
export class RetailCustomerGroupsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_GROUPS_TYPES.Controller) private customerGroupsController: RetailCustomerGroupsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-groups": ["read"] }),
      zodValidate(customerGroupsQuerySchema, "query"),
      this.customerGroupsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-groups": ["create"] }),
      zodValidate(customerGroupsBodySchema, "body"),
      this.customerGroupsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-groups": ["read"] }),
      zodValidate(customerGroupsIdParamsSchema, "params"),
      this.customerGroupsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-groups": ["update"] }),
      zodValidate(customerGroupsIdParamsSchema, "params"),
      zodValidate(customerGroupsBodySchema, "body"),
      this.customerGroupsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-groups": ["delete"] }),
      zodValidate(customerGroupsIdParamsSchema, "params"),
      this.customerGroupsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
