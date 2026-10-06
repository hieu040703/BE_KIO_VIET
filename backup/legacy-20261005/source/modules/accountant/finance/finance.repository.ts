import { BaseRepository } from "@/shared/base/BaseRepository";
import { Finance } from "@/database/models/Finance";
import { Attribute } from "@/database/models/Attribute";
import { SelectQueryBuilder } from "typeorm";
import { FinanceSelectFull, FinanceRelations } from "./finance.select";
import { injectable } from "inversify";
import { ExpenseApprovalStatusEnum, FinanceTypeEnum } from "@/shared/constants/constance";
import { FinanceQueryDto } from "./finance.validator";

@injectable()
export class FinanceRepository extends BaseRepository<Finance> {
  protected entityClass = Finance;
  protected multipleFile: boolean = true;
  protected timeField: keyof Finance = "timeAt";

  constructor() {
    super();
    this.setOptions(FinanceSelectFull, FinanceRelations);
  }

  async extendQueryBuilder(qb: SelectQueryBuilder<Finance>, options: FinanceQueryDto): Promise<void> {
    // console.log("options sort by", options.sortBy);
    // console.log("options sort order", options.sortOrder);
    //? chỉ lấy các loại phiếu thu, chi
    if (options.type) {
      qb.andWhere("entity.type = :financeType", { financeType: options.type });
    } else {
      qb.andWhere("entity.type IN (:...financeTypes)", {
        financeTypes: options.excludeSalary
          ? [FinanceTypeEnum.EXPENSE, FinanceTypeEnum.INCOME]
          : [FinanceTypeEnum.EXPENSE, FinanceTypeEnum.INCOME, FinanceTypeEnum.SALARY],
      });
    }

    if (options.excludeSalary) {
      qb.andWhere("entity.type != :excludedSalaryType", {
        excludedSalaryType: FinanceTypeEnum.SALARY,
      });
    }

    if (options.branchIds && options.branchIds.length > 0) {
      qb.andWhere("entity.branchId IN (:...branchIds)", { branchIds: options.branchIds });
    }

    if (options.customerIds && options.customerIds.length > 0) {
      qb.andWhere("entity.customerId IN (:...customerIds)", { customerIds: options.customerIds });
    }

    if (options.employeeIds && options.employeeIds.length > 0) {
      qb.andWhere("entity.employeeId IN (:...employeeIds)", { employeeIds: options.employeeIds });
    }

    if (options.categoryIds && options.categoryIds.length > 0) {
      //? entity.category lưu tên (text) của Attribute (hạng mục thu chi), không phải id
      const categoryNamesSubQuery = qb
        .subQuery()
        .select("attribute.name")
        .from(Attribute, "attribute")
        .where("attribute.id IN (:...categoryIds)")
        .getQuery();
      qb.andWhere(`entity.category IN ${categoryNamesSubQuery}`, { categoryIds: options.categoryIds });
    }
  }

  async getRevenueInTimeRange(startDate: Date, endDate: Date): Promise<number> {
    //? total revenue = total income - total expense
    const qb = this.getRepository()
      .createQueryBuilder("finance")
      .select("SUM(CASE WHEN finance.type = :incomeType THEN finance.amount ELSE 0 END)", "totalIncome")
      .addSelect(
        "SUM(CASE WHEN finance.type IN (:...expenseTypes) THEN finance.amount ELSE 0 END)",
        "totalExpense",
      )
      .where("finance.timeAt >= :startDate AND finance.timeAt <= :endDate", { startDate, endDate })
      .andWhere("finance.status = :approvedStatus", { approvedStatus: ExpenseApprovalStatusEnum.APPROVED })
      .setParameters({
        incomeType: FinanceTypeEnum.INCOME,
        expenseTypes: [FinanceTypeEnum.EXPENSE, FinanceTypeEnum.SALARY],
      });

    const result = await qb.getRawOne();
    const totalIncome = parseFloat(result.totalIncome) || 0;
    const totalExpense = parseFloat(result.totalExpense) || 0;
    return totalIncome - totalExpense;
  }
}
