import { injectable } from "inversify";
import { RetailOrderItem } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ORDERITEMS_RESOURCE } from "./orderItems.types";

@injectable()
export class RetailOrderItemsRepository extends BaseRepository<RetailOrderItem> {
  protected entityClass = RetailOrderItem;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ORDERITEMS_RESOURCE];
  }
}
