import { injectable } from "inversify";
import { RetailOrder } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ORDERS_RESOURCE } from "./orders.types";

@injectable()
export class RetailOrdersRepository extends BaseRepository<RetailOrder> {
  protected entityClass = RetailOrder;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ORDERS_RESOURCE];
  }
}
