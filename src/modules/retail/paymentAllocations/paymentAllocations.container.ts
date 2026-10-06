import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPaymentAllocationsController } from "./paymentAllocations.controller";
import { RetailPaymentAllocationsRepository } from "./paymentAllocations.repository";
import { RetailPaymentAllocationsRouter } from "./paymentAllocations.route";
import { RetailPaymentAllocationsService } from "./paymentAllocations.service";
import { RETAIL_PAYMENT_ALLOCATIONS_TYPES } from "./paymentAllocations.types";

export const paymentAllocationsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPaymentAllocationsRepository>(RETAIL_PAYMENT_ALLOCATIONS_TYPES.Repository).to(RetailPaymentAllocationsRepository);
  options.bind<RetailPaymentAllocationsService>(RETAIL_PAYMENT_ALLOCATIONS_TYPES.Service).to(RetailPaymentAllocationsService);
  options.bind<RetailPaymentAllocationsController>(RETAIL_PAYMENT_ALLOCATIONS_TYPES.Controller).to(RetailPaymentAllocationsController);
  options.bind<RetailPaymentAllocationsRouter>(RETAIL_PAYMENT_ALLOCATIONS_TYPES.Router).to(RetailPaymentAllocationsRouter);
});
