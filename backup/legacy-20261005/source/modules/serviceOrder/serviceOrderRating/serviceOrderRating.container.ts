import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { ServiceOrderRatingController } from "./serviceOrderRating.controller";
import { ServiceOrderRatingService } from "./serviceOrderRating.service";
import { ServiceOrderRatingRepository } from "./serviceOrderRating.repository";
import { ServiceOrderRatingRouter } from "./serviceOrderRating.route";
import { SERVICE_ORDER_RATING_TYPES } from "./serviceOrderRating.types";

const serviceOrderRatingModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options
    .bind<ServiceOrderRatingService>(SERVICE_ORDER_RATING_TYPES.ServiceOrderRatingService)
    .to(ServiceOrderRatingService);
  options
    .bind<ServiceOrderRatingController>(SERVICE_ORDER_RATING_TYPES.ServiceOrderRatingController)
    .to(ServiceOrderRatingController);
  options
    .bind<ServiceOrderRatingRepository>(SERVICE_ORDER_RATING_TYPES.ServiceOrderRatingRepository)
    .to(ServiceOrderRatingRepository);
  options
    .bind<ServiceOrderRatingRouter>(SERVICE_ORDER_RATING_TYPES.ServiceOrderRatingRouter)
    .to(ServiceOrderRatingRouter);
});

export { serviceOrderRatingModule };
