import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerTagsController } from "./customerTags.controller";
import { RetailCustomerTagsRepository } from "./customerTags.repository";
import { RetailCustomerTagsRouter } from "./customerTags.route";
import { RetailCustomerTagsService } from "./customerTags.service";
import { RETAIL_CUSTOMER_TAGS_TYPES } from "./customerTags.types";

export const customerTagsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerTagsRepository>(RETAIL_CUSTOMER_TAGS_TYPES.Repository).to(RetailCustomerTagsRepository);
  options.bind<RetailCustomerTagsService>(RETAIL_CUSTOMER_TAGS_TYPES.Service).to(RetailCustomerTagsService);
  options.bind<RetailCustomerTagsController>(RETAIL_CUSTOMER_TAGS_TYPES.Controller).to(RetailCustomerTagsController);
  options.bind<RetailCustomerTagsRouter>(RETAIL_CUSTOMER_TAGS_TYPES.Router).to(RetailCustomerTagsRouter);
});
