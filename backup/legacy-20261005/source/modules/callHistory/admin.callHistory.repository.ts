import { BaseRepository } from "@/shared/base/BaseRepository";
import { CallHistory } from "@/database/models/CallHistory";
import { FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { CallHistorySelectFull, CallHistoryRelations } from "./callHistory.select";
import { injectable, inject } from "inversify";
import { IFindOptions } from "@/shared/types/interfaces";

@injectable()
export class AdminCallHistoryRepository extends BaseRepository<CallHistory> {
  protected entityClass = CallHistory;
  protected selectedFields = CallHistorySelectFull;
  protected relations = CallHistoryRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<CallHistory> | undefined): void {
    this.selectedFields = selectedFields || CallHistorySelectFull;
    this.relations = CallHistoryRelations;
  }

  async extendQueryBuilder(qb: SelectQueryBuilder<CallHistory>, options: IFindOptions<CallHistory>): Promise<void> {
    const orderId = (options as IFindOptions<CallHistory> & { orderId?: string }).orderId;
    if (orderId) {
      qb.andWhere("entity.orderId = :orderId", { orderId });
    }
  }
}
