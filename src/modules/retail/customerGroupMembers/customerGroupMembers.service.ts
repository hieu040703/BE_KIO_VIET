import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerGroupMembers } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerGroupMembersRepository } from "./customerGroupMembers.repository";
import { RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES } from "./customerGroupMembers.types";

@injectable()
export class RetailCustomerGroupMembersService extends BaseService<RetailCustomerGroupMembers> {
  constructor(@inject(RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES.Repository) repository: RetailCustomerGroupMembersRepository) {
    super(repository);
  }
}
