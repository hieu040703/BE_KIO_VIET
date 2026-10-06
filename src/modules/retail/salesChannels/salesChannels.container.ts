import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailSalesChannelsController } from "./salesChannels.controller";
import { RetailSalesChannelsRepository } from "./salesChannels.repository";
import { RetailSalesChannelsRouter } from "./salesChannels.route";
import { RetailSalesChannelsService } from "./salesChannels.service";
import { RETAIL_SALES_CHANNELS_TYPES } from "./salesChannels.types";

export const salesChannelsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailSalesChannelsRepository>(RETAIL_SALES_CHANNELS_TYPES.Repository).to(RetailSalesChannelsRepository);
  options.bind<RetailSalesChannelsService>(RETAIL_SALES_CHANNELS_TYPES.Service).to(RetailSalesChannelsService);
  options.bind<RetailSalesChannelsController>(RETAIL_SALES_CHANNELS_TYPES.Controller).to(RetailSalesChannelsController);
  options.bind<RetailSalesChannelsRouter>(RETAIL_SALES_CHANNELS_TYPES.Router).to(RetailSalesChannelsRouter);
});
