import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerGroups } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerGroupsRepository } from "./customerGroups.repository";
import { RETAIL_CUSTOMER_GROUPS_TYPES } from "./customerGroups.types";

@injectable()
export class RetailCustomerGroupsService extends BaseService<RetailCustomerGroups> {
  constructor(@inject(RETAIL_CUSTOMER_GROUPS_TYPES.Repository) repository: RetailCustomerGroupsRepository) {
    super(repository);
  }
}
