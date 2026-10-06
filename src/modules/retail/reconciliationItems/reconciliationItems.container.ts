import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailReconciliationItemsController } from "./reconciliationItems.controller";
import { RetailReconciliationItemsRepository } from "./reconciliationItems.repository";
import { RetailReconciliationItemsRouter } from "./reconciliationItems.route";
import { RetailReconciliationItemsService } from "./reconciliationItems.service";
import { RETAIL_RECONCILIATION_ITEMS_TYPES } from "./reconciliationItems.types";

export const reconciliationItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailReconciliationItemsRepository>(RETAIL_RECONCILIATION_ITEMS_TYPES.Repository).to(RetailReconciliationItemsRepository);
  options.bind<RetailReconciliationItemsService>(RETAIL_RECONCILIATION_ITEMS_TYPES.Service).to(RetailReconciliationItemsService);
  options.bind<RetailReconciliationItemsController>(RETAIL_RECONCILIATION_ITEMS_TYPES.Controller).to(RetailReconciliationItemsController);
  options.bind<RetailReconciliationItemsRouter>(RETAIL_RECONCILIATION_ITEMS_TYPES.Router).to(RetailReconciliationItemsRouter);
});
