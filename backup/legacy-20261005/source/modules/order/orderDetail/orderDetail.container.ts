
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {OrderDetailController} from "./orderDetail.controller";
    import {OrderDetailService} from "./orderDetail.service";
    import {OrderDetailRepository} from "./orderDetail.repository";
    import {OrderDetailRouter} from "./orderDetail.route";
    import {ORDER_DETAIL_TYPES } from "./orderDetail.types";



    const orderDetailModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<OrderDetailService>(ORDER_DETAIL_TYPES.OrderDetailService).to(OrderDetailService);
      options.bind<OrderDetailController>(ORDER_DETAIL_TYPES.OrderDetailController).to(OrderDetailController);
      options.bind<OrderDetailRepository>(ORDER_DETAIL_TYPES.OrderDetailRepository).to(OrderDetailRepository);
      options.bind<OrderDetailRouter>(ORDER_DETAIL_TYPES.OrderDetailRouter).to(OrderDetailRouter);
    });

    export { orderDetailModule };