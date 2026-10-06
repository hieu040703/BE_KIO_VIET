import { injectable, inject } from "inversify";
import { RetailPriceBookItemsService } from "./priceBookItems.service";
import { RETAIL_PRICE_BOOK_ITEMS_TYPES } from "./priceBookItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPriceBookItemsController extends BaseController<RetailPriceBookItemsService> {
  constructor(@inject(RETAIL_PRICE_BOOK_ITEMS_TYPES.Service) protected service: RetailPriceBookItemsService) {
    super(service);
  }
}
