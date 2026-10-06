export const RETAIL_PRICE_BOOK_ITEMS_TYPES = {
  Repository: Symbol.for("RetailPriceBookItemsRepository"),
  Service: Symbol.for("RetailPriceBookItemsService"),
  Controller: Symbol.for("RetailPriceBookItemsController"),
  Router: Symbol.for("RetailPriceBookItemsRouter"),
} as const;

export const PRICEBOOKITEMS_RESOURCE = "price-book-items" as const;
