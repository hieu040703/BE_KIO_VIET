
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {CallNavigationController} from "./callNavigation.controller";
    import {CallNavigationService} from "./callNavigation.service";
    import {CallNavigationRepository} from "./callNavigation.repository";
    import {CallNavigationRouter} from "./callNavigation.route";
    import {CALL_NAVIGATION_TYPES } from "./callNavigation.types";



    const callNavigationModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<CallNavigationService>(CALL_NAVIGATION_TYPES.CallNavigationService).to(CallNavigationService);
      options.bind<CallNavigationController>(CALL_NAVIGATION_TYPES.CallNavigationController).to(CallNavigationController);
      options.bind<CallNavigationRepository>(CALL_NAVIGATION_TYPES.CallNavigationRepository).to(CallNavigationRepository);
      options.bind<CallNavigationRouter>(CALL_NAVIGATION_TYPES.CallNavigationRouter).to(CallNavigationRouter);
    });

    export { callNavigationModule };