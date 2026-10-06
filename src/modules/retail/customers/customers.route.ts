import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomersController } from "./customers.controller";
import { RETAIL_CUSTOMERS_TYPES } from "./customers.types";
import { customersBodySchema, customersIdParamsSchema, customersQuerySchema } from "./customers.validator";

@injectable()
export class RetailCustomersRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMERS_TYPES.Controller) private customersController: RetailCustomersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customers": ["read"] }),
      zodValidate(customersQuerySchema, "query"),
      this.customersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customers": ["create"] }),
      zodValidate(customersBodySchema, "body"),
      this.customersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customers": ["read"] }),
      zodValidate(customersIdParamsSchema, "params"),
      this.customersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customers": ["update"] }),
      zodValidate(customersIdParamsSchema, "params"),
      zodValidate(customersBodySchema, "body"),
      this.customersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customers": ["delete"] }),
      zodValidate(customersIdParamsSchema, "params"),
      this.customersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
