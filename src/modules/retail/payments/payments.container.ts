import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPaymentsController } from "./payments.controller";
import { RetailPaymentsRepository } from "./payments.repository";
import { RetailPaymentsRouter } from "./payments.route";
import { RetailPaymentsService } from "./payments.service";
import { RETAIL_PAYMENTS_TYPES } from "./payments.types";

export const paymentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPaymentsRepository>(RETAIL_PAYMENTS_TYPES.Repository).to(RetailPaymentsRepository);
  options.bind<RetailPaymentsService>(RETAIL_PAYMENTS_TYPES.Service).to(RetailPaymentsService);
  options.bind<RetailPaymentsController>(RETAIL_PAYMENTS_TYPES.Controller).to(RetailPaymentsController);
  options.bind<RetailPaymentsRouter>(RETAIL_PAYMENTS_TYPES.Router).to(RetailPaymentsRouter);
});
