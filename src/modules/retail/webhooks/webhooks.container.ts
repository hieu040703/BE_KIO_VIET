import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailWebhooksController } from "./webhooks.controller";
import { RetailWebhooksRepository } from "./webhooks.repository";
import { RetailWebhooksRouter } from "./webhooks.route";
import { RetailWebhooksService } from "./webhooks.service";
import { RETAIL_WEBHOOKS_TYPES } from "./webhooks.types";

export const webhooksModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailWebhooksRepository>(RETAIL_WEBHOOKS_TYPES.Repository).to(RetailWebhooksRepository);
  options.bind<RetailWebhooksService>(RETAIL_WEBHOOKS_TYPES.Service).to(RetailWebhooksService);
  options.bind<RetailWebhooksController>(RETAIL_WEBHOOKS_TYPES.Controller).to(RetailWebhooksController);
  options.bind<RetailWebhooksRouter>(RETAIL_WEBHOOKS_TYPES.Router).to(RetailWebhooksRouter);
});
