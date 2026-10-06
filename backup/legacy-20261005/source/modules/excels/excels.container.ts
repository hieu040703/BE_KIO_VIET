import { Container, ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { EXCELS_TYPES } from "./excels.type";
import { ExcelRouter } from "./excels.route";
import { ExcelController } from "./excels.controller";
import { ExcelService } from "./excels.service";
import { TemplateOrderHandler } from "./handlers/templates/order/handles";
import { ImportOrderHandler } from "./handlers/import/order/handles";

// EXPORT MODULE
import { ExportDebtHandler } from "./handlers/export/expenseApproval/handles";
import { ExportCustomerDebtHandler } from "./handlers/export/customerDebt/handles";
import { ExportEmployeeHrHandler } from "./handlers/export/employeeHR/handles";
import { ExportFinanceHandler } from "./handlers/export/finance/handles";

const excelsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<ExcelService>(EXCELS_TYPES.ExcelService).to(ExcelService);
  options.bind<ExcelRouter>(EXCELS_TYPES.ExcelRouter).to(ExcelRouter);
  options.bind<ExcelController>(EXCELS_TYPES.ExcelController).to(ExcelController);
  options.bind<TemplateOrderHandler>(EXCELS_TYPES.TemplateOrderHandler).to(TemplateOrderHandler);
  options.bind<ImportOrderHandler>(EXCELS_TYPES.ImportOrderHandler).to(ImportOrderHandler);

  // EXPORT HANDLERS
  options.bind<ExportDebtHandler>(EXCELS_TYPES.ExportDebtHandler).to(ExportDebtHandler);
  options.bind<ExportCustomerDebtHandler>(EXCELS_TYPES.ExportCustomerDebtHandler).to(ExportCustomerDebtHandler);
  options.bind<ExportEmployeeHrHandler>(EXCELS_TYPES.ExportEmployeeHrHandler).to(ExportEmployeeHrHandler);
  options.bind<ExportFinanceHandler>(EXCELS_TYPES.ExportFinanceHandler).to(ExportFinanceHandler);
});

export { excelsModule };
