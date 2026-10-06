import { BaseRepository } from "@/shared/base/BaseRepository";
import { TimeKeeping } from "@/database/models/TimeKeeping";
import { FindOptionsSelect, In, SelectQueryBuilder } from "typeorm";
import { TimeKeepingSelectFull, TimeKeepingRelations } from "./timeKeeping.select";
import { injectable, inject } from "inversify";
import { ConfirmTimeKeepingDto, CreateTimeKeepingDto } from "./timeKeeping.validator";
import { OrderEmployee } from "@/database/models/OrderEmployee";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { OtherAmountTypeEnum, TimeKeepingTypeEnum, UserRoleEnum } from "@/shared/constants/constance";

@injectable()
export class TimeKeepingRepository extends BaseRepository<TimeKeeping> {
  protected entityClass = TimeKeeping;
  protected selectedFields = TimeKeepingSelectFull;
  protected relations = TimeKeepingRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<TimeKeeping> | undefined): void {
    this.selectedFields = selectedFields || TimeKeepingSelectFull;
    this.relations = TimeKeepingRelations;
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<TimeKeeping>,
    _options: IFindOptions<TimeKeeping>,
    req?: Request,
  ): Promise<void> {
    if (req?.user?.role !== UserRoleEnum.EMPLOYEE) {
      return;
    }

    if (!req.user.employeeId) {
      qb.andWhere("1 = 0");
      return;
    }

    qb.andWhere("entity.employeeId = :employeeScopeId", {
      employeeScopeId: req.user.employeeId,
    });
  }

  async createTimeKeepingForEmployeeInOrder(orderEmployee: OrderEmployee, manager?: any): Promise<void> {
    if (orderEmployee.timeAt) {
      const dataCreate: CreateTimeKeepingDto = {
        type: TimeKeepingTypeEnum.OUT, // lương của nhân viên nên phải trả
        employeeId: orderEmployee.employeeId,
        orderEmployeeId: orderEmployee.id,
        timeAt: orderEmployee.timeAt || null,
        startTime: orderEmployee.startTime || null,
        endTime: orderEmployee.endTime || null,
        totalHours: orderEmployee.totalHours || null,
        salary: orderEmployee.salary || null,
        note: orderEmployee.note || null,
      };

      await this.create(dataCreate, manager);
    }
  }

  async updateTimeKeepingForEmployeeInOrder(orderEmployee: OrderEmployee, manager?: any): Promise<TimeKeeping | null> {
    const timeKeeping = await this.findOne(
      {
        orderEmployeeId: orderEmployee.id,
      },
      manager,
    );

    if (timeKeeping) {
      timeKeeping.employeeId = orderEmployee.employeeId;
      timeKeeping.timeAt = orderEmployee.timeAt || null;
      timeKeeping.startTime = orderEmployee.startTime || null;
      timeKeeping.endTime = orderEmployee.endTime || null;
      timeKeeping.salary = orderEmployee.salary || null;
      timeKeeping.totalHours = orderEmployee.totalHours || null;
      timeKeeping.note = orderEmployee.note || null;

      return await this.update(timeKeeping.id, timeKeeping, manager);
    } else {
      await this.createTimeKeepingForEmployeeInOrder(orderEmployee, manager);
    }

    return null;
  }

  async deleteTimeKeepingForEmployeeInOrder(orderEmployee: OrderEmployee, manager?: any): Promise<void> {
    await this.deleteWithOption(
      {
        orderEmployeeId: orderEmployee.id,
      },
      manager,
    );
  }

  async validateConfirmTimeKeeping(
    data: ConfirmTimeKeepingDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<boolean> {
    // const timeKeepings = await this.findByOptions(
    //   {
    //     where: {
    //       id: In(data.timeKeepingIds),
    //       isPaid: false,
    //     },
    //   },
    //   manager,
    // );

    // if (timeKeepings.length !== data.timeKeepingIds.length) {
    //   throw new BadRequestError("Có một số bảng chấm công đã được thanh toán hoặc không tồn tại");
    // }

    return true;
  }

  // tính tổng số lương làm việc của tất cả nhân viên trong một khoảng thời gian
  async calculateTotalSalaryInTimeRange(
    startAt?: Date,
    endAt?: Date,
    employeeIds?: string[],
    branchId?: string,
    isPaid?: boolean,
    manager?: IEntityManager,
  ): Promise<number> {
    const qb = this.getRepository(manager).createQueryBuilder("timeKeeping");

    qb.select("SUM(timeKeeping.salary)", "totalSalary");

    if (isPaid !== undefined) {
      qb.where("timeKeeping.isPaid = :isPaid", { isPaid });
    }

    if (startAt && endAt) {
      qb.andWhere("timeKeeping.timeAt BETWEEN :startAt AND :endAt", { startAt, endAt });
    }

    if (employeeIds && employeeIds.length > 0) {
      qb.andWhere("timeKeeping.employeeId IN (:...employeeIds)", { employeeIds });
    }

    // join thêm bảng employee để filter theo chi nhánh
    if (branchId) {
      qb.innerJoin("timeKeeping.employee", "employee").andWhere("employee.branchId = :branchId", { branchId });
    }

    const result = await qb.getRawOne();
    return parseFloat(result.totalSalary) || 0;
  }

  // tính tổng số giờ làm việc của tất cả nhân viên trong một khoảng thời gian
  async calculateTotalHoursInTimeRange(
    startAt?: Date,
    endAt?: Date,
    employeeIds?: string[],
    manager?: IEntityManager,
  ): Promise<number> {
    const qb = this.getRepository(manager).createQueryBuilder("timeKeeping");

    qb.select("SUM(timeKeeping.totalHours)", "totalHours").where("timeKeeping.isPaid = false");

    if (startAt && endAt) {
      qb.andWhere("timeKeeping.timeAt BETWEEN :startAt AND :endAt", { startAt, endAt });
    }

    if (employeeIds && employeeIds.length > 0) {
      qb.andWhere("timeKeeping.employeeId IN (:...employeeIds)", { employeeIds });
    }

    const result = await qb.getRawOne();
    return parseFloat(result.totalHours) || 0;
  }

  // tính tổng số lương thực tế của tất cả nhân viên trong một khoảng thời gian
  async calculateTotalRealSalaryInTimeRange(
    startAt?: Date,
    endAt?: Date,
    employeeIds?: string[],
    manager?: IEntityManager,
  ): Promise<number> {
    const qb = this.getRepository(manager).createQueryBuilder("timeKeeping");

    qb.select(
      `COALESCE(SUM(CASE WHEN timeKeeping.salary IS NOT NULL THEN timeKeeping.salary ELSE 0 END), 0) -
       COALESCE(SUM(CASE WHEN timeKeeping.otherAmountType = '${OtherAmountTypeEnum.ADVANCE_SALARY}' THEN timeKeeping.otherAmount ELSE 0 END), 0) +
       COALESCE(SUM(CASE WHEN timeKeeping.otherAmountType = '${OtherAmountTypeEnum.MARGIN}' THEN timeKeeping.otherAmount ELSE 0 END), 0) -
       COALESCE(SUM(CASE WHEN timeKeeping.otherAmountType = '${OtherAmountTypeEnum.UNIFORM}' THEN timeKeeping.otherAmount ELSE 0 END), 0) -
       COALESCE(SUM(CASE WHEN timeKeeping.otherAmountType = '${OtherAmountTypeEnum.PENALTY}' THEN timeKeeping.otherAmount ELSE 0 END), 0) +
       COALESCE(SUM(CASE WHEN timeKeeping.otherAmountType IN ('${OtherAmountTypeEnum.BONUS}', '${OtherAmountTypeEnum.REFERRER_ORDER}', '${OtherAmountTypeEnum.CREATE_ORDER}', '${OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER}') THEN timeKeeping.otherAmount ELSE 0 END), 0)`,
      "totalRealSalary",
    ).where("timeKeeping.isPaid = false");

    if (startAt && endAt) {
      qb.andWhere("timeKeeping.timeAt BETWEEN :startAt AND :endAt", { startAt, endAt });
    }

    if (employeeIds && employeeIds.length > 0) {
      qb.andWhere("timeKeeping.employeeId IN (:...employeeIds)", { employeeIds });
    }

    const result = await qb.getRawOne();
    return parseFloat(result.totalRealSalary) || 0;
  }

  //? tính tổng số ngày làm việc của 1 nhân viên trong một khoảng thời gian(hoặc tất cả thời gian)
  async calculateTotalWorkingDaysOfEmployee(
    employeeId: string,
    startAt?: Date,
    endAt?: Date,
    manager?: IEntityManager,
  ): Promise<number> {
    const qb = this.getRepository(manager).createQueryBuilder("timeKeeping");

    qb.select("COUNT(DISTINCT DATE(timeKeeping.timeAt AT TIME ZONE 'Asia/Ho_Chi_Minh'))", "totalWorkingDays").where(
      "timeKeeping.employeeId = :employeeId",
      {
        employeeId,
      },
    );

    qb.andWhere("timeKeeping.deletedAt IS NULL");

    if (startAt && endAt) {
      qb.andWhere("timeKeeping.timeAt BETWEEN :startAt AND :endAt", { startAt, endAt });
    }

    const result = await qb.getRawOne();
    return parseInt(result.totalWorkingDays) || 0;
  }
}
