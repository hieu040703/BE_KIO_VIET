import { BaseRepository } from "@/shared/base/BaseRepository";
import { ZaloMessageHistory } from "@/database/models/ZaloMessageHistory";
import { ZaloMessageHistorySelectFull, ZaloMessageHistoryRelations } from "./zaloMessageHistory.select";
import { injectable } from "inversify";
import { SelectQueryBuilder } from "typeorm/query-builder/SelectQueryBuilder.js";
import { IFindOptions } from "@/shared/types/interfaces";
import { ZaloMessageStatusEnum, ZaloTemplateTypeEnum } from "../zalo.constance";

interface ZaloMessageHistoryFindOptions extends IFindOptions<ZaloMessageHistory> {
  customerId?: string;
  driverId?: string;
  tripId?: string;
  status?: ZaloMessageStatusEnum;
  templateType?: ZaloTemplateTypeEnum;
  phone?: string;
  startAt?: Date;
  endAt?: Date;
}

@injectable()
export class ZaloMessageHistoryRepository extends BaseRepository<ZaloMessageHistory> {
  protected entityClass = ZaloMessageHistory;
  protected selectedFields = ZaloMessageHistorySelectFull;
  protected relations = ZaloMessageHistoryRelations;

  constructor() {
    super();
    this.setOptions(ZaloMessageHistorySelectFull, ZaloMessageHistoryRelations);
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<ZaloMessageHistory>,
    options: ZaloMessageHistoryFindOptions,
  ): Promise<void> {
    if (options.customerId) {
      qb.andWhere("entity.customerId = :customerId", { customerId: options.customerId });
    }
    if (options.driverId) {
      qb.andWhere("entity.driverId = :driverId", { driverId: options.driverId });
    }
    if (options.tripId) {
      qb.andWhere("entity.tripId = :tripId", { tripId: options.tripId });
    }
    if (options.status) {
      qb.andWhere("entity.status = :status", { status: options.status });
    }
    if (options.templateType) {
      qb.andWhere("entity.templateType = :templateType", { templateType: options.templateType });
    }
    if (options.phone) {
      qb.andWhere("entity.phone ILIKE :phone", { phone: `%${options.phone}%` });
    }
    if (options.startAt) {
      qb.andWhere("entity.sentAt >= :startAt", { startAt: options.startAt });
    }
    if (options.endAt) {
      qb.andWhere("entity.sentAt <= :endAt", { endAt: options.endAt });
    }
  }
}
