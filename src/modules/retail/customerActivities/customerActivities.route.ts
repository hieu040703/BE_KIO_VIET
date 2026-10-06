import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerActivitiesController } from "./customerActivities.controller";
import { RETAIL_CUSTOMER_ACTIVITIES_TYPES } from "./customerActivities.types";
import { customerActivitiesBodySchema, customerActivitiesIdParamsSchema, customerActivitiesQuerySchema } from "./customerActivities.validator";

@injectable()
export class RetailCustomerActivitiesRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_ACTIVITIES_TYPES.Controller) private customerActivitiesController: RetailCustomerActivitiesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-activities": ["read"] }),
      zodValidate(customerActivitiesQuerySchema, "query"),
      this.customerActivitiesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-activities": ["create"] }),
      zodValidate(customerActivitiesBodySchema, "body"),
      this.customerActivitiesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-activities": ["read"] }),
      zodValidate(customerActivitiesIdParamsSchema, "params"),
      this.customerActivitiesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-activities": ["update"] }),
      zodValidate(customerActivitiesIdParamsSchema, "params"),
      zodValidate(customerActivitiesBodySchema, "body"),
      this.customerActivitiesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-activities": ["delete"] }),
      zodValidate(customerActivitiesIdParamsSchema, "params"),
      this.customerActivitiesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
