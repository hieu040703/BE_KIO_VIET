import { injectable } from "inversify";
import { RetailGiftCards } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { GIFTCARDS_RESOURCE } from "./giftCards.types";

@injectable()
export class RetailGiftCardsRepository extends BaseRepository<RetailGiftCards> {
  protected entityClass = RetailGiftCards;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[GIFTCARDS_RESOURCE];
  }
}
