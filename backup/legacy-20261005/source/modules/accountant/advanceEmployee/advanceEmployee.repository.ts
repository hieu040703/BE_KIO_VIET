import { BaseRepository } from "@/shared/base/BaseRepository";
import { Between, FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { AdvanceEmployeeSelectFull, AdvanceEmployeeRelations } from "./advanceEmployee.select";
import { injectable, inject } from "inversify";
import { Finance } from "@/database/models/Finance";
import { ExpenseApprovalStatusEnum, FinanceTypeEnum } from "@/shared/constants/constance";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { AdvanceEmployeeQueryDto, GetAdvanceEmployeeSummaryDto } from "./advanceEmployee.validator";
import { EMPLOYEE_TYPES } from "@/modules/employee/employee.types";
import { EmployeeRepository } from "@/modules/employee/employee.repository";
import { Request } from "express";
import dayjs from "dayjs";

@injectable()
export class AdvanceEmployeeRepository extends BaseRepository<Finance> {
  protected entityClass = Finance;
  protected selectedFields = AdvanceEmployeeSelectFull;
  protected relations = AdvanceEmployeeRelations;
  protected multipleFile: boolean = true;
  protected timeField: keyof Finance = "timeAt";

  constructor(@inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository) {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Finance> | undefined): void {
    this.selectedFields = selectedFields || AdvanceEmployeeSelectFull;
    this.relations = AdvanceEmployeeRelations;
  }

  protected async extendQueryBuilder(qb: SelectQueryBuilder<Finance>, options: AdvanceEmployeeQueryDto): Promise<void> {
    // Filter by type - if specific type provided, use it; otherwise use all three types
    if (options.type) {
      qb.andWhere("entity.type = :type", { type: options.type });
    } else {
      qb.andWhere("entity.type IN (:...types)", {
        types: [FinanceTypeEnum.ADVANCE_EMPLOYEE, FinanceTypeEnum.REIMBURSE, FinanceTypeEnum.SETTLEMENT],
      });
    }

    if (options.branchIds && options.branchIds.length > 0) {
      qb.andWhere("entity.branchId IN (:...branchIds)", { branchIds: options.branchIds });
    }

    if (options.employeeIds && options.employeeIds.length > 0) {
      qb.andWhere("entity.employeeId IN (:...employeeIds)", { employeeIds: options.employeeIds });
    }
  }

  async getAdvanceEmployeeSummary(data: GetAdvanceEmployeeSummaryDto, req?: Request, manager?: IEntityManager) {
    const startAt = data.startAt || dayjs().tz("Asia/Ho_Chi_Minh").startOf("month").toDate();
    const endAt = data.endAt || dayjs().tz("Asia/Ho_Chi_Minh").endOf("month").toDate();

    const page = data.page || 1;
    const size = data.size || 20;

    const employees = await this.employeeRepository.findWithPagination({ page, size }, manager, false, req);

    const qb = this.employeeRepository.getRepository(manager).createQueryBuilder("employee");
    qb.where("employee.id IN (:...employeeIds)", { employeeIds: employees.data.map((e) => e.id) });

    //? số dư tạm ứng đầu kỳ
    qb.addSelect((subQuery) => {
      return subQuery
        .select(
          `CAST(
            COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.ADVANCE_EMPLOYEE}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.SETTLEMENT}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.REIMBURSE}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0)
          AS INTEGER)`,
          "beginningAdvance",
        )
        .from(Finance, "finance")
        .where("finance.employeeId = employee.id")
        .andWhere("finance.timeAt < :startAt", { startAt });
    }, "beginningAdvance");

    //? tăng tạm ứng trong kỳ
    qb.addSelect((subQuery) => {
      return subQuery
        .select(
          `CAST(COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.ADVANCE_EMPLOYEE}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0) AS INTEGER)`,
          "advance",
        )
        .from(Finance, "finance")
        .where("finance.employeeId = employee.id")
        .andWhere("finance.timeAt >= :startAt AND finance.timeAt <= :endAt", { startAt, endAt });
    }, "advance");

    //? tổng quyết toán trong kỳ
    qb.addSelect((subQuery) => {
      return subQuery
        .select(
          `CAST(COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.SETTLEMENT}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0) AS INTEGER)`,
          "settlement",
        )
        .from(Finance, "finance")
        .where("finance.employeeId = employee.id")
        .andWhere("finance.timeAt >= :startAt AND finance.timeAt <= :endAt", { startAt, endAt });
    }, "settlement");

    //? tổng hoàn ứng trong kỳ
    qb.addSelect((subQuery) => {
      return subQuery
        .select(
          `CAST(COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.REIMBURSE}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0) AS INTEGER)`,
          "reimburse",
        )
        .from(Finance, "finance")
        .where("finance.employeeId = employee.id")
        .andWhere("finance.timeAt >= :startAt AND finance.timeAt <= :endAt", { startAt, endAt });
    }, "reimburse");

    //? số dư tạm ứng cuối kỳ
    qb.addSelect((subQuery) => {
      return subQuery
        .select(
          `CAST(
            COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.ADVANCE_EMPLOYEE}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.SETTLEMENT}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.REIMBURSE}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0)
          AS INTEGER)`,
          "endingAdvance",
        )
        .from(Finance, "finance")
        .where("finance.employeeId = employee.id")
        .andWhere("finance.timeAt <= :endAt", { endAt });
    }, "endingAdvance");

    const result = await qb.getRawAndEntities();

    const dataMapped = result.entities.map((entity, index) => {
      const raw = result.raw[index];
      const avatar = employees.data.find((e) => e.id === entity.id)?.avatar || null;
      return {
        ...entity,
        avatar: avatar,
        beginningAdvance: parseInt(raw.beginningAdvance) || 0,
        advance: parseInt(raw.advance) || 0,
        settlement: parseInt(raw.settlement) || 0,
        reimburse: parseInt(raw.reimburse) || 0,
        endingAdvance: parseInt(raw.endingAdvance) || 0,
      };
    });

    return { data: dataMapped, total: employees.total, page, size };
  }

  // tính số dư tạm ứng của nhân viên tại thời điểm timeAt
  async getEmployeeAdvanceBalance(employeeId: string | null, timeAt: Date, manager?: IEntityManager): Promise<number> {
    const qb = this.getRepository(manager).createQueryBuilder("finance");

    if (employeeId) {
      qb.where("finance.employeeId = :employeeId", { employeeId });
    }

    qb.andWhere("finance.timeAt <= :timeAt", { timeAt });
    qb.andWhere("finance.type IN (:...type)", {
      type: [FinanceTypeEnum.ADVANCE_EMPLOYEE, FinanceTypeEnum.REIMBURSE, FinanceTypeEnum.SETTLEMENT],
    });

    // Clear selects, orderBys, and groupBys before doing SUM to avoid PostgreSQL GROUP BY errors
    (qb as any).expressionMap.selects = [];
    (qb as any).expressionMap.orderBys = [];
    (qb as any).expressionMap.groupBys = [];

    // Always use getRawAndEntities to preserve string formats (like leading zeros in varchar fields)
    const sum = await qb
      .select(
        `SUM(
        CASE 
          WHEN finance.type = '${FinanceTypeEnum.ADVANCE_EMPLOYEE}' AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount
          WHEN finance.type IN ('${FinanceTypeEnum.REIMBURSE}', '${FinanceTypeEnum.SETTLEMENT}') AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN -finance.amount
          ELSE 0 
        END
      )`,
        "sum",
      )
      .getRawOne();
    const balance = parseFloat(sum.sum) || 0;

    return balance;
  }

  // tính tổng số dư đầu, tạm ứng tăng, hoàn ứng, quyết toán trong kỳ, số dư cuối kỳ của toàn bộ nhân viên
  async getAllEmployeeAdvanceBalanceSummary(
    data: GetAdvanceEmployeeSummaryDto,
    req?: Request,
    manager?: IEntityManager,
  ) {
    const startAt = data.startAt || dayjs().tz("Asia/Ho_Chi_Minh").startOf("month").toDate();
    const endAt = data.endAt || dayjs().tz("Asia/Ho_Chi_Minh").endOf("month").toDate();

    const options: IFindOptions<Finance> = {
      where: {
        timeAt: Between(startAt, endAt),
      },
    };

    const summary: {
      beginningAdvance: number;
      advance: number;
      settlement: number;
      reimburse: number;
      endingAdvance: number;
    } = {
      beginningAdvance: 0,
      advance: 0,
      settlement: 0,
      reimburse: 0,
      endingAdvance: 0,
    };

    //? số dư tạm ứng đầu kỳ
    const beginningAdvance = await this.getEmployeeAdvanceBalance(null, startAt, manager);
    summary.beginningAdvance = beginningAdvance;

    //? tăng tạm ứng trong kỳ
    const advance = await this.sumByOptions("amount", {
      ...options,
      where: {
        ...options.where,
        type: FinanceTypeEnum.ADVANCE_EMPLOYEE,
        status: ExpenseApprovalStatusEnum.APPROVED,
      },
    });
    summary.advance = advance;

    //? tổng quyết toán trong kỳ
    const settlement = await this.sumByOptions("amount", {
      ...options,
      where: {
        ...options.where,
        type: FinanceTypeEnum.SETTLEMENT,
        status: ExpenseApprovalStatusEnum.APPROVED,
      },
    });
    summary.settlement = settlement;

    //? tổng hoàn ứng trong kỳ
    const reimburse = await this.sumByOptions("amount", {
      ...options,
      where: {
        ...options.where,
        type: FinanceTypeEnum.REIMBURSE,
        status: ExpenseApprovalStatusEnum.APPROVED,
      },
    });
    summary.reimburse = reimburse;

    //? số dư tạm ứng cuối kỳ
    const endingAdvance = await this.getEmployeeAdvanceBalance(null, endAt, manager);
    summary.endingAdvance = endingAdvance;

    return summary;
  }
}
