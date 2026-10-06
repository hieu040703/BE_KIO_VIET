import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AllocateRevenueController } from "./allocateRevenue.controller";
import { AllocateRevenueRepository } from "./allocateRevenue.repository";
import { AllocateRevenueRouter } from "./allocateRevenue.route";
import { AllocateRevenueService } from "./allocateRevenue.service";
import { ALLOCATE_REVENUE_TYPES } from "./allocateRevenue.types";

const allocateRevenueModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AllocateRevenueService>(ALLOCATE_REVENUE_TYPES.AllocateRevenueService).to(AllocateRevenueService);
  options
    .bind<AllocateRevenueController>(ALLOCATE_REVENUE_TYPES.AllocateRevenueController)
    .to(AllocateRevenueController);
  options
    .bind<AllocateRevenueRepository>(ALLOCATE_REVENUE_TYPES.AllocateRevenueRepository)
    .to(AllocateRevenueRepository);
  options.bind<AllocateRevenueRouter>(ALLOCATE_REVENUE_TYPES.AllocateRevenueRouter).to(AllocateRevenueRouter);
});

export { allocateRevenueModule };
