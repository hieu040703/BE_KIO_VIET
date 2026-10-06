import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { GOOGLE_MAP_TYPES } from "./googleMap.types";
import { GoogleMapRepository } from "./googleMap.repository";
import { GoogleMapCacheService } from "./googleMap.cache.service";
import { GoogleMapService } from "./googleMap.service";
import { GoogleMapController } from "./googleMap.controller";
import { GoogleMapRouter } from "./googleMap.route";
import { ClientGoogleMapRouter } from "./client.googleMap.route";
import { CommonGoogleMapRouter } from "./common.googleMap.route";

const googleMapModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<GoogleMapRepository>(GOOGLE_MAP_TYPES.GoogleMapRepository).to(GoogleMapRepository);
  options.bind<GoogleMapCacheService>(GOOGLE_MAP_TYPES.GoogleMapCacheService).to(GoogleMapCacheService);
  options.bind<GoogleMapService>(GOOGLE_MAP_TYPES.GoogleMapService).to(GoogleMapService);
  options.bind<GoogleMapController>(GOOGLE_MAP_TYPES.GoogleMapController).to(GoogleMapController);
  options.bind<GoogleMapRouter>(GOOGLE_MAP_TYPES.GoogleMapRouter).to(GoogleMapRouter);
  options.bind<ClientGoogleMapRouter>(GOOGLE_MAP_TYPES.ClientGoogleMapRouter).to(ClientGoogleMapRouter);
  options.bind<CommonGoogleMapRouter>(GOOGLE_MAP_TYPES.CommonGoogleMapRouter).to(CommonGoogleMapRouter);
});

export { googleMapModule };
