import { Request } from "express";
import { injectable, inject } from "inversify";
import { Employee } from "@/database/models/Employee";
import { TIME_KEEPING_TYPES } from "../timeKeeping.types";
import { TimeKeeping } from "@/database/models/TimeKeeping";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { EntityManager, FindOptionsSelect, In } from "typeorm";
import { TimeKeepingRepository } from "../timeKeeping.repository";
import { MARGIN_TYPES } from "@/modules/accountant/margin/margin.types";
import { TimeKeepingConfirm } from "@/database/models/TimeKeepingConfirm";
import { MarginRepository } from "@/modules/accountant/margin/margin.repository";
import { ADVANCE_SALARY_TYPES } from "@/modules/accountant/advanceSalary/advanceSalary.types";
import { AdvanceSalaryRepository } from "@/modules/accountant/advanceSalary/advanceSalary.repository";
import { TimeKeepingConfirmSelectFull, TimeKeepingConfirmRelations } from "./timeKeepingConfirm.select";
import { MarginStatusEnum, OtherAmountTypeEnum, TimeKeepingTypeEnum } from "@/shared/constants/constance";

const roundToTwoDecimals = (value: number) => Number(value.toFixed(2));

export interface TimeKeepingWithEmployee {
  employee: Employee;
  timeKeepings: Partial<TimeKeeping>[];
  isPaid: boolean;
  totalAdvance: number; //? tiền ứng
  advanceDetails: Partial<TimeKeeping>[];
  totalMargin: number; //? tiền ký quỹ
  marginDetails: Partial<TimeKeeping>[];
  totalUniform: number; //? tiền đồng phục
  uniformDetails: Partial<TimeKeeping>[];
  totalPenalty: number; //? tiền phạt
  penaltyDetails: Partial<TimeKeeping>[];
  totalBonus: number; //? tiền thưởng
  bonusDetails: Partial<TimeKeeping>[];
  totalDayWorked: number; // Số ngày đã làm
  totalHours: number;
  totalSalary: number;
  totalRealSalary: number;
}

@injectable()
export class TimeKeepingConfirmRepository extends BaseRepository<TimeKeepingConfirm> {
  protected entityClass = TimeKeepingConfirm;
  protected selectedFields = TimeKeepingConfirmSelectFull;
  protected relations = TimeKeepingConfirmRelations;

  constructor(
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
    @inject(MARGIN_TYPES.MarginRepository) private marginRepository: MarginRepository,
    @inject(ADVANCE_SALARY_TYPES.AdvanceSalaryRepository) private advanceSalaryRepository: AdvanceSalaryRepository,
  ) {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<TimeKeepingConfirm> | undefined): void {
    this.selectedFields = selectedFields || TimeKeepingConfirmSelectFull;
    this.relations = TimeKeepingConfirmRelations;
  }

  async findByTKCId(
    id: string,
    manager?: EntityManager,
    includeDeleted?: boolean,
    req?: Request,
  ): Promise<TimeKeepingWithEmployee | null> {
    const result = await super.findById(id, manager, includeDeleted, req);

    if (!result) {
      return null;
    }

    let data: TimeKeepingWithEmployee = {
      employee: result?.employee!,
      timeKeepings: [],
      isPaid: result?.isPaid ?? false,
      totalAdvance: result?.totalAdvance || 0,
      advanceDetails: [],
      totalMargin: result?.totalMargin || 0,
      marginDetails: [],
      totalUniform: result?.totalUniform || 0,
      uniformDetails: [],
      totalPenalty: result?.totalPenalty || 0,
      penaltyDetails: [],
      totalBonus: result?.totalBonus || 0,
      bonusDetails: [],
      totalDayWorked: result?.totalDayWorked || 0, // Số ngày đã làm
      totalHours: roundToTwoDecimals(result.totalHours || 0),
      totalSalary: result.totalSalary || 0,
      totalRealSalary: result.totalRealSalary || 0,
    };

    if (result && result.timeKeepings) {
      if (Array.isArray(result.timeKeepings) && result.timeKeepings.length > 0) {
        result.timeKeepings.forEach((tk) => {
          const timeKeeping = {
            ...tk,
            totalHours: roundToTwoDecimals(tk.totalHours || 0),
          };

          if (tk.otherAmountType === null) {
            data.timeKeepings.push(timeKeeping);
          } else if (tk.otherAmountType === OtherAmountTypeEnum.ADVANCE_SALARY) {
            data.advanceDetails.push(timeKeeping);
          } else if (tk.otherAmountType === OtherAmountTypeEnum.MARGIN) {
            data.marginDetails.push(timeKeeping);
          } else if (tk.otherAmountType === OtherAmountTypeEnum.UNIFORM) {
            data.uniformDetails.push(timeKeeping);
          } else if (tk.otherAmountType === OtherAmountTypeEnum.PENALTY) {
            data.penaltyDetails.push(timeKeeping);
          } else if (
            tk.otherAmountType === OtherAmountTypeEnum.BONUS ||
            tk.otherAmountType === OtherAmountTypeEnum.REFERRER_ORDER ||
            tk.otherAmountType === OtherAmountTypeEnum.CREATE_ORDER ||
            tk.otherAmountType === OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER
          ) {
            data.bonusDetails.push(timeKeeping);
          }
        });

        data.timeKeepings.sort((a, b) => a.timeAt!.getTime() - b.timeAt!.getTime());
        data.advanceDetails.sort((a, b) => a.timeAt!.getTime() - b.timeAt!.getTime());
        data.marginDetails.sort((a, b) => a.timeAt!.getTime() - b.timeAt!.getTime());
        data.uniformDetails.sort((a, b) => a.timeAt!.getTime() - b.timeAt!.getTime());
        data.penaltyDetails.sort((a, b) => a.timeAt!.getTime() - b.timeAt!.getTime());
        data.bonusDetails.sort((a, b) => a.timeAt!.getTime() - b.timeAt!.getTime());
      }
    }

    return data;
  }

