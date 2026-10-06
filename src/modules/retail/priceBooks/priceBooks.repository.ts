import { injectable } from "inversify";
import { RetailPriceBooks } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PRICEBOOKS_RESOURCE } from "./priceBooks.types";

@injectable()
export class RetailPriceBooksRepository extends BaseRepository<RetailPriceBooks> {
  protected entityClass = RetailPriceBooks;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PRICEBOOKS_RESOURCE];
  }
}
