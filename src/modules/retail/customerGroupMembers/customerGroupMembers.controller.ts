import { injectable, inject } from "inversify";
import { RetailCustomerGroupMembersService } from "./customerGroupMembers.service";
import { RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES } from "./customerGroupMembers.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerGroupMembersController extends BaseController<RetailCustomerGroupMembersService> {
  constructor(@inject(RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES.Service) protected service: RetailCustomerGroupMembersService) {
    super(service);
  }
}
