import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdminRewardPointController } from "./admin.rewardPoint.controller";
import { ClientRewardPointController } from "./client.rewardPoint.controller";
import { AdminRewardPointService } from "./admin.rewardPoint.service";
import { ClientRewardPointService } from "./client.rewardPoint.service";
import { ClientRewardPointRepository } from "./client.rewardPoint.repository";
import { AdminRewardPointRepository } from "./admin.rewardPoint.repository";
import { AdminRewardPointRouter } from "./admin.rewardPoint.route";
import { ClientRewardPointRouter } from "./client.rewardPoint.route";
import { REWARD_POINT_TYPES } from "./rewardPoint.types";

const rewardPointModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AdminRewardPointService>(REWARD_POINT_TYPES.AdminRewardPointService).to(AdminRewardPointService);
  options
    .bind<AdminRewardPointController>(REWARD_POINT_TYPES.AdminRewardPointController)
    .to(AdminRewardPointController);
  options.bind<AdminRewardPointRouter>(REWARD_POINT_TYPES.AdminRewardPointRouter).to(AdminRewardPointRouter);

  options.bind<ClientRewardPointService>(REWARD_POINT_TYPES.ClientRewardPointService).to(ClientRewardPointService);
  options
    .bind<ClientRewardPointController>(REWARD_POINT_TYPES.ClientRewardPointController)
    .to(ClientRewardPointController);
  options.bind<ClientRewardPointRouter>(REWARD_POINT_TYPES.ClientRewardPointRouter).to(ClientRewardPointRouter);
  options
    .bind<ClientRewardPointRepository>(REWARD_POINT_TYPES.ClientRewardPointRepository)
    .to(ClientRewardPointRepository);
  options
    .bind<AdminRewardPointRepository>(REWARD_POINT_TYPES.AdminRewardPointRepository)
    .to(AdminRewardPointRepository);
});

export { rewardPointModule };
