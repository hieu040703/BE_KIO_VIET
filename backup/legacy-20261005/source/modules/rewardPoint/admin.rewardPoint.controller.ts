import { injectable, inject } from "inversify";
    import { AdminRewardPointService } from "./admin.rewardPoint.service";
    import { REWARD_POINT_TYPES } from "./rewardPoint.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class AdminRewardPointController extends BaseController<AdminRewardPointService> {
      constructor(@inject(REWARD_POINT_TYPES.AdminRewardPointService) protected service: AdminRewardPointService) {
        super(service);
      }
    }
    