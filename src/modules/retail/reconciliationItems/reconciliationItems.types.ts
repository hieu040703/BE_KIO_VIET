export const RETAIL_RECONCILIATION_ITEMS_TYPES = {
  Repository: Symbol.for("RetailReconciliationItemsRepository"),
  Service: Symbol.for("RetailReconciliationItemsService"),
  Controller: Symbol.for("RetailReconciliationItemsController"),
  Router: Symbol.for("RetailReconciliationItemsRouter"),
} as const;

export const RECONCILIATIONITEMS_RESOURCE = "reconciliation-items" as const;
