import { injectable, inject } from "inversify";
import { RetailCustomerActivitiesService } from "./customerActivities.service";
import { RETAIL_CUSTOMER_ACTIVITIES_TYPES } from "./customerActivities.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerActivitiesController extends BaseController<RetailCustomerActivitiesService> {
  constructor(@inject(RETAIL_CUSTOMER_ACTIVITIES_TYPES.Service) protected service: RetailCustomerActivitiesService) {
    super(service);
  }
}
