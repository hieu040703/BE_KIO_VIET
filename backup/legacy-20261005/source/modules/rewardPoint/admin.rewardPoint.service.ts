import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { AdminRewardPointRepository } from "./admin.rewardPoint.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { REWARD_POINT_TYPES } from "./rewardPoint.types";
import { COMMON_TYPES } from "../common/common.types";
import { RewardPoint } from "@/database/models/RewardPoint";
import { RewardPointRelations, RewardPointSelectFull } from "./rewardPoint.select";

@injectable()
export class AdminRewardPointService extends BaseService<RewardPoint> {
  protected relations = RewardPointRelations;
  protected selectedFields = RewardPointSelectFull;
  constructor(
    @inject(REWARD_POINT_TYPES.AdminRewardPointRepository) private rewardPointRepository: AdminRewardPointRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(rewardPointRepository);
  }
}
