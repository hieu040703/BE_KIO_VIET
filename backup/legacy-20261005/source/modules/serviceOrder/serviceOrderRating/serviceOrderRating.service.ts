import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { ServiceOrderRatingRepository } from "./serviceOrderRating.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { SERVICE_ORDER_RATING_TYPES } from "./serviceOrderRating.types";

import { ServiceOrderRatingRelations, ServiceOrderRatingSelectFull } from "./serviceOrderRating.select";
import { ServiceOrderRating } from "@/database/models/OrderRating";
import { COMMON_TYPES } from "@/modules/common/common.types";

@injectable()
export class ServiceOrderRatingService extends BaseService<ServiceOrderRating> {
  protected relations = ServiceOrderRatingRelations;
  protected selectedFields = ServiceOrderRatingSelectFull;
  constructor(
    @inject(SERVICE_ORDER_RATING_TYPES.ServiceOrderRatingRepository)
    private serviceOrderRatingRepository: ServiceOrderRatingRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(serviceOrderRatingRepository);
  }
}
