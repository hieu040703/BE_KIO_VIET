import { injectable } from "inversify";
import { RetailCarts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CARTS_RESOURCE } from "./carts.types";

@injectable()
export class RetailCartsRepository extends BaseRepository<RetailCarts> {
  protected entityClass = RetailCarts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CARTS_RESOURCE];
  }
}
