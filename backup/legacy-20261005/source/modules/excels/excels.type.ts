export const EXCELS_TYPES = {
  ExcelService: Symbol.for("ExcelService"),
  ExcelController: Symbol.for("ExcelController"),
  ExcelRouter: Symbol.for("ExcelRouter"),
  ImportProfileHandler: Symbol.for("ImportProfileHandler"),
  TemplateProfileHandler: Symbol.for("TemplateProfileHandler"),
  ImportOrderHandler: Symbol.for("ImportOrderHandler"),
  TemplateOrderHandler: Symbol.for("TemplateOrderHandler"),
  OptimizedImportOrderController: Symbol.for("OptimizedImportOrderController"),
  OptimizedImportOrderHandler: Symbol.for("OptimizedImportOrderHandler"),
  ImportOrderBackgroundService: Symbol.for("ImportOrderBackgroundService"),

  // EXPORT HANDLERS
  ExportDebtHandler: Symbol.for("ExportDebtHandler"),
  ExportCustomerDebtHandler: Symbol.for("ExportCustomerDebtHandler"),
  ExportEmployeeHrHandler: Symbol.for("ExportEmployeeHrHandler"),
  ExportFinanceHandler: Symbol.for("ExportFinanceHandler"),
};
