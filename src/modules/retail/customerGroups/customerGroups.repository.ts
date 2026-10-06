import { injectable } from "inversify";
import { RetailCustomerGroups } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERGROUPS_RESOURCE } from "./customerGroups.types";

@injectable()
export class RetailCustomerGroupsRepository extends BaseRepository<RetailCustomerGroups> {
  protected entityClass = RetailCustomerGroups;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERGROUPS_RESOURCE];
  }
}
