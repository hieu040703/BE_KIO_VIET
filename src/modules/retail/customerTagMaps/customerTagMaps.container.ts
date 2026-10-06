import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerTagMapsController } from "./customerTagMaps.controller";
import { RetailCustomerTagMapsRepository } from "./customerTagMaps.repository";
import { RetailCustomerTagMapsRouter } from "./customerTagMaps.route";
import { RetailCustomerTagMapsService } from "./customerTagMaps.service";
import { RETAIL_CUSTOMER_TAG_MAPS_TYPES } from "./customerTagMaps.types";

export const customerTagMapsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerTagMapsRepository>(RETAIL_CUSTOMER_TAG_MAPS_TYPES.Repository).to(RetailCustomerTagMapsRepository);
  options.bind<RetailCustomerTagMapsService>(RETAIL_CUSTOMER_TAG_MAPS_TYPES.Service).to(RetailCustomerTagMapsService);
  options.bind<RetailCustomerTagMapsController>(RETAIL_CUSTOMER_TAG_MAPS_TYPES.Controller).to(RetailCustomerTagMapsController);
  options.bind<RetailCustomerTagMapsRouter>(RETAIL_CUSTOMER_TAG_MAPS_TYPES.Router).to(RetailCustomerTagMapsRouter);
});
