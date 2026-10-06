import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPaymentsController } from "./payments.controller";
import { RETAIL_PAYMENTS_TYPES } from "./payments.types";
import { paymentsBodySchema, paymentsIdParamsSchema, paymentsQuerySchema } from "./payments.validator";

@injectable()
export class RetailPaymentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PAYMENTS_TYPES.Controller) private paymentsController: RetailPaymentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "payments": ["read"] }),
      zodValidate(paymentsQuerySchema, "query"),
      this.paymentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "payments": ["create"] }),
      zodValidate(paymentsBodySchema, "body"),
      this.paymentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "payments": ["read"] }),
      zodValidate(paymentsIdParamsSchema, "params"),
      this.paymentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "payments": ["update"] }),
      zodValidate(paymentsIdParamsSchema, "params"),
      zodValidate(paymentsBodySchema, "body"),
      this.paymentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "payments": ["delete"] }),
      zodValidate(paymentsIdParamsSchema, "params"),
      this.paymentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