  async calculateTimeKeepingConfirm(tk: TimeKeepingConfirm, manager?: EntityManager): Promise<void> {
    const timeKeepings = await this.timeKeepingRepository.findByOptions(
      {
        where: { timeKeepingConfirmId: tk.id },
      },
      manager,
    );
    const totalHours = roundToTwoDecimals(timeKeepings.reduce((sum, tk) => sum + (tk.totalHours || 0), 0));
    const totalSalary = timeKeepings.reduce((sum, tk) => sum + (tk.salary || 0), 0);
    const totalAdvance = timeKeepings.reduce((sum, tk) => {
      if (tk.otherAmountType === OtherAmountTypeEnum.ADVANCE_SALARY) {
        return sum + (tk.otherAmount || 0);
      }
      return sum;
    }, 0);
    const totalMargin = timeKeepings.reduce((sum, tk) => {
      if (tk.otherAmountType === OtherAmountTypeEnum.MARGIN) {
        if (tk.type === TimeKeepingTypeEnum.OUT) {
          return sum + (tk.otherAmount || 0);
        } else {
          return sum - (tk.otherAmount || 0);
        }
      }
      return sum;
    }, 0);
    const totalUniform = timeKeepings.reduce((sum, tk) => {
      if (tk.otherAmountType === OtherAmountTypeEnum.UNIFORM) {
        if (tk.type === TimeKeepingTypeEnum.OUT) {
          return sum + (tk.otherAmount || 0);
        } else {
          return sum - (tk.otherAmount || 0);
        }
      }
      return sum;
    }, 0);
    const totalPenalty = timeKeepings.reduce((sum, tk) => {
      if (tk.otherAmountType === OtherAmountTypeEnum.PENALTY) {
        return sum + (tk.otherAmount || 0);
      }
      return sum;
    }, 0);
    const totalBonus = timeKeepings.reduce((sum, tk) => {
      if (
        tk.otherAmountType === OtherAmountTypeEnum.BONUS ||
        tk.otherAmountType === OtherAmountTypeEnum.REFERRER_ORDER ||
        tk.otherAmountType === OtherAmountTypeEnum.CREATE_ORDER ||
        tk.otherAmountType === OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER
      ) {
        return sum + (tk.otherAmount || 0);
      }
      return sum;
    }, 0);
    const totalRealSalary =
      totalSalary +
      (totalUniform || 0) +
      (totalMargin || 0) +
      (totalBonus || 0) -
      (totalAdvance || 0) -
      (totalPenalty || 0);

    await this.update(
      tk.id,
      {
        totalHours,
        totalSalary,
        totalAdvance,
        totalMargin,
        totalUniform,
        totalPenalty,
        totalBonus,
        totalRealSalary,
      },
      manager,
    );
  }

