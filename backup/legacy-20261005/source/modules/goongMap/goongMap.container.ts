import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { GOONG_MAP_TYPES } from "./goongMap.types";
import { GoongMapRepository } from "./goongMap.repository";
import { GoongMapCacheService } from "./goongMap.cache.service";
import { GoongMapService } from "./goongMap.service";
import { GoongMapController } from "./goongMap.controller";
import { GoongMapRouter } from "./goongMap.route";
import { AdminGoongMapRouter } from "./admin.goongMap.route";
import { ClientGoongMapRouter } from "./client.goongMap.route";

const goongMapModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<GoongMapRepository>(GOONG_MAP_TYPES.GoongMapRepository).to(GoongMapRepository);
  options.bind<GoongMapCacheService>(GOONG_MAP_TYPES.GoongMapCacheService).to(GoongMapCacheService);
  options.bind<GoongMapService>(GOONG_MAP_TYPES.GoongMapService).to(GoongMapService);
  options.bind<GoongMapController>(GOONG_MAP_TYPES.GoongMapController).to(GoongMapController);
  options.bind<GoongMapRouter>(GOONG_MAP_TYPES.GoongMapRouter).to(GoongMapRouter);
  options.bind<AdminGoongMapRouter>(GOONG_MAP_TYPES.AdminGoongMapRouter).to(AdminGoongMapRouter);
  options.bind<ClientGoongMapRouter>(GOONG_MAP_TYPES.ClientGoongMapRouter).to(ClientGoongMapRouter);
});

export { goongMapModule };
