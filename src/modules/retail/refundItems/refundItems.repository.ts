import { injectable } from "inversify";
import { RetailRefundItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { REFUNDITEMS_RESOURCE } from "./refundItems.types";

@injectable()
export class RetailRefundItemsRepository extends BaseRepository<RetailRefundItems> {
  protected entityClass = RetailRefundItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[REFUNDITEMS_RESOURCE];
  }
}
