import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdminCustomerCareController } from "./admin.customerCare.controller";
import { AdminCustomerCareRouter } from "./admin.customerCare.route";
import { AdminCustomerCareService } from "./admin.customerCare.service";
import { CustomerCareRepository } from "./customerCare.repository";
import { CUSTOMER_CARE_TYPES } from "./customerCare.types";

const customerCareModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<AdminCustomerCareService>(
        CUSTOMER_CARE_TYPES.AdminCustomerCareService,
      )
      .to(AdminCustomerCareService);
    options
      .bind<AdminCustomerCareController>(
        CUSTOMER_CARE_TYPES.AdminCustomerCareController,
      )
      .to(AdminCustomerCareController);
    options
      .bind<AdminCustomerCareRouter>(
        CUSTOMER_CARE_TYPES.AdminCustomerCareRouter,
      )
      .to(AdminCustomerCareRouter);
    options
      .bind<CustomerCareRepository>(CUSTOMER_CARE_TYPES.CustomerCareRepository)
      .to(CustomerCareRepository);
  },
);

export { customerCareModule };
