import { injectable } from "inversify";
import { RetailShippingOrders } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SHIPPINGORDERS_RESOURCE } from "./shippingOrders.types";

@injectable()
export class RetailShippingOrdersRepository extends BaseRepository<RetailShippingOrders> {
  protected entityClass = RetailShippingOrders;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SHIPPINGORDERS_RESOURCE];
  }
}
