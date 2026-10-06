import { BaseRepository } from "@/shared/base/BaseRepository";
import { Margin } from "@/database/models/Margin";
import { FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { MarginSelectFull, MarginRelations } from "./margin.select";
import { injectable, inject } from "inversify";
import { IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { MarginQueryDto } from "./margin.validator";

@injectable()
export class MarginRepository extends BaseRepository<Margin> {
  protected entityClass = Margin;
  protected selectedFields = MarginSelectFull;
  protected relations = MarginRelations;
  protected multipleFile: boolean = true;
  protected timeField: keyof Margin = "timeAt";

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Margin> | undefined): void {
    this.selectedFields = selectedFields || MarginSelectFull;
    this.relations = MarginRelations;
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<Margin>,
    options: MarginQueryDto,
    req?: Request,
  ): Promise<void> {
    if (options.branchIds && options.branchIds.length > 0) {
      qb.andWhere("entity.branchId IN (:...branchIds)", { branchIds: options.branchIds });
    }
    if (options.employeeIds && options.employeeIds.length > 0) {
      qb.andWhere("entity.employeeId IN (:...employeeIds)", { employeeIds: options.employeeIds });
    }
  }
}
