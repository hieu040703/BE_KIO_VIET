
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {TimeKeepingController} from "./timeKeeping.controller";
    import {TimeKeepingService} from "./timeKeeping.service";
    import {TimeKeepingRepository} from "./timeKeeping.repository";
    import {TimeKeepingRouter} from "./timeKeeping.route";
    import {TIME_KEEPING_TYPES } from "./timeKeeping.types";



    const timeKeepingModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<TimeKeepingService>(TIME_KEEPING_TYPES.TimeKeepingService).to(TimeKeepingService);
      options.bind<TimeKeepingController>(TIME_KEEPING_TYPES.TimeKeepingController).to(TimeKeepingController);
      options.bind<TimeKeepingRepository>(TIME_KEEPING_TYPES.TimeKeepingRepository).to(TimeKeepingRepository);
      options.bind<TimeKeepingRouter>(TIME_KEEPING_TYPES.TimeKeepingRouter).to(TimeKeepingRouter);
    });

    export { timeKeepingModule };