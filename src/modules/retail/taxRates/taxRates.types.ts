export const RETAIL_TAX_RATES_TYPES = {
  Repository: Symbol.for("RetailTaxRatesRepository"),
  Service: Symbol.for("RetailTaxRatesService"),
  Controller: Symbol.for("RetailTaxRatesController"),
  Router: Symbol.for("RetailTaxRatesRouter"),
} as const;

export const TAXRATES_RESOURCE = "tax-rates" as const;
