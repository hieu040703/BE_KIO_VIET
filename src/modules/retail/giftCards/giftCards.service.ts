import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailGiftCards } from "@/database/models/retail/RetailGenericEntities";
import { RetailGiftCardsRepository } from "./giftCards.repository";
import { RETAIL_GIFT_CARDS_TYPES } from "./giftCards.types";

@injectable()
export class RetailGiftCardsService extends BaseService<RetailGiftCards> {
  constructor(@inject(RETAIL_GIFT_CARDS_TYPES.Repository) repository: RetailGiftCardsRepository) {
    super(repository);
  }
}
