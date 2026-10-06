import { injectable, inject } from "inversify";
import { RetailGiftCardsService } from "./giftCards.service";
import { RETAIL_GIFT_CARDS_TYPES } from "./giftCards.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailGiftCardsController extends BaseController<RetailGiftCardsService> {
  constructor(@inject(RETAIL_GIFT_CARDS_TYPES.Service) protected service: RetailGiftCardsService) {
    super(service);
  }
}
