export const RETAIL_GIFT_CARDS_TYPES = {
  Repository: Symbol.for("RetailGiftCardsRepository"),
  Service: Symbol.for("RetailGiftCardsService"),
  Controller: Symbol.for("RetailGiftCardsController"),
  Router: Symbol.for("RetailGiftCardsRouter"),
} as const;

export const GIFTCARDS_RESOURCE = "gift-cards" as const;
