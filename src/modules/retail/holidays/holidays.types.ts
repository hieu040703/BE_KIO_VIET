export const RETAIL_HOLIDAYS_TYPES = {
  Repository: Symbol.for("RetailHolidaysRepository"),
  Service: Symbol.for("RetailHolidaysService"),
  Controller: Symbol.for("RetailHolidaysController"),
  Router: Symbol.for("RetailHolidaysRouter"),
} as const;

export const HOLIDAYS_RESOURCE = "holidays" as const;
