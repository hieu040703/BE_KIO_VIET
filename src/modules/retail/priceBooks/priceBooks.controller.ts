import { injectable, inject } from "inversify";
import { RetailPriceBooksService } from "./priceBooks.service";
import { RETAIL_PRICE_BOOKS_TYPES } from "./priceBooks.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPriceBooksController extends BaseController<RetailPriceBooksService> {
  constructor(@inject(RETAIL_PRICE_BOOKS_TYPES.Service) protected service: RetailPriceBooksService) {
    super(service);
  }
}
