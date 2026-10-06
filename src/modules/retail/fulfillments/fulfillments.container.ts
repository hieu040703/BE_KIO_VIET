import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailFulfillmentsController } from "./fulfillments.controller";
import { RetailFulfillmentsRepository } from "./fulfillments.repository";
import { RetailFulfillmentsRouter } from "./fulfillments.route";
import { RetailFulfillmentsService } from "./fulfillments.service";
import { RETAIL_FULFILLMENTS_TYPES } from "./fulfillments.types";

export const fulfillmentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailFulfillmentsRepository>(RETAIL_FULFILLMENTS_TYPES.Repository).to(RetailFulfillmentsRepository);
  options.bind<RetailFulfillmentsService>(RETAIL_FULFILLMENTS_TYPES.Service).to(RetailFulfillmentsService);
  options.bind<RetailFulfillmentsController>(RETAIL_FULFILLMENTS_TYPES.Controller).to(RetailFulfillmentsController);
  options.bind<RetailFulfillmentsRouter>(RETAIL_FULFILLMENTS_TYPES.Router).to(RetailFulfillmentsRouter);
});
