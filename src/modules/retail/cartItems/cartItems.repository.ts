import { injectable } from "inversify";
import { RetailCartItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CARTITEMS_RESOURCE } from "./cartItems.types";

@injectable()
export class RetailCartItemsRepository extends BaseRepository<RetailCartItems> {
  protected entityClass = RetailCartItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CARTITEMS_RESOURCE];
  }
}
