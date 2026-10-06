import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailShippingProvidersController } from "./shippingProviders.controller";
import { RetailShippingProvidersRepository } from "./shippingProviders.repository";
import { RetailShippingProvidersRouter } from "./shippingProviders.route";
import { RetailShippingProvidersService } from "./shippingProviders.service";
import { RETAIL_SHIPPING_PROVIDERS_TYPES } from "./shippingProviders.types";

export const shippingProvidersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailShippingProvidersRepository>(RETAIL_SHIPPING_PROVIDERS_TYPES.Repository).to(RetailShippingProvidersRepository);
  options.bind<RetailShippingProvidersService>(RETAIL_SHIPPING_PROVIDERS_TYPES.Service).to(RetailShippingProvidersService);
  options.bind<RetailShippingProvidersController>(RETAIL_SHIPPING_PROVIDERS_TYPES.Controller).to(RetailShippingProvidersController);
  options.bind<RetailShippingProvidersRouter>(RETAIL_SHIPPING_PROVIDERS_TYPES.Router).to(RetailShippingProvidersRouter);
});
