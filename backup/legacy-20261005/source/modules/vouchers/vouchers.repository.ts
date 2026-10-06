import { Vouchers } from "@/database/models/Vouchers";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { IFindOptions } from "@/shared/types/interfaces";
import { injectable } from "inversify";
import { FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { VouchersRelations, VouchersSelectFull } from "./vouchers.select";

@injectable()
export class VouchersRepository extends BaseRepository<Vouchers> {
  protected entityClass = Vouchers;
  protected selectedFields = VouchersSelectFull;
  protected relations = VouchersRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Vouchers>): void {
    this.selectedFields = selectedFields || VouchersSelectFull;
    this.relations = VouchersRelations;
  }

  protected async extendQueryBuilder(qb: SelectQueryBuilder<Vouchers>, options: IFindOptions<Vouchers>) {
    const filters = (options.moreQuery || options) as Partial<Vouchers> & { isUsed?: boolean };

    if (filters.customerId) {
      qb.andWhere("entity.customerId = :customerId", { customerId: filters.customerId });
    }

    if (filters.userId) {
      qb.andWhere("entity.userId = :userId", { userId: filters.userId });
    }

    if (filters.isUsed !== undefined) {
      qb.andWhere("entity.isUsed = :isUsed", { isUsed: filters.isUsed });
    }
  }
}
