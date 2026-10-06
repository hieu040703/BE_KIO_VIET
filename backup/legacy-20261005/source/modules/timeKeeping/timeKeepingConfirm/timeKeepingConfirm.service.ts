import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { TimeKeepingConfirmRepository } from "./timeKeepingConfirm.repository";
import { TIME_KEEPING_CONFIRM_TYPES } from "./timeKeepingConfirm.types";
import { TimeKeepingConfirm } from "@/database/models/TimeKeepingConfirm";
import {
  TimeKeepingConfirmRelations,
  TimeKeepingConfirmRelationsForList,
  TimeKeepingConfirmSelectFull,
  TimeKeepingConfirmSelectList,
} from "./timeKeepingConfirm.select";
import { ApiResponse, IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { DeepPartial, FindOptionsWhere, In } from "typeorm";
import { TimeKeepingRepository } from "../timeKeeping.repository";
import { TIME_KEEPING_TYPES } from "../timeKeeping.types";
import { ExportTimeSheetPdfDto, UpdateTimeKeepingConfirmDto } from "./timeKeepingConfirm.validator";
import {
  FINANCE_TYPES,
  FinanceCreationSourceEnum,
} from "@/modules/accountant/finance/finance.types";
import { FinanceService } from "@/modules/accountant/finance/finance.service";
import { CreateFinanceDto } from "@/modules/accountant/finance/finance.validator";
import {
  ExpenseApprovalStatusEnum,
  FinanceTypeEnum,
  MarginTypeEnum,
  OtherAmountTypeEnum,
  TimeKeepingTypeEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { exportTimeKeepingPfd } from "./handles/exportTKCPdf";
import { EMPLOYEE_TYPES } from "@/modules/employee/employee.types";
import { EmployeeRepository } from "@/modules/employee/employee.repository";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { TimeKeepingWithEmployee } from "../timeKeeping.service";
import dayjs from "dayjs";
import { CreateTimeKeepingDto } from "../timeKeeping.validator";
import { MarginService } from "@/modules/accountant/margin/margin.service";
import { MARGIN_TYPES } from "@/modules/accountant/margin/margin.types";
import { CreateMarginDto } from "@/modules/accountant/margin/margin.validator";
import { ORDER_TYPES } from "@/modules/order/order.types";
import { OrderRepository } from "@/modules/order/order.repository";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";

@injectable()
export class TimeKeepingConfirmService extends BaseService<TimeKeepingConfirm> {
  protected relations = TimeKeepingConfirmRelations;
  protected selectedFields = TimeKeepingConfirmSelectFull;
  protected relationsForList = TimeKeepingConfirmRelationsForList;
  protected selectedFieldsForList = TimeKeepingConfirmSelectList;
  protected searchableFields = ["employee.name", "employee.code"] as any;
  constructor(
    @inject(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmRepository)
    private timeKeepingConfirmRepository: TimeKeepingConfirmRepository,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
    @inject(FINANCE_TYPES.FinanceService) private financeService: FinanceService,
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
    @inject(MARGIN_TYPES.MarginService) private marginService: MarginService,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(timeKeepingConfirmRepository);
  }

  async findByTKCId(
    id: string,
    manager?: IEntityManager,
    includeDeleted?: boolean,
    req?: Request,
  ): Promise<ApiResponse<TimeKeepingConfirm | null>> {
    const result = await this.timeKeepingConfirmRepository.findByTKCId(id, manager, includeDeleted, req);

    if (req?.user?.role === UserRoleEnum.EMPLOYEE && result?.employee?.id !== req.user.employeeId) {
      throw new NotFoundError("Không tìm thấy phiếu chấm công");
    }

    return ApiResponseHandler.getSuccess("OK", result);
  }

  async validateBeforeQuery(
    options: IFindOptions<TimeKeepingConfirm>,
    req?: Request,
    _manager?: IEntityManager,
  ): Promise<void> {
    if (req?.user?.role !== UserRoleEnum.EMPLOYEE) {
      return;
    }

    const employeeFilter = req.user.employeeId ? { employeeId: req.user.employeeId } : { id: In([]) };

    if (Array.isArray(options.where)) {
      options.where = options.where.map((condition) => ({
        ...(condition as FindOptionsWhere<TimeKeepingConfirm>),
        ...employeeFilter,
      })) as FindOptionsWhere<TimeKeepingConfirm>[];
      return;
    }

    options.where = {
      ...((options.where || {}) as FindOptionsWhere<TimeKeepingConfirm>),
      ...employeeFilter,
    };
  }

  async validateBeforeCreate(
    data: DeepPartial<TimeKeepingConfirm>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const bodyData = req?.body;
  }

  async actionAfterCreate(data: TimeKeepingConfirm, req?: Request, manager?: IEntityManager): Promise<void> {
    const dataTimeKeeping = req?.body.dataTimeKeeping as TimeKeepingWithEmployee;
    const tkIds = (req?.body.timeKeepingIds as string[]) || [];

    // ID bản ghi chấm công đã có để update
    const timeKeepingIds: string[] = [];

    // Dữ liệu bản ghi chấm công mới cần tạo (chưa có ID)
    const dataCreateTimeKeeping: CreateTimeKeepingDto[] = [];
    const orderRewardPaidUpdates: Array<{
      orderId: string;
      field: "isReferrerPaid" | "isPaidForEmployeeCreateOrder" | "hasAllocatedRevenue";
    }> = [];

    const getOrderRewardPaidField = (
      otherAmountType: OtherAmountTypeEnum,
    ): "isReferrerPaid" | "isPaidForEmployeeCreateOrder" | "hasAllocatedRevenue" => {
      if (otherAmountType === OtherAmountTypeEnum.CREATE_ORDER) return "isPaidForEmployeeCreateOrder";
      if (otherAmountType === OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER) return "hasAllocatedRevenue";
      return "isReferrerPaid";
    };

    if (dataTimeKeeping.timeKeepings.length > 0) {
      dataTimeKeeping.timeKeepings.forEach((item) => {
        if (item.details.length > 0) {
          item.details.forEach((detail) => {
            if (detail.id && tkIds.includes(detail.id)) timeKeepingIds.push(detail.id);
          });
        }
      });
    }

    if (dataTimeKeeping.advanceDetails.length > 0) {
      dataTimeKeeping.advanceDetails.forEach((advanceDetail) => {
        if (advanceDetail.id && tkIds.includes(advanceDetail.id)) timeKeepingIds.push(advanceDetail.id);
      });
    }

    if (dataTimeKeeping.penaltyDetails.length > 0) {
      dataTimeKeeping.penaltyDetails.forEach((penaltyDetail) => {
        if (penaltyDetail.id && tkIds.includes(penaltyDetail.id)) timeKeepingIds.push(penaltyDetail.id);
      });
    }

    if (dataTimeKeeping.bonusDetails.length > 0) {
      dataTimeKeeping.bonusDetails.forEach((bonusDetail) => {
        if (bonusDetail.id) {
          if (!bonusDetail.id.startsWith("referrer")) {
            if (tkIds.includes(bonusDetail.id)) {
              timeKeepingIds.push(bonusDetail.id);

              if (bonusDetail.referrerOrderId) {
                orderRewardPaidUpdates.push({
                  orderId: bonusDetail.referrerOrderId,
                  field: getOrderRewardPaidField(bonusDetail.otherAmountType!),
                });
              }
            }
          } else {
            const { id, ...bonusData } = bonusDetail;

            if (tkIds.includes(bonusDetail.id)) {
              dataCreateTimeKeeping.push({
                ...bonusData,
                timeKeepingConfirmId: data.id,
                employeeId: dataTimeKeeping.employee.id,
                timeAt: new Date(),
                isPaid: true,
              });
            }
          }
        }
      });
    }

    if (dataTimeKeeping.marginDetails.length > 0) {
      dataTimeKeeping.marginDetails.forEach((marginDetail) => {
        if (marginDetail.id) {
          if (!marginDetail.id.startsWith("margin")) {
            if (tkIds.includes(marginDetail.id)) timeKeepingIds.push(marginDetail.id);
          } else {
            const { id, ...marginData } = marginDetail;

            if (tkIds.includes(marginDetail.id)) {
              dataCreateTimeKeeping.push({
                ...marginData,
                timeKeepingConfirmId: data.id,
                employeeId: dataTimeKeeping.employee.id,
                timeAt: new Date(),
                isPaid: true,
              });
            }
          }
        }
      });
    }

    if (dataTimeKeeping.uniformDetails.length > 0) {
      dataTimeKeeping.uniformDetails.forEach((uniformDetail) => {
        if (uniformDetail.id) {
          if (!uniformDetail.id.startsWith("uniform")) {
            if (tkIds.includes(uniformDetail.id)) timeKeepingIds.push(uniformDetail.id);
          } else {
            const { id, ...uniformData } = uniformDetail;
            if (tkIds.includes(uniformDetail.id)) {
              dataCreateTimeKeeping.push({
                ...uniformData,
                timeKeepingConfirmId: data.id,
                employeeId: dataTimeKeeping.employee.id,
                timeAt: new Date(),
                isPaid: true,
              });
            }
          }
        }
      });
    }

    if (timeKeepingIds.length > 0) {
      await this.timeKeepingRepository.updateMany(
        timeKeepingIds,
        { timeKeepingConfirmId: data.id, isPaid: true },
        manager,
      );
    }

    for (const { orderId, field } of orderRewardPaidUpdates) {
      await this.orderRepository.update(orderId, { [field]: true }, manager);
    }

    if (dataCreateTimeKeeping.length > 0) {
      for (const item of dataCreateTimeKeeping) {
        if (
          item.otherAmountType === OtherAmountTypeEnum.MARGIN ||
          item.otherAmountType === OtherAmountTypeEnum.UNIFORM
        ) {
          const dataCreateMargin: CreateMarginDto = {
            branchId: null,
            employeeId: data.employeeId,
            type: MarginTypeEnum.MARGIN,
            amount: item.otherAmount!,
            timeAt: new Date(),
            isAutomatic: true,
            note: ``,
          };

          if (item.otherAmountType === OtherAmountTypeEnum.UNIFORM) {
            dataCreateMargin.type = MarginTypeEnum.UNIFORM;
            dataCreateMargin.note = `Thu tiền đồng phục tự động khi chấm lương`;
          } else if (item.otherAmountType === OtherAmountTypeEnum.MARGIN) {
            dataCreateMargin.type = MarginTypeEnum.MARGIN;
            dataCreateMargin.note = `Ký quỹ tự động khi chấm lương`;
          }

          const margin = await this.marginService.create(dataCreateMargin, req, manager);

          await this.timeKeepingRepository.create(
            {
              ...item,
              marginId: margin.data.id,
            },
            manager,
          );
        } else if (
          item.otherAmountType === OtherAmountTypeEnum.BONUS ||
          item.otherAmountType === OtherAmountTypeEnum.REFERRER_ORDER ||
          item.otherAmountType === OtherAmountTypeEnum.CREATE_ORDER ||
          item.otherAmountType === OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER
        ) {
          await this.timeKeepingRepository.create(
            {
              ...item,
            },
            manager,
          );

          // cập nhật đã thanh toán bên order
          if (item.referrerOrderId) {
            const order = await this.orderRepository.findById(item.referrerOrderId!, manager);
            if (order) {
              const field = getOrderRewardPaidField(item.otherAmountType!);
              await this.orderRepository.update(item.referrerOrderId!, { [field]: true }, manager);
            }
          }
        }
      }
    }

    // await this.timeKeepingConfirmRepository.calculateTimeKeepingConfirm(data, manager);

    const employee = await this.employeeRepository.findById(data.employeeId, manager, false, req);
    if (!employee) {
      throw new Error("Không tìm thấy nhân viên");
    }

    //? tạo khoản chi lương cho nhân viên lấy từ totalRealSalary
    const dataCreateFinance: CreateFinanceDto = {
      branchId: employee.branchId,
      employeeId: data.employeeId,
      timeKeepingConfirmId: data.id,
      type: FinanceTypeEnum.SALARY,
      category: "Chi lương nhân viên",
      amount: data.totalRealSalary,
      timeAt: new Date(),
      status: ExpenseApprovalStatusEnum.PENDING,
      isDebtRelated: false,
      note: `Chi lương cho nhân viên ${employee.name} từ ${dayjs(data.startAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")} - ${dayjs(data.endAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}`,
    };

    await this.financeService.create(dataCreateFinance, req, manager, FinanceCreationSourceEnum.SYSTEM);
  }

  async updateHistory(
    id: string,
    data: UpdateTimeKeepingConfirmDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    if (manager) {
      await this.updateHistoryInTransaction(id, data, req, manager);
      return;
    }

    await this.transactionManager.withTransactionCallback(async (transactionManager) => {
      await this.updateHistoryInTransaction(id, data, req, transactionManager);
    });
  }

  private async updateHistoryInTransaction(
    id: string,
    data: UpdateTimeKeepingConfirmDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const tkHistory = await this.timeKeepingConfirmRepository.findById(id, manager, false, req);
    if (!tkHistory) {
      throw new NotFoundError("Không tìm thấy phiếu chấm công");
    }

    if (tkHistory.isPaid) {
      throw new BadRequestError("Không thể cập nhật phiếu chấm công đã được thanh toán");
    }

    if (data.removeTimeKeepingIds && data.removeTimeKeepingIds.length > 0) {
      for (const tkId of data.removeTimeKeepingIds) {
        if (!tkHistory.timeKeepings.some((tk) => tk.id === tkId)) {
          throw new NotFoundError(`Không tìm thấy chấm công với id: ${tkId} trong phiếu chấm công`);
        }
      }

      await this.timeKeepingRepository.updateMany(
        data.removeTimeKeepingIds,
        { timeKeepingConfirmId: null, isPaid: false },
        manager,
      );

      await this.timeKeepingConfirmRepository.calculateTimeKeepingConfirm(tkHistory, manager);

      const updatedHistory = await this.timeKeepingConfirmRepository.findById(id, manager, false, req);
      if (!updatedHistory) {
        throw new NotFoundError("Không tìm thấy phiếu chấm công");
      }

      await this.financeService.syncPendingSalaryAmount(id, updatedHistory.totalRealSalary, manager);
    }
  }

  async validateBeforeDelete(id: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const tkConfirm = await this.timeKeepingConfirmRepository.findById(id, manager, false, req);
    if (!tkConfirm) {
      throw new NotFoundError("Không tìm thấy phiếu chấm công");
    }

    if (tkConfirm.isPaid) {
      throw new BadRequestError("Không thể xóa phiếu chấm công đã được thanh toán");
    }
  }

  /**
   * Override delete: cleanup dependent records TRƯỚC khi xóa TimeKeepingConfirm,
   * wrap toàn bộ trong 1 transaction để tránh FK violation.
   *
   * Lý do override: BaseService.delete mặc định chạy `repository.delete()` trước
   * rồi mới `actionAfterDelete` — với TKC, bảng `finances` có FK trỏ tới
   * `time_keeping_confirms` (xem BE/src/database/models/Finance.ts:110) nên bước
   * delete sẽ ném FK constraint violation trước khi cleanup chạy.
   */
  async delete(id: string, req?: Request, _manager?: IEntityManager): Promise<ApiResponse<Boolean>> {
    // _manager: tham số từ BaseService.delete, không dùng — flow tự tạo transaction mới
    //   để đảm bảo cleanup + delete nằm chung 1 atomic unit.
    void _manager;
    return await this.transactionManager.withTransactionCallback(async (tx) => {
      await this.validateBeforeDelete(id, req, tx);

      const exist = await this.timeKeepingConfirmRepository.findById(id, tx, false, req);
      if (!exist) {
        throw new NotFoundError("Không tìm thấy phiếu chấm công");
      }

      // Cleanup dependent records TRƯỚC khi xóa TimeKeepingConfirm
      await this.cleanupBeforeDelete(exist, req, tx);

      // Hard delete TimeKeepingConfirm (FK từ finances đã được giải phóng)
      await this.timeKeepingConfirmRepository.delete(id, tx, req);

      return ApiResponseHandler.deleteSuccess("OK", id);
    });
  }

  /**
   * Cleanup tất cả bản ghi phụ thuộc trước khi xóa TimeKeepingConfirm.
   * Di chuyển logic từ actionAfterDelete cũ — giờ chạy TRƯỚC delete để giải phóng FK.
   */
  private async cleanupBeforeDelete(data: TimeKeepingConfirm, req?: Request, manager?: IEntityManager): Promise<void> {
    const timeKeepings = await this.timeKeepingRepository.findByOptions(
      {
        where: { timeKeepingConfirmId: data.id },
      },
      manager,
    );

    if (timeKeepings.length > 0) {
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
          //? delete luôn bản ghi time keeping có type là ký quỹ hoặc đồng phục đó
          await this.timeKeepingRepository.delete(tk.id, manager);

          if (tk.marginId) {
            //? marginId vẫn còn FK từ time_keepings, nên phải xóa time keeping trước rồi mới xóa margin
            await this.marginService.delete(tk.marginId, req, manager);
          }
        }
      }
    }

    // xóa khoản chi lương liên quan đến phiếu chấm công này
    const finances = await this.financeService.findByOptions(
      {
        where: { timeKeepingConfirmId: data.id },
      },
      req,
      manager,
    );

    for (const finance of finances.data) {
      await this.financeService.deleteLinkedTimeKeepingConfirmFinance(finance.id, req, manager);
    }
  }

  async exportTimeSheetPdf(data: ExportTimeSheetPdfDto): Promise<ApiResponse<string>> {
    const resultPath = await exportTimeKeepingPfd(data.timeKeepingConfirmIds);
    return ApiResponseHandler.getSuccess("OK", resultPath);
  }

  async calculateTimeKeepingConfirm(data: any, req?: Request, manager?: IEntityManager): Promise<void> {
    const id = data.timeKeepingConfirmId as string;
    const tkConfirm = await this.timeKeepingConfirmRepository.findById(id, manager);
    if (!tkConfirm) {
      throw new NotFoundError("Không tìm thấy phiếu chấm công");
    }

    await this.timeKeepingConfirmRepository.calculateTimeKeepingConfirm(tkConfirm, manager);
  }
}
