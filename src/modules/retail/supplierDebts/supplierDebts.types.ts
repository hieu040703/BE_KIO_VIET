export const RETAIL_SUPPLIER_DEBTS_TYPES = {
  Repository: Symbol.for("RetailSupplierDebtsRepository"),
  Service: Symbol.for("RetailSupplierDebtsService"),
  Controller: Symbol.for("RetailSupplierDebtsController"),
  Router: Symbol.for("RetailSupplierDebtsRouter"),
} as const;

export const SUPPLIERDEBTS_RESOURCE = "supplier-debts" as const;
