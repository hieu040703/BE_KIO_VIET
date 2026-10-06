export const RETAIL_ORDER_STATUS_HISTORY_TYPES = {
  Repository: Symbol.for("RetailOrderStatusHistoryRepository"),
  Service: Symbol.for("RetailOrderStatusHistoryService"),
  Controller: Symbol.for("RetailOrderStatusHistoryController"),
  Router: Symbol.for("RetailOrderStatusHistoryRouter"),
} as const;

export const ORDERSTATUSHISTORY_RESOURCE = "order-status-history" as const;
