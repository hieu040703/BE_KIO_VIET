import { Router } from "express";
import { injectable, inject } from "inversify";
import { ServicePriceController } from "./servicePrice.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateServicePriceSchema,
  UpdateServicePriceSchema,
  ServicePriceQuerySchema,
  ServicePriceParamsSchema,
} from "./servicePrice.validator";
import { SERVICE_PRICE_TYPES } from "./servicePrice.types";

@injectable()
export class ServicePriceRouter {
  private router: Router;

  constructor(
    @inject(SERVICE_PRICE_TYPES.ServicePriceController) private servicePriceController: ServicePriceController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /servicePrices - Get all servicePrices with filters
    this.router.get(
      "/",
      zodValidate(ServicePriceQuerySchema, "query"),
      this.servicePriceController.getAllWithPagination,
    );

    // POST /servicePrices - Create new servicePrice
    this.router.post("/", zodValidate(CreateServicePriceSchema, "body"), this.servicePriceController.create);

    // GET /servicePrices/:id - Get servicePrice by ID
    this.router.get("/:id", zodValidate(ServicePriceParamsSchema, "params"), this.servicePriceController.getById);

    // PUT /servicePrices/:id - Update servicePrice
    this.router.put(
      "/:id",
      zodValidate(ServicePriceParamsSchema, "params"),
      zodValidate(UpdateServicePriceSchema, "body"),
      this.servicePriceController.update,
    );

    // DELETE /servicePrices/:id - Delete servicePrice
    this.router.delete("/:id", zodValidate(ServicePriceParamsSchema, "params"), this.servicePriceController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
