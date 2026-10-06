import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { ZaloService } from "./zalo.service";
import { ZaloController } from "./zalo.controller";
import { ZaloRouter } from "./zalo.route";
import { ZALO_TYPES } from "./zalo.types";

const zaloModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<ZaloService>(ZALO_TYPES.ZaloService).to(ZaloService);
  options.bind<ZaloController>(ZALO_TYPES.ZaloController).to(ZaloController);
  options.bind<ZaloRouter>(ZALO_TYPES.ZaloRouter).to(ZaloRouter);
});

export { zaloModule };
