import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCustomerActivitiesController } from "./customerActivities.controller";
import { RetailCustomerActivitiesRepository } from "./customerActivities.repository";
import { RetailCustomerActivitiesRouter } from "./customerActivities.route";
import { RetailCustomerActivitiesService } from "./customerActivities.service";
import { RETAIL_CUSTOMER_ACTIVITIES_TYPES } from "./customerActivities.types";

export const customerActivitiesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCustomerActivitiesRepository>(RETAIL_CUSTOMER_ACTIVITIES_TYPES.Repository).to(RetailCustomerActivitiesRepository);
  options.bind<RetailCustomerActivitiesService>(RETAIL_CUSTOMER_ACTIVITIES_TYPES.Service).to(RetailCustomerActivitiesService);
  options.bind<RetailCustomerActivitiesController>(RETAIL_CUSTOMER_ACTIVITIES_TYPES.Controller).to(RetailCustomerActivitiesController);
  options.bind<RetailCustomerActivitiesRouter>(RETAIL_CUSTOMER_ACTIVITIES_TYPES.Router).to(RetailCustomerActivitiesRouter);
});
