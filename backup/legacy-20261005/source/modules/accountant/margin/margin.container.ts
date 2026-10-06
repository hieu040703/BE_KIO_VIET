
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {MarginController} from "./margin.controller";
    import {MarginService} from "./margin.service";
    import {MarginRepository} from "./margin.repository";
    import {MarginRouter} from "./margin.route";
    import {MARGIN_TYPES } from "./margin.types";



    const marginModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<MarginService>(MARGIN_TYPES.MarginService).to(MarginService);
      options.bind<MarginController>(MARGIN_TYPES.MarginController).to(MarginController);
      options.bind<MarginRepository>(MARGIN_TYPES.MarginRepository).to(MarginRepository);
      options.bind<MarginRouter>(MARGIN_TYPES.MarginRouter).to(MarginRouter);
    });

    export { marginModule };