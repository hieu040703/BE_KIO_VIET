import { injectable, inject } from "inversify";
import { ServiceOrderRatingService } from "./serviceOrderRating.service";
import { SERVICE_ORDER_RATING_TYPES } from "./serviceOrderRating.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class ServiceOrderRatingController extends BaseController<ServiceOrderRatingService> {
  constructor(
    @inject(SERVICE_ORDER_RATING_TYPES.ServiceOrderRatingService) protected service: ServiceOrderRatingService,
  ) {
    super(service);
  }
}
