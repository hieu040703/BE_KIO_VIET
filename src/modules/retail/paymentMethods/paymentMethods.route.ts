import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPaymentMethodsController } from "./paymentMethods.controller";
import { RETAIL_PAYMENT_METHODS_TYPES } from "./paymentMethods.types";
import { paymentMethodsBodySchema, paymentMethodsIdParamsSchema, paymentMethodsQuerySchema } from "./paymentMethods.validator";

@injectable()
export class RetailPaymentMethodsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PAYMENT_METHODS_TYPES.Controller) private paymentMethodsController: RetailPaymentMethodsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "payment-methods": ["read"] }),
      zodValidate(paymentMethodsQuerySchema, "query"),
      this.paymentMethodsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "payment-methods": ["create"] }),
      zodValidate(paymentMethodsBodySchema, "body"),
      this.paymentMethodsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "payment-methods": ["read"] }),
      zodValidate(paymentMethodsIdParamsSchema, "params"),
      this.paymentMethodsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "payment-methods": ["update"] }),
      zodValidate(paymentMethodsIdParamsSchema, "params"),
      zodValidate(paymentMethodsBodySchema, "body"),
      this.paymentMethodsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "payment-methods": ["delete"] }),
      zodValidate(paymentMethodsIdParamsSchema, "params"),
      this.paymentMethodsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
