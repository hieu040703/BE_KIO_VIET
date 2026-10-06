import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailTaxRatesController } from "./taxRates.controller";
import { RETAIL_TAX_RATES_TYPES } from "./taxRates.types";
import { taxRatesBodySchema, taxRatesIdParamsSchema, taxRatesQuerySchema } from "./taxRates.validator";

@injectable()
export class RetailTaxRatesRouter {
  private router: Router;

  constructor(@inject(RETAIL_TAX_RATES_TYPES.Controller) private taxRatesController: RetailTaxRatesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "tax-rates": ["read"] }),
      zodValidate(taxRatesQuerySchema, "query"),
      this.taxRatesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "tax-rates": ["create"] }),
      zodValidate(taxRatesBodySchema, "body"),
      this.taxRatesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "tax-rates": ["read"] }),
      zodValidate(taxRatesIdParamsSchema, "params"),
      this.taxRatesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "tax-rates": ["update"] }),
      zodValidate(taxRatesIdParamsSchema, "params"),
      zodValidate(taxRatesBodySchema, "body"),
      this.taxRatesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "tax-rates": ["delete"] }),
      zodValidate(taxRatesIdParamsSchema, "params"),
      this.taxRatesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
