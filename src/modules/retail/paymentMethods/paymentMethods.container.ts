import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPaymentMethodsController } from "./paymentMethods.controller";
import { RetailPaymentMethodsRepository } from "./paymentMethods.repository";
import { RetailPaymentMethodsRouter } from "./paymentMethods.route";
import { RetailPaymentMethodsService } from "./paymentMethods.service";
import { RETAIL_PAYMENT_METHODS_TYPES } from "./paymentMethods.types";

export const paymentMethodsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPaymentMethodsRepository>(RETAIL_PAYMENT_METHODS_TYPES.Repository).to(RetailPaymentMethodsRepository);
  options.bind<RetailPaymentMethodsService>(RETAIL_PAYMENT_METHODS_TYPES.Service).to(RetailPaymentMethodsService);
  options.bind<RetailPaymentMethodsController>(RETAIL_PAYMENT_METHODS_TYPES.Controller).to(RetailPaymentMethodsController);
  options.bind<RetailPaymentMethodsRouter>(RETAIL_PAYMENT_METHODS_TYPES.Router).to(RetailPaymentMethodsRouter);
});
