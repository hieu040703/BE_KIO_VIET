import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailGiftCardsController } from "./giftCards.controller";
import { RetailGiftCardsRepository } from "./giftCards.repository";
import { RetailGiftCardsRouter } from "./giftCards.route";
import { RetailGiftCardsService } from "./giftCards.service";
import { RETAIL_GIFT_CARDS_TYPES } from "./giftCards.types";

export const giftCardsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailGiftCardsRepository>(RETAIL_GIFT_CARDS_TYPES.Repository).to(RetailGiftCardsRepository);
  options.bind<RetailGiftCardsService>(RETAIL_GIFT_CARDS_TYPES.Service).to(RetailGiftCardsService);
  options.bind<RetailGiftCardsController>(RETAIL_GIFT_CARDS_TYPES.Controller).to(RetailGiftCardsController);
  options.bind<RetailGiftCardsRouter>(RETAIL_GIFT_CARDS_TYPES.Router).to(RetailGiftCardsRouter);
});
