import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailGiftCardTransactionsController } from "./giftCardTransactions.controller";
import { RetailGiftCardTransactionsRepository } from "./giftCardTransactions.repository";
import { RetailGiftCardTransactionsRouter } from "./giftCardTransactions.route";
import { RetailGiftCardTransactionsService } from "./giftCardTransactions.service";
import { RETAIL_GIFT_CARD_TRANSACTIONS_TYPES } from "./giftCardTransactions.types";

export const giftCardTransactionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailGiftCardTransactionsRepository>(RETAIL_GIFT_CARD_TRANSACTIONS_TYPES.Repository).to(RetailGiftCardTransactionsRepository);
  options.bind<RetailGiftCardTransactionsService>(RETAIL_GIFT_CARD_TRANSACTIONS_TYPES.Service).to(RetailGiftCardTransactionsService);
  options.bind<RetailGiftCardTransactionsController>(RETAIL_GIFT_CARD_TRANSACTIONS_TYPES.Controller).to(RetailGiftCardTransactionsController);
  options.bind<RetailGiftCardTransactionsRouter>(RETAIL_GIFT_CARD_TRANSACTIONS_TYPES.Router).to(RetailGiftCardTransactionsRouter);
});