  async updatePaidStatus(id: string, manager?: EntityManager): Promise<void> {
    console.log("start updatePaidStatus");
    const tkConfirm = await this.findById(id, manager);
    if (!tkConfirm) {
      return;
    }
    await this.update(
      id,
      {
        isPaid: true,
      },
      manager,
    );

    const tks = await this.timeKeepingRepository.findByOptions({
      where: { timeKeepingConfirmId: id },
    });

    if (tks.length === 0) {
      return;
    }

    await this.timeKeepingRepository.updateOptions(
      {
        isPaid: true,
      },
      { timeKeepingConfirmId: id },
      manager,
    );

    //? lấy danh sách các time keeping có loại là ký quỹ để cập nhật trạng thái đã thanh toán, chỉ lấy các bản ghi có type là OUT (hoàn trả lại ký quỹ cho nhân viên)
    const marginTkIds = tks
      .filter(
        (tk) =>
          (tk.otherAmountType === OtherAmountTypeEnum.MARGIN || tk.otherAmountType === OtherAmountTypeEnum.UNIFORM) &&
          tk.type === TimeKeepingTypeEnum.OUT,
      )
      .map((tk) => tk.marginId);

    if (marginTkIds.length > 0) {
      const marginUpdateResult = await this.marginRepository.findByOptions(
        {
          where: { id: In(marginTkIds) },
        },
        manager,
      );

      if (marginUpdateResult.length > 0) {
        await this.marginRepository.updateMany(
          marginUpdateResult.map((margin) => margin.id),
          {
            status: MarginStatusEnum.APPROVED,
          },
          manager,
        );
      }
    }

    //? lấy danh sách các khoản tạm ứng lương để cập nhật trạng thái đã thanh toán
    const advanceTkIds = tks
      .filter((tk) => tk.otherAmountType === OtherAmountTypeEnum.ADVANCE_SALARY)
      .map((tk) => tk.advanceSalaryId);

    console.log("advanceTkIds", advanceTkIds);

    if (advanceTkIds.length > 0) {
      await this.advanceSalaryRepository.updateOptions(
        {
          isDeductedAdvanceSalary: true,
        },
        { id: In(advanceTkIds) },
        manager,
      );
    }
  }

  async updateNotPaidStatus(id: string, manager?: EntityManager): Promise<void> {
    console.log("start updatePaidStatus");
    const tkConfirm = await this.findById(id, manager);
    if (!tkConfirm) {
      return;
    }
    await this.update(
      id,
      {
        isPaid: true,
      },
      manager,
    );

    const tks = await this.timeKeepingRepository.findByOptions({
      where: { timeKeepingConfirmId: id },
    });

    if (tks.length === 0) {
      return;
    }

    await this.timeKeepingRepository.updateOptions(
      {
        isPaid: true,
      },
      { timeKeepingConfirmId: id },
      manager,
    );

    //? lấy danh sách các time keeping có loại là ký quỹ để cập nhật trạng thái đã thanh toán, chỉ lấy các bản ghi có type là OUT (hoàn trả lại ký quỹ cho nhân viên)
    const marginTkIds = tks
      .filter(
        (tk) =>
          (tk.otherAmountType === OtherAmountTypeEnum.MARGIN || tk.otherAmountType === OtherAmountTypeEnum.UNIFORM) &&
          tk.type === TimeKeepingTypeEnum.OUT,
      )
      .map((tk) => tk.id);

    if (marginTkIds.length > 0) {
      await this.marginRepository.updateMany(
        marginTkIds,
        {
          status: MarginStatusEnum.APPROVED,
        },
        manager,
      );
    }

    //? lấy danh sách các khoản tạm ứng lương để cập nhật trạng thái đã thanh toán
    const advanceTkIds = tks
      .filter((tk) => tk.otherAmountType === OtherAmountTypeEnum.ADVANCE_SALARY)
      .map((tk) => tk.advanceSalaryId);

    console.log("advanceTkIds", advanceTkIds);

    if (advanceTkIds.length > 0) {
      await this.advanceSalaryRepository.updateOptions(
        {
          isDeductedAdvanceSalary: true,
        },
        { id: In(advanceTkIds) },
        manager,
      );
    }
  }

  async actionAfterDelete(id: string, req?: Request, manager?: EntityManager): Promise<void> {
    const timeKeepings = await this.timeKeepingRepository.findByOptions(
      {
        where: { timeKeepingConfirmId: id },
      },
      manager,
    );

    if (timeKeepings.length === 0) {
      return;
    }

    await this.timeKeepingRepository.updateMany(
      timeKeepings.map((tk) => tk.id),
      { timeKeepingConfirmId: null, isPaid: false },
      manager,
    );

    //? tìm trong timeKeepings xem có bản ghi cho ký quỹ hoặc đồng phục nào không, và type = IN, nếu có thì xóa luôn khoản ký quỹ hoặc đồng phục đó
    const marginTimeKeepings = timeKeepings.filter(
      (tk) =>
        (tk.otherAmountType === OtherAmountTypeEnum.MARGIN || tk.otherAmountType === OtherAmountTypeEnum.UNIFORM) &&
        tk.type === TimeKeepingTypeEnum.IN,
    );

    if (marginTimeKeepings.length > 0) {
      for (const tk of marginTimeKeepings) {
        if (tk.marginId) {
          //? xóa reference marginId trên tất cả time_keepings (cả IN lẫn OUT) trước khi xóa margin để tránh lỗi FK
          await this.timeKeepingRepository.updateOptions(
            { marginId: null } as any,
            { marginId: tk.marginId } as any,
            manager,
          );

          //? xóa bản ghi margin sau khi đã clear FK
          await this.marginRepository.delete(tk.marginId, manager);
        }

        //? delete luôn bản ghi time keeping có type là ký quỹ hoặc đồng phục đó
        await this.timeKeepingRepository.delete(tk.id, manager);
      }
    }
  }
}
