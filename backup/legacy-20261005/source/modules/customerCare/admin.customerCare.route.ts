import { Router } from "express";
import { inject, injectable } from "inversify";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { AdminCustomerCareController } from "./admin.customerCare.controller";
import { CUSTOMER_CARE_TYPES } from "./customerCare.types";
import {
  CreateCustomerCareSchema,
  CustomerCareParamsSchema,
  CustomerCareQuerySchema,
  UpdateCustomerCareSchema,
} from "./customerCare.validator";

@injectable()
export class AdminCustomerCareRouter {
  private router: Router;

  constructor(
    @inject(CUSTOMER_CARE_TYPES.AdminCustomerCareController)
    private customerCareController: AdminCustomerCareController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ customerService: ["read"] }),
      zodValidate(CustomerCareQuerySchema, "query"),
      this.customerCareController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ customerService: ["create"] }),
      zodValidate(CreateCustomerCareSchema, "body"),
      this.customerCareController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ customerService: ["read"] }),
      zodValidate(CustomerCareParamsSchema, "params"),
      this.customerCareController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ customerService: ["update"] }),
      zodValidate(CustomerCareParamsSchema, "params"),
      zodValidate(UpdateCustomerCareSchema, "body"),
      this.customerCareController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ customerService: ["delete"] }),
      zodValidate(CustomerCareParamsSchema, "params"),
      this.customerCareController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
