import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerActivities } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerActivitiesRepository } from "./customerActivities.repository";
import { RETAIL_CUSTOMER_ACTIVITIES_TYPES } from "./customerActivities.types";

@injectable()
export class RetailCustomerActivitiesService extends BaseService<RetailCustomerActivities> {
  constructor(@inject(RETAIL_CUSTOMER_ACTIVITIES_TYPES.Repository) repository: RetailCustomerActivitiesRepository) {
    super(repository);
  }
}
