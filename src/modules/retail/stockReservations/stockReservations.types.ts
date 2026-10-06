export const RETAIL_STOCK_RESERVATIONS_TYPES = {
  Repository: Symbol.for("RetailStockReservationsRepository"),
  Service: Symbol.for("RetailStockReservationsService"),
  Controller: Symbol.for("RetailStockReservationsController"),
  Router: Symbol.for("RetailStockReservationsRouter"),
} as const;

export const STOCKRESERVATIONS_RESOURCE = "stock-reservations" as const;
