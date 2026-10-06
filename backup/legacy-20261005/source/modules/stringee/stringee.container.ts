import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { StringeeController } from "./stringee.controller";
import { StringeeService } from "./stringee.service";
import { StringeeRouter } from "./stringee.route";
import { STRINGEE_TYPES } from "./stringee.types";

const stringeeModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<StringeeService>(STRINGEE_TYPES.StringeeService).to(StringeeService);
  options.bind<StringeeController>(STRINGEE_TYPES.StringeeController).to(StringeeController);
  options.bind<StringeeRouter>(STRINGEE_TYPES.StringeeRouter).to(StringeeRouter);
});

export { stringeeModule };
