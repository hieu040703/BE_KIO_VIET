import { injectable } from "inversify";
import { RetailReconciliationItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { RECONCILIATIONITEMS_RESOURCE } from "./reconciliationItems.types";

@injectable()
export class RetailReconciliationItemsRepository extends BaseRepository<RetailReconciliationItems> {
  protected entityClass = RetailReconciliationItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[RECONCILIATIONITEMS_RESOURCE];
  }
}
