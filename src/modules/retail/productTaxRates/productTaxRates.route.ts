import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailProductTaxRatesController } from "./productTaxRates.controller";
import { RETAIL_PRODUCT_TAX_RATES_TYPES } from "./productTaxRates.types";
import { productTaxRatesBodySchema, productTaxRatesIdParamsSchema, productTaxRatesQuerySchema } from "./productTaxRates.validator";

@injectable()
export class RetailProductTaxRatesRouter {
  private router: Router;

  constructor(@inject(RETAIL_PRODUCT_TAX_RATES_TYPES.Controller) private productTaxRatesController: RetailProductTaxRatesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "product-tax-rates": ["read"] }),
      zodValidate(productTaxRatesQuerySchema, "query"),
      this.productTaxRatesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "product-tax-rates": ["create"] }),
      zodValidate(productTaxRatesBodySchema, "body"),
      this.productTaxRatesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "product-tax-rates": ["read"] }),
      zodValidate(productTaxRatesIdParamsSchema, "params"),
      this.productTaxRatesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "product-tax-rates": ["update"] }),
      zodValidate(productTaxRatesIdParamsSchema, "params"),
      zodValidate(productTaxRatesBodySchema, "body"),
      this.productTaxRatesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "product-tax-rates": ["delete"] }),
      zodValidate(productTaxRatesIdParamsSchema, "params"),
      this.productTaxRatesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
