export const RETAIL_PRICE_BOOKS_TYPES = {
  Repository: Symbol.for("RetailPriceBooksRepository"),
  Service: Symbol.for("RetailPriceBooksService"),
  Controller: Symbol.for("RetailPriceBooksController"),
  Router: Symbol.for("RetailPriceBooksRouter"),
} as const;

export const PRICEBOOKS_RESOURCE = "price-books" as const;
