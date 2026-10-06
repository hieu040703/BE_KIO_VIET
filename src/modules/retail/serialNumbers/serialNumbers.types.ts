export const RETAIL_SERIAL_NUMBERS_TYPES = {
  Repository: Symbol.for("RetailSerialNumbersRepository"),
  Service: Symbol.for("RetailSerialNumbersService"),
  Controller: Symbol.for("RetailSerialNumbersController"),
  Router: Symbol.for("RetailSerialNumbersRouter"),
} as const;

export const SERIALNUMBERS_RESOURCE = "serial-numbers" as const;
