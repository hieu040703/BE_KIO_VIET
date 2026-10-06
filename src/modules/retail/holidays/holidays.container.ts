import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailHolidaysController } from "./holidays.controller";
import { RetailHolidaysRepository } from "./holidays.repository";
import { RetailHolidaysRouter } from "./holidays.route";
import { RetailHolidaysService } from "./holidays.service";
import { RETAIL_HOLIDAYS_TYPES } from "./holidays.types";

export const holidaysModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailHolidaysRepository>(RETAIL_HOLIDAYS_TYPES.Repository).to(RetailHolidaysRepository);
  options.bind<RetailHolidaysService>(RETAIL_HOLIDAYS_TYPES.Service).to(RetailHolidaysService);
  options.bind<RetailHolidaysController>(RETAIL_HOLIDAYS_TYPES.Controller).to(RetailHolidaysController);
  options.bind<RetailHolidaysRouter>(RETAIL_HOLIDAYS_TYPES.Router).to(RetailHolidaysRouter);
});
