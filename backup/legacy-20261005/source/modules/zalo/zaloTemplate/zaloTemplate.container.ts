import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdminZaloTemplateRouter } from "./zaloTemplate.route";
import { ZaloTemplateController } from "./zaloTemplate.controller";
import { ZaloTemplateRepository } from "./zaloTemplate.repository";
import { ZaloTemplateService } from "./zaloTemplate.service";
import { ZALO_TEMPLATE_TYPES } from "./zaloTemplate.types";

const zaloTemplateModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<ZaloTemplateRepository>(ZALO_TEMPLATE_TYPES.ZaloTemplateRepository).to(ZaloTemplateRepository);
  options.bind<ZaloTemplateService>(ZALO_TEMPLATE_TYPES.ZaloTemplateService).to(ZaloTemplateService);
  options.bind<ZaloTemplateController>(ZALO_TEMPLATE_TYPES.ZaloTemplateController).to(ZaloTemplateController);
  options.bind<AdminZaloTemplateRouter>(ZALO_TEMPLATE_TYPES.AdminZaloTemplateRouter).to(AdminZaloTemplateRouter);
});

export { zaloTemplateModule };
