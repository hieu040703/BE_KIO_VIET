import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdminVouchersTemplateController } from "./admin.vouchersTemplate.controller";
import { AdminVouchersTemplateRouter } from "./admin.vouchersTemplate.route";
import { AdminVouchersTemplateService } from "./admin.vouchersTemplate.service";
import { ClientVouchersTemplateController } from "./client.vouchersTemplate.controller";
import { ClientVouchersTemplateRouter } from "./client.vouchersTemplate.route";
import { ClientVouchersTemplateService } from "./client.vouchersTemplate.service";
import { VouchersTemplateRepository } from "./vouchersTemplate.repository";
import { VOUCHERS_TEMPLATE_TYPES } from "./vouchersTemplate.types";

const vouchersTemplateModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options
    .bind<VouchersTemplateRepository>(VOUCHERS_TEMPLATE_TYPES.VouchersTemplateRepository)
    .to(VouchersTemplateRepository);
  options
    .bind<AdminVouchersTemplateService>(VOUCHERS_TEMPLATE_TYPES.AdminVouchersTemplateService)
    .to(AdminVouchersTemplateService);
  options
    .bind<AdminVouchersTemplateController>(VOUCHERS_TEMPLATE_TYPES.AdminVouchersTemplateController)
    .to(AdminVouchersTemplateController);
  options
    .bind<AdminVouchersTemplateRouter>(VOUCHERS_TEMPLATE_TYPES.AdminVouchersTemplateRouter)
    .to(AdminVouchersTemplateRouter);
  options
    .bind<ClientVouchersTemplateService>(VOUCHERS_TEMPLATE_TYPES.ClientVouchersTemplateService)
    .to(ClientVouchersTemplateService);
  options
    .bind<ClientVouchersTemplateController>(VOUCHERS_TEMPLATE_TYPES.ClientVouchersTemplateController)
    .to(ClientVouchersTemplateController);
  options
    .bind<ClientVouchersTemplateRouter>(VOUCHERS_TEMPLATE_TYPES.ClientVouchersTemplateRouter)
    .to(ClientVouchersTemplateRouter);
});

export { vouchersTemplateModule };
