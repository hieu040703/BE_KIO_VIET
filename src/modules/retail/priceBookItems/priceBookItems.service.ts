import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPriceBookItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailPriceBookItemsRepository } from "./priceBookItems.repository";
import { RETAIL_PRICE_BOOK_ITEMS_TYPES } from "./priceBookItems.types";

@injectable()
export class RetailPriceBookItemsService extends BaseService<RetailPriceBookItems> {
  constructor(@inject(RETAIL_PRICE_BOOK_ITEMS_TYPES.Repository) repository: RetailPriceBookItemsRepository) {
    super(repository);
  }
}
