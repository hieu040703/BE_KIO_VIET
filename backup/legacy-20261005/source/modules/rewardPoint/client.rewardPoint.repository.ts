import { BaseRepository } from "@/shared/base/BaseRepository";
import { RewardPoint } from "@/database/models/RewardPoint";
import { FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { RewardPointSelectFull, RewardPointRelations } from "./rewardPoint.select";
import { injectable, inject } from "inversify";
import { IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { ForbiddenError } from "@/shared/types/errors";

@injectable()
export class ClientRewardPointRepository extends BaseRepository<RewardPoint> {
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

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<RewardPoint>,
    options: IFindOptions<RewardPoint>,
    req?: Request,
  ): Promise<void> {
    // chỉ lấy thông tin của riêng khách hàng hiện tại
    const customerId = req?.user?.customerId;
    if (!customerId) {
      throw new ForbiddenError("Customer ID is required");
    }
    qb.andWhere(`entity.customerId = :customerId`, { customerId });
  }

  protected async extendSummaryFields(
    summary: any,
    qb: SelectQueryBuilder<RewardPoint>,
    options: IFindOptions<RewardPoint>,
    req?: Request,
  ): Promise<void> {
    // tính số điểm thưởng hiện tại của khách hàng và thêm vào summary
    const customerId = req?.user?.customerId;
    if (!customerId) {
      throw new ForbiddenError("Customer ID is required");
    }

    //? tổng điểm = điểm tích lũy - điểm đã sử dụng
    const currentPoints = await this.getCurrentPoints(customerId);
    summary.currentPoints = Number(currentPoints) || 0;
  }

  //? tính tổng điểm hiện tại của khách hàng, có thể dùng cho các trường hợp khác ngoài getAllWithPagination
  public async getCurrentPoints(customerId: string): Promise<number> {
    const result = await this.getRepository()
      .createQueryBuilder("entity")
      .select("SUM(CASE WHEN entity.type = 'EARNED' THEN entity.points ELSE -entity.points END)", "currentPoints")
      .where("entity.customerId = :customerId", { customerId })
      .getRawOne();
    return result?.currentPoints || 0;
  }
}
