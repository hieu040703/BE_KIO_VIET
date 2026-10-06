export const RETAIL_GIFT_CARD_TRANSACTIONS_TYPES = {
  Repository: Symbol.for("RetailGiftCardTransactionsRepository"),
  Service: Symbol.for("RetailGiftCardTransactionsService"),
  Controller: Symbol.for("RetailGiftCardTransactionsController"),
  Router: Symbol.for("RetailGiftCardTransactionsRouter"),
} as const;

export const GIFTCARDTRANSACTIONS_RESOURCE = "gift-card-transactions" as const;
