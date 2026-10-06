
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {ServicePriceController} from "./servicePrice.controller";
    import {ServicePriceService} from "./servicePrice.service";
    import {ServicePriceRepository} from "./servicePrice.repository";
    import {ServicePriceRouter} from "./servicePrice.route";
    import {SERVICE_PRICE_TYPES } from "./servicePrice.types";



    const servicePriceModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<ServicePriceService>(SERVICE_PRICE_TYPES.ServicePriceService).to(ServicePriceService);
      options.bind<ServicePriceController>(SERVICE_PRICE_TYPES.ServicePriceController).to(ServicePriceController);
      options.bind<ServicePriceRepository>(SERVICE_PRICE_TYPES.ServicePriceRepository).to(ServicePriceRepository);
      options.bind<ServicePriceRouter>(SERVICE_PRICE_TYPES.ServicePriceRouter).to(ServicePriceRouter);
    });

    export { servicePriceModule };