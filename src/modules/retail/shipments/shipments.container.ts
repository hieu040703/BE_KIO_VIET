import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailShipmentsController } from "./shipments.controller";
import { RetailShipmentsRepository } from "./shipments.repository";
import { RetailShipmentsRouter } from "./shipments.route";
import { RetailShipmentsService } from "./shipments.service";
import { RETAIL_SHIPMENTS_TYPES } from "./shipments.types";

export const shipmentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailShipmentsRepository>(RETAIL_SHIPMENTS_TYPES.Repository).to(RetailShipmentsRepository);
  options.bind<RetailShipmentsService>(RETAIL_SHIPMENTS_TYPES.Service).to(RetailShipmentsService);
  options.bind<RetailShipmentsController>(RETAIL_SHIPMENTS_TYPES.Controller).to(RetailShipmentsController);
  options.bind<RetailShipmentsRouter>(RETAIL_SHIPMENTS_TYPES.Router).to(RetailShipmentsRouter);
});
