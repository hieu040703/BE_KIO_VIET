
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {AdminServiceController} from "./admin.service.controller";
    import {ClientServiceController} from "./client.service.controller";
    import {AdminServiceService} from "./admin.service.service";
    import {ClientServiceService} from "./client.service.service";
    import {ServiceRepository} from "./service.repository";
    import {AdminServiceRouter} from "./admin.service.route";
    import {ClientServiceRouter} from "./client.service.route";
    import {SERVICE_TYPES } from "./service.types";



    const serviceModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<AdminServiceService>(SERVICE_TYPES.AdminServiceService).to(AdminServiceService);
      options.bind<AdminServiceController>(SERVICE_TYPES.AdminServiceController).to(AdminServiceController);
      options.bind<AdminServiceRouter>(SERVICE_TYPES.AdminServiceRouter).to(AdminServiceRouter);

    options.bind<ClientServiceService>(SERVICE_TYPES.ClientServiceService).to(ClientServiceService);
      options.bind<ClientServiceController>(SERVICE_TYPES.ClientServiceController).to(ClientServiceController);
      options.bind<ClientServiceRouter>(SERVICE_TYPES.ClientServiceRouter).to(ClientServiceRouter);
     options.bind<ServiceRepository>(SERVICE_TYPES.ServiceRepository).to(ServiceRepository);
    });

    export { serviceModule };