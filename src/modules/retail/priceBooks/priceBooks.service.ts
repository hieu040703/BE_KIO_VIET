import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPriceBooks } from "@/database/models/retail/RetailGenericEntities";
import { RetailPriceBooksRepository } from "./priceBooks.repository";
import { RETAIL_PRICE_BOOKS_TYPES } from "./priceBooks.types";

@injectable()
export class RetailPriceBooksService extends BaseService<RetailPriceBooks> {
  constructor(@inject(RETAIL_PRICE_BOOKS_TYPES.Repository) repository: RetailPriceBooksRepository) {
    super(repository);
  }
}
