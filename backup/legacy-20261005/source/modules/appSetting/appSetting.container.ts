
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {AppSettingController} from "./appSetting.controller";
    import {AppSettingService} from "./appSetting.service";
    import {AppSettingRepository} from "./appSetting.repository";
    import {AppSettingRouter} from "./appSetting.route";
    import {APP_SETTING_TYPES } from "./appSetting.types";



    const appSettingModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<AppSettingService>(APP_SETTING_TYPES.AppSettingService).to(AppSettingService);
      options.bind<AppSettingController>(APP_SETTING_TYPES.AppSettingController).to(AppSettingController);
      options.bind<AppSettingRepository>(APP_SETTING_TYPES.AppSettingRepository).to(AppSettingRepository);
      options.bind<AppSettingRouter>(APP_SETTING_TYPES.AppSettingRouter).to(AppSettingRouter);
    });

    export { appSettingModule };