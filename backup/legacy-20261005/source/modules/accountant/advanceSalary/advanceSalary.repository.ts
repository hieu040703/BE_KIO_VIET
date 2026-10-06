import { BaseRepository } from "@/shared/base/BaseRepository";
import { FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { AdvanceSalarySelectFull, AdvanceSalaryRelations } from "./advanceSalary.select";
import { injectable, inject } from "inversify";
import { Finance } from "@/database/models/Finance";
import { FinanceTypeEnum } from "@/shared/constants/constance";
import { IFindOptions } from "@/shared/types/interfaces";
import { AdvanceSalaryQueryDto } from "./advanceSalary.validator";

@injectable()
export class AdvanceSalaryRepository extends BaseRepository<Finance> {
  protected entityClass = Finance;
  protected selectedFields = AdvanceSalarySelectFull;
  protected relations = AdvanceSalaryRelations;
  protected multipleFile: boolean = true;
  protected timeField: keyof Finance = "timeAt";

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Finance> | undefined): void {
    this.selectedFields = selectedFields || AdvanceSalarySelectFull;
    this.relations = AdvanceSalaryRelations;
  }

  protected async extendQueryBuilder(qb: SelectQueryBuilder<Finance>, options: AdvanceSalaryQueryDto): Promise<void> {
    qb.andWhere("entity.type IN (:...type)", { type: [FinanceTypeEnum.ADVANCE_SALARY] });

    if (options.branchIds && options.branchIds.length > 0) {
      qb.andWhere("entity.branchId IN (:...branchIds)", { branchIds: options.branchIds });
    }

    if (options.employeeIds && options.employeeIds.length > 0) {
      qb.andWhere("entity.employeeId IN (:...employeeIds)", { employeeIds: options.employeeIds });
    }
  }
}
