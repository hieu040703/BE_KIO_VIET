import { BaseRepository } from "@/shared/base/BaseRepository";
import { RewardPoint } from "@/database/models/RewardPoint";
import { FindOptionsSelect } from "typeorm";
import { RewardPointSelectFull, RewardPointRelations } from "./rewardPoint.select";
import { injectable, inject } from "inversify";

@injectable()
export class AdminRewardPointRepository extends BaseRepository<RewardPoint> {
  protected entityClass = RewardPoint;
  protected selectedFields = RewardPointSelectFull;
  protected relations = RewardPointRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<RewardPoint> | undefined): void {
    this.selectedFields = selectedFields || RewardPointSelectFull;
    this.relations = RewardPointRelations;
  }
}
