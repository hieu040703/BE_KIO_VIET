import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailShippingProvidersController } from "./shippingProviders.controller";
import { RETAIL_SHIPPING_PROVIDERS_TYPES } from "./shippingProviders.types";
import { shippingProvidersBodySchema, shippingProvidersIdParamsSchema, shippingProvidersQuerySchema } from "./shippingProviders.validator";

@injectable()
export class RetailShippingProvidersRouter {
  private router: Router;

  constructor(@inject(RETAIL_SHIPPING_PROVIDERS_TYPES.Controller) private shippingProvidersController: RetailShippingProvidersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "shipping-providers": ["read"] }),
      zodValidate(shippingProvidersQuerySchema, "query"),
      this.shippingProvidersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "shipping-providers": ["create"] }),
      zodValidate(shippingProvidersBodySchema, "body"),
      this.shippingProvidersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "shipping-providers": ["read"] }),
      zodValidate(shippingProvidersIdParamsSchema, "params"),
      this.shippingProvidersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "shipping-providers": ["update"] }),
      zodValidate(shippingProvidersIdParamsSchema, "params"),
      zodValidate(shippingProvidersBodySchema, "body"),
      this.shippingProvidersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "shipping-providers": ["delete"] }),
      zodValidate(shippingProvidersIdParamsSchema, "params"),
      this.shippingProvidersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
