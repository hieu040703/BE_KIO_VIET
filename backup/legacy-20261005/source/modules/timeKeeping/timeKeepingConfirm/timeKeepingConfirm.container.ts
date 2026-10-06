
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {TimeKeepingConfirmController} from "./timeKeepingConfirm.controller";
    import {TimeKeepingConfirmService} from "./timeKeepingConfirm.service";
    import {TimeKeepingConfirmRepository} from "./timeKeepingConfirm.repository";
    import {TimeKeepingConfirmRouter} from "./timeKeepingConfirm.route";
    import {TIME_KEEPING_CONFIRM_TYPES } from "./timeKeepingConfirm.types";



    const timeKeepingConfirmModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<TimeKeepingConfirmService>(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmService).to(TimeKeepingConfirmService);
      options.bind<TimeKeepingConfirmController>(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmController).to(TimeKeepingConfirmController);
      options.bind<TimeKeepingConfirmRepository>(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmRepository).to(TimeKeepingConfirmRepository);
      options.bind<TimeKeepingConfirmRouter>(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmRouter).to(TimeKeepingConfirmRouter);
    });

    export { timeKeepingConfirmModule };