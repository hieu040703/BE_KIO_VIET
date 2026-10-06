import { injectable, inject } from "inversify";
import { RetailCustomerGroupsService } from "./customerGroups.service";
import { RETAIL_CUSTOMER_GROUPS_TYPES } from "./customerGroups.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerGroupsController extends BaseController<RetailCustomerGroupsService> {
  constructor(@inject(RETAIL_CUSTOMER_GROUPS_TYPES.Service) protected service: RetailCustomerGroupsService) {
    super(service);
  }
}
