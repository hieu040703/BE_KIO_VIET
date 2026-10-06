export const RETAIL_PRODUCT_TAX_RATES_TYPES = {
  Repository: Symbol.for("RetailProductTaxRatesRepository"),
  Service: Symbol.for("RetailProductTaxRatesService"),
  Controller: Symbol.for("RetailProductTaxRatesController"),
  Router: Symbol.for("RetailProductTaxRatesRouter"),
} as const;

export const PRODUCTTAXRATES_RESOURCE = "product-tax-rates" as const;
