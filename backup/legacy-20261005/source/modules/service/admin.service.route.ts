import { Router } from "express";
import { injectable, inject } from "inversify";
import { AdminServiceController } from "./admin.service.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateServiceSchema, UpdateServiceSchema, ServiceQuerySchema, ServiceParamsSchema } from "./service.validator";
import { SERVICE_TYPES } from "./service.types";
import { SERVICE_PRICE_TYPES } from "./servicePrice/servicePrice.types";
import { ServicePriceRouter } from "./servicePrice/servicePrice.route";

@injectable()
export class AdminServiceRouter {
  private router: Router;

  constructor(
    @inject(SERVICE_TYPES.AdminServiceController) private serviceController: AdminServiceController,
    @inject(SERVICE_PRICE_TYPES.ServicePriceRouter) private servicePriceRouter: ServicePriceRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use("/service-prices", this.servicePriceRouter.getRouter());

    // GET /services - Get all services with filters
    this.router.get("/", zodValidate(ServiceQuerySchema, "query"), this.serviceController.getAllWithPagination);

    // POST /services - Create new service
    this.router.post("/", zodValidate(CreateServiceSchema, "body"), this.serviceController.create);

    // GET /services/:id - Get service by ID
    this.router.get("/:id", zodValidate(ServiceParamsSchema, "params"), this.serviceController.getById);

    // PUT /services/:id - Update service
    this.router.put(
      "/:id",
      zodValidate(ServiceParamsSchema, "params"),
      zodValidate(UpdateServiceSchema, "body"),
      this.serviceController.update,
    );

    // DELETE /services/:id - Delete service
    this.router.delete("/:id", zodValidate(ServiceParamsSchema, "params"), this.serviceController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
