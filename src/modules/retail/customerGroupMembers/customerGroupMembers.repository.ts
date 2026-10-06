import { injectable } from "inversify";
import { RetailCustomerGroupMembers } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERGROUPMEMBERS_RESOURCE } from "./customerGroupMembers.types";

@injectable()
export class RetailCustomerGroupMembersRepository extends BaseRepository<RetailCustomerGroupMembers> {
  protected entityClass = RetailCustomerGroupMembers;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERGROUPMEMBERS_RESOURCE];
  }
}
