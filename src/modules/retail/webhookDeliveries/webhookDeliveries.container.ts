import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailWebhookDeliveriesController } from "./webhookDeliveries.controller";
import { RetailWebhookDeliveriesRepository } from "./webhookDeliveries.repository";
import { RetailWebhookDeliveriesRouter } from "./webhookDeliveries.route";
import { RetailWebhookDeliveriesService } from "./webhookDeliveries.service";
import { RETAIL_WEBHOOK_DELIVERIES_TYPES } from "./webhookDeliveries.types";

export const webhookDeliveriesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailWebhookDeliveriesRepository>(RETAIL_WEBHOOK_DELIVERIES_TYPES.Repository).to(RetailWebhookDeliveriesRepository);
  options.bind<RetailWebhookDeliveriesService>(RETAIL_WEBHOOK_DELIVERIES_TYPES.Service).to(RetailWebhookDeliveriesService);
  options.bind<RetailWebhookDeliveriesController>(RETAIL_WEBHOOK_DELIVERIES_TYPES.Controller).to(RetailWebhookDeliveriesController);
  options.bind<RetailWebhookDeliveriesRouter>(RETAIL_WEBHOOK_DELIVERIES_TYPES.Router).to(RetailWebhookDeliveriesRouter);
});
