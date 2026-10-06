import { Router } from "express";
import { injectable, inject } from "inversify";
import { ServiceOrderRatingController } from "./serviceOrderRating.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateServiceOrderRatingSchema,
  UpdateServiceOrderRatingSchema,
  ServiceOrderRatingQuerySchema,
  ServiceOrderRatingParamsSchema,
} from "./serviceOrderRating.validator";
import { SERVICE_ORDER_RATING_TYPES } from "./serviceOrderRating.types";

@injectable()
export class ServiceOrderRatingRouter {
  private router: Router;

  constructor(
    @inject(SERVICE_ORDER_RATING_TYPES.ServiceOrderRatingController)
    private serviceOrderRatingController: ServiceOrderRatingController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All serviceOrderRating routes require authentication
    // this.router.use(authenticate);

    // GET /serviceOrderRatings - Get all serviceOrderRatings with filters
    this.router.get(
      "/",
      zodValidate(ServiceOrderRatingQuerySchema, "query"),
      this.serviceOrderRatingController.getAllWithPagination,
    );

    // POST /serviceOrderRatings - Create new serviceOrderRating
    this.router.post(
      "/",
      zodValidate(CreateServiceOrderRatingSchema, "body"),
      this.serviceOrderRatingController.create,
    );

    // GET /serviceOrderRatings/:id - Get serviceOrderRating by ID
    this.router.get(
      "/:id",
      zodValidate(ServiceOrderRatingParamsSchema, "params"),
      this.serviceOrderRatingController.getById,
    );

    // PUT /serviceOrderRatings/:id - Update serviceOrderRating
    this.router.put(
      "/:id",
      zodValidate(ServiceOrderRatingParamsSchema, "params"),
      zodValidate(UpdateServiceOrderRatingSchema, "body"),
      this.serviceOrderRatingController.update,
    );

    // DELETE /serviceOrderRatings/:id - Delete serviceOrderRating
    this.router.delete(
      "/:id",
      zodValidate(ServiceOrderRatingParamsSchema, "params"),
      this.serviceOrderRatingController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
