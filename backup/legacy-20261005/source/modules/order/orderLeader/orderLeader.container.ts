
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {OrderLeaderController} from "./orderLeader.controller";
    import {OrderLeaderService} from "./orderLeader.service";
    import {OrderLeaderRepository} from "./orderLeader.repository";
    import {OrderLeaderRouter} from "./orderLeader.route";
    import {ORDER_LEADER_TYPES } from "./orderLeader.types";



    const orderLeaderModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<OrderLeaderService>(ORDER_LEADER_TYPES.OrderLeaderService).to(OrderLeaderService);
      options.bind<OrderLeaderController>(ORDER_LEADER_TYPES.OrderLeaderController).to(OrderLeaderController);
      options.bind<OrderLeaderRepository>(ORDER_LEADER_TYPES.OrderLeaderRepository).to(OrderLeaderRepository);
      options.bind<OrderLeaderRouter>(ORDER_LEADER_TYPES.OrderLeaderRouter).to(OrderLeaderRouter);
    });

    export { orderLeaderModule };