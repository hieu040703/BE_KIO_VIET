import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerGroupMembersController } from "./customerGroupMembers.controller";
import { RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES } from "./customerGroupMembers.types";
import { customerGroupMembersBodySchema, customerGroupMembersIdParamsSchema, customerGroupMembersQuerySchema } from "./customerGroupMembers.validator";

@injectable()
export class RetailCustomerGroupMembersRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES.Controller) private customerGroupMembersController: RetailCustomerGroupMembersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-group-members": ["read"] }),
      zodValidate(customerGroupMembersQuerySchema, "query"),
      this.customerGroupMembersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-group-members": ["create"] }),
      zodValidate(customerGroupMembersBodySchema, "body"),
      this.customerGroupMembersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-group-members": ["read"] }),
      zodValidate(customerGroupMembersIdParamsSchema, "params"),
      this.customerGroupMembersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-group-members": ["update"] }),
      zodValidate(customerGroupMembersIdParamsSchema, "params"),
      zodValidate(customerGroupMembersBodySchema, "body"),
      this.customerGroupMembersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-group-members": ["delete"] }),
      zodValidate(customerGroupMembersIdParamsSchema, "params"),
      this.customerGroupMembersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
