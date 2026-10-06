import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { ClientRewardPointRepository } from "./client.rewardPoint.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { REWARD_POINT_TYPES } from "./rewardPoint.types";
import { COMMON_TYPES } from "../common/common.types";
import { RewardPoint } from "@/database/models/RewardPoint";
import { RewardPointRelations, RewardPointSelectFull } from "./rewardPoint.select";
import { config } from "@/shared/config/env";
import { ApiResponse } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";

@injectable()
export class ClientRewardPointService extends BaseService<RewardPoint> {
  protected relations = RewardPointRelations;
  protected selectedFields = RewardPointSelectFull;
  constructor(
    @inject(REWARD_POINT_TYPES.ClientRewardPointRepository) private rewardPointRepository: ClientRewardPointRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(rewardPointRepository);
  }

  async covertMoneyToPoint(amount: number): Promise<ApiResponse<number>> {
    const pointsEarned = Math.floor(amount / config.ORDER_POINT_RATE); // Example conversion rate: 100000 VND = 1 point

    return ApiResponseHandler.getSuccess("Points calculated successfully", { pointsEarned });
  }
}
