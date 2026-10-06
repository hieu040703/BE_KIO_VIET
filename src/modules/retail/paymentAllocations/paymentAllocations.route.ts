import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPaymentAllocationsController } from "./paymentAllocations.controller";
import { RETAIL_PAYMENT_ALLOCATIONS_TYPES } from "./paymentAllocations.types";
import { paymentAllocationsBodySchema, paymentAllocationsIdParamsSchema, paymentAllocationsQuerySchema } from "./paymentAllocations.validator";

@injectable()
export class RetailPaymentAllocationsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PAYMENT_ALLOCATIONS_TYPES.Controller) private paymentAllocationsController: RetailPaymentAllocationsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "payment-allocations": ["read"] }),
      zodValidate(paymentAllocationsQuerySchema, "query"),
      this.paymentAllocationsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "payment-allocations": ["create"] }),
      zodValidate(paymentAllocationsBodySchema, "body"),
      this.paymentAllocationsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "payment-allocations": ["read"] }),
      zodValidate(paymentAllocationsIdParamsSchema, "params"),
      this.paymentAllocationsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "payment-allocations": ["update"] }),
      zodValidate(paymentAllocationsIdParamsSchema, "params"),
      zodValidate(paymentAllocationsBodySchema, "body"),
      this.paymentAllocationsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "payment-allocations": ["delete"] }),
      zodValidate(paymentAllocationsIdParamsSchema, "params"),
      this.paymentAllocationsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
