import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { TimeKeepingRepository } from "./timeKeeping.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { TIME_KEEPING_TYPES } from "./timeKeeping.types";
import { COMMON_TYPES } from "../common/common.types";
import { TimeKeeping } from "@/database/models/TimeKeeping";
import { TimeKeepingRelations, TimeKeepingSelectBasic, TimeKeepingSelectFull } from "./timeKeeping.select";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { Request } from "express";
import { EMPLOYEE_TYPES } from "../employee/employee.types";
import { EmployeeRepository } from "../employee/employee.repository";
import { Between, In, IsNull, Not, Or } from "typeorm";
import { Employee } from "@/database/models/Employee";
import {
  MarginStatusEnum,
  MarginTypeEnum,
  OtherAmountTypeEnum,
  TimeKeepingTypeEnum,
  EmployeeStatusType,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { ORDER_EMPLOYEE_TYPES } from "../order/orderEmployee/orderEmployee.types";
import { OrderEmployeeRepository } from "../order/orderEmployee/orderEmployee.repository";
import {
  ConfirmTimeKeepingDto,
  CreateTimeKeepingDto,
  CreateTimeKeepingWithOrderDto,
  TimeKeepingQueryDto,
} from "./timeKeeping.validator";
import dayjs from "dayjs";
import { BadRequestError } from "@/shared/types/errors";
import { TimeKeepingConfirmService } from "./timeKeepingConfirm/timeKeepingConfirm.service";
import { TIME_KEEPING_CONFIRM_TYPES } from "./timeKeepingConfirm/timeKeepingConfirm.types";
import { CreateTimeKeepingConfirmDto } from "./timeKeepingConfirm/timeKeepingConfirm.validator";
import { MARGIN_TYPES } from "../accountant/margin/margin.types";
import { MarginRepository } from "../accountant/margin/margin.repository";
import { config } from "@/shared/config/env";
import { ORDER_TYPES } from "../order/order.types";
import { OrderRepository } from "../order/order.repository";
import { ORDER_LEADER_TYPES } from "../order/orderLeader/orderLeader.types";
import { OrderLeaderRepository } from "../order/orderLeader/orderLeader.repository";
import { OrderStatusEnum } from "@/shared/constants/constance";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
import logger from "@/shared/utils/logger";

export interface TimeKeepingWithEmployee {
  employee: Employee;
  timeKeepings: {
    date: string;
    hours: number;
    salary: number;
    salaryNotPaid: number;
    details: Partial<TimeKeeping>[];
  }[];
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

  numberOfPenalty: number; // Số lần phạt
  isMargin: boolean; // Có ký quỹ không
  isUniform: boolean; // Có đồng phục không

  totalDayOff: number; // Số ngày nghỉ
  totalHours: number;
  totalSalary: number;
  totalRealSalary: number;
  totalSalaryNotPaid: number;
}

@injectable()
export class TimeKeepingService extends BaseService<TimeKeeping> {
  protected relations = TimeKeepingRelations;
  protected selectedFields = TimeKeepingSelectFull;
  constructor(
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeRepository) private orderEmployeeRepository: OrderEmployeeRepository,
    @inject(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmService)
    private timeKeepingConfirmService: TimeKeepingConfirmService,
    @inject(MARGIN_TYPES.MarginRepository) private marginRepository: MarginRepository,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(ORDER_LEADER_TYPES.OrderLeaderRepository) private orderLeaderRepository: OrderLeaderRepository,
  ) {
    super(timeKeepingRepository);
  }

  async getTimeKeepingByAllEmployeeAndDate(
    data: TimeKeepingQueryDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<TimeKeepingWithEmployee[]>> {
    const startAt = data.startAt
      ? dayjs(data.startAt).tz("Asia/Ho_Chi_Minh").toDate()
      : dayjs().startOf("month").tz("Asia/Ho_Chi_Minh").toDate();
    const endAt = data.endAt
      ? dayjs(data.endAt).tz("Asia/Ho_Chi_Minh").toDate()
      : dayjs().endOf("month").tz("Asia/Ho_Chi_Minh").toDate();

    const isEmployee = req?.user?.role === UserRoleEnum.EMPLOYEE;
    const employeeId = req?.user?.employeeId;

    if (isEmployee && !employeeId) {
      return ApiResponseHandler.getSuccess(
        "OK",
        [],
        {
          totalRecords: 0,
          currentPage: data.page || 1,
          size: data.size || 10,
          totalPages: 0,
        },
        { totalHours: 0, totalSalary: 0, totalRealSalary: 0 },
      );
    }

    const requestedEmployeeIds = isEmployee && employeeId ? [employeeId] : data.employeeIds;

    let options: any = {
      page: data.page,
      size: data.size,
      keyword: data.keyword,
      // Loại trừ nhân viên đã nghỉ việc (status = INACTIVE) khỏi bảng chấm công.
      // Áp dụng cho cả query phân trang lẫn query tính tổng (allEmployees).
      where: {
        status: Not(EmployeeStatusType.INACTIVE),
      },
    };

    let totalSalary = 0;
    let totalHours = 0;
    let totalRealSalary = 0;

    if (requestedEmployeeIds && requestedEmployeeIds.length > 0) {
      options = {
        ...options,
        where: {
          ...options.where,
          id: In(requestedEmployeeIds),
        },
      };
    }

    const employees = await this.employeeRepository.findWithPagination(options, manager);

    const employeeIds = employees.data.map((emp) => emp.id);

    //? early return nếu không có nhân viên
    if (employeeIds.length === 0) {
      return ApiResponseHandler.getSuccess(
        "OK",
        [],
        {
          totalRecords: 0,
          currentPage: data.page || 1,
          size: data.size || 10,
          totalPages: 0,
        },
        { totalHours: 0, totalSalary: 0, totalRealSalary: 0 },
      );
    }

    //? get all timeKeeping within date range and employee list
    const timeKeepings = await this.timeKeepingRepository.findWithPagination(
      {
        page: 1,
        size: 1000000,
        where: {
          timeAt: Between(startAt, endAt),
          employeeId: In(employeeIds),
          // isPaid: false,
          isCollected: false, // những khoản công ty đã thu rồi thì bỏ qua
        },
        select: {
          ...TimeKeepingSelectBasic,
          orderEmployee: {
            id: true,
            orderId: true,
            order: {
              name: true,
              code: true,
            },
          },
        },
        relations: {
          orderEmployee: {
            order: true,
          },
        },
      },
      manager,
      false,
    );

    const allEmployees = await this.employeeRepository.findWithPagination(
      {
        ...options,
        page: 1,
        size: 1000000,
      },
      manager,
    );

    totalSalary = await this.timeKeepingRepository.calculateTotalSalaryInTimeRange(
      startAt,
      endAt,
      allEmployees.data.map((emp) => emp.id),
      undefined,
      false,
      manager,
    );

    totalHours = await this.timeKeepingRepository.calculateTotalHoursInTimeRange(
      startAt,
      endAt,
      allEmployees.data.map((emp) => emp.id),
      manager,
    );

    totalRealSalary = await this.timeKeepingRepository.calculateTotalRealSalaryInTimeRange(
      startAt,
      endAt,
      allEmployees.data.map((emp) => emp.id),
      manager,
    );

    //? Pre-index: nhóm timeKeeping theo employeeId + ngày => O(1) lookup thay vì O(n) filter
    const tkIndex = new Map<string, TimeKeeping[]>();
    for (const tk of timeKeepings.data) {
      const dateStr = dayjs(tk.timeAt).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
      const key = `${tk.employeeId}_${dateStr}`;
      let arr = tkIndex.get(key);
      if (!arr) {
        arr = [];
        tkIndex.set(key, arr);
      }
      arr.push(tk);
    }

    const transformTimeKeeping = (tk: TimeKeeping) => ({
      id: tk.id,
      type: tk.type,
      timeAt: tk.timeAt,
      startTime: tk.startTime,
      endTime: tk.endTime,
      totalHours: tk.totalHours,
      salary: tk.salary,
      advanceSalaryId: tk.advanceSalaryId,
      marginId: tk.marginId,
      otherAmount: tk.otherAmount,
      otherAmountType: tk.otherAmountType,
      isPaid: tk.isPaid,
      note: tk.note,
      orderEmployee: tk.orderEmployee,
      attachment: tk.attachment,
    });

    //? Pre-generate date range 1 lần, dùng chung cho tất cả employees
    const dateRange: string[] = [];
    let d = dayjs(startAt);
    const endDay = dayjs(endAt);
    while (d.toDate() <= endDay.toDate()) {
      dateRange.push(d.tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD"));
      d = d.add(1, "day");
    }

    const employeeTimeKeepings: TimeKeepingWithEmployee[] = await Promise.all(
      employees.data.map(async (emp) => {
        const tkData: TimeKeepingWithEmployee = {
          employee: emp,
          timeKeepings: [],
          totalAdvance: 0,
          advanceDetails: [],
          totalMargin: 0,
          marginDetails: [],
          totalUniform: 0,
          uniformDetails: [],
          totalPenalty: 0,
          penaltyDetails: [],
          totalBonus: 0,
          bonusDetails: [],
          numberOfPenalty: 0,
          isMargin: false,
          isUniform: false,
          totalDayWorked: 0,
          totalDayOff: 0,
          totalHours: 0,
          totalSalary: 0,
          totalRealSalary: 0,
          totalSalaryNotPaid: 0,
        };

        //? tính tổng sô lần vi phạm của nhân viên
        tkData.numberOfPenalty = await this.timeKeepingRepository.count({
          employeeId: emp.id,
          otherAmountType: OtherAmountTypeEnum.PENALTY,
        });

        // xem nhân viên đã ký quỹ hay chưa
        const margin = await this.marginRepository.findOne({
          employeeId: emp.id,
          status: Or(Not(MarginStatusEnum.APPROVED), IsNull()),
          type: MarginTypeEnum.MARGIN,
        });

        // nếu nhân viên chưa ký quỹ thì tạm thời mô phỏng, nếu khi được duyệt mới chính thức tạo
        if (margin) {
          tkData.isMargin = true;
        } else {
          tkData.marginDetails.push({
            id: `margin-${Date.now()}-${Math.random().toString(36)}`,
            timeAt: new Date(),
            type: TimeKeepingTypeEnum.IN, // số tiền này thu từ lương của nhân viên
            startTime: null,
            endTime: null,
            totalHours: null,
            salary: null,
            advanceSalaryId: null,
            marginId: null,
            otherAmount: config.MARGIN_AMOUNT, // mặc định thu 1.5 triệu
            otherAmountType: OtherAmountTypeEnum.MARGIN,
            note: "Thu tiền ký quỹ tự động khi chấm công",
          });
          tkData.totalMargin -= config.MARGIN_AMOUNT;
          tkData.totalSalaryNotPaid -= config.MARGIN_AMOUNT;
        }

        // xem nhân viên đã nộp tiền đồng phục chưa
        const uniform = await this.marginRepository.findOne({
          employeeId: emp.id,
          status: Or(Not(MarginStatusEnum.APPROVED), IsNull()),
          type: MarginTypeEnum.UNIFORM,
        });

        // nếu nhân viên chưa nộp tiền đồng phục thì tạm thời mô phỏng, nếu khi được duyệt mới chính thức tạo
        if (uniform) {
          tkData.isUniform = true;
        } else {
          tkData.uniformDetails.push({
            id: `uniform-${Date.now()}-${Math.random().toString(36)}`,
            timeAt: new Date(),
            type: TimeKeepingTypeEnum.IN, // số tiền này thu từ lương của nhân viên
            startTime: null,
            endTime: null,
            totalHours: null,
            salary: null,
            advanceSalaryId: null,
            marginId: null,
            otherAmount: config.UNIFORM_AMOUNT, // mặc định thu 300k
            otherAmountType: OtherAmountTypeEnum.UNIFORM,
            note: "Thu tiền đồng phục tự động khi chấm công",
          });

          tkData.totalUniform -= config.UNIFORM_AMOUNT;
          tkData.totalSalaryNotPaid -= config.UNIFORM_AMOUNT;
        }

        for (const dateStr of dateRange) {
          //? O(1) lookup thay vì O(n) filter
          const empTimeKeepings = tkIndex.get(`${emp.id}_${dateStr}`) || [];

          let hours = 0;
          let salary = 0;
          let salaryNotPaid = 0;
          const tks: TimeKeeping[] = [];

          if (empTimeKeepings.length > 0) {
            for (const tk of empTimeKeepings) {
              //? nếu là ngày công thường
              if (tk.otherAmountType === null) {
                if (tk.salary && tk.salary > 0) {
                  hours += tk.totalHours || 0;
                  salary += tk.salary || 0;

                  if (!tk.isPaid) {
                    salaryNotPaid += tk.salary || 0;
                    tkData.totalSalaryNotPaid += tk.salary || 0;
                  }

                  tks.push(tk);
                }
              } else {
                //? nếu là các khoản khác
                switch (tk.otherAmountType) {
                  case OtherAmountTypeEnum.ADVANCE_SALARY:
                    tkData.totalAdvance += tk.otherAmount || 0;
                    tkData.advanceDetails.push(transformTimeKeeping(tk));
                    if (!tk.isPaid) {
                      tkData.totalSalaryNotPaid -= tk.otherAmount || 0;
                    }
                    break;
                  case OtherAmountTypeEnum.MARGIN:
                    if (tk.type === TimeKeepingTypeEnum.IN) {
                      tkData.totalMargin -= tk.otherAmount || 0;
                    } else {
                      tkData.totalMargin += tk.otherAmount || 0;
                    }
                    tkData.marginDetails.push(transformTimeKeeping(tk));
                    // tkData.totalSalaryNotPaid += tk.otherAmount || 0;
                    break;
                  case OtherAmountTypeEnum.UNIFORM:
                    if (tk.type === TimeKeepingTypeEnum.IN) {
                      tkData.totalUniform -= tk.otherAmount || 0;
                    } else {
                      tkData.totalUniform += tk.otherAmount || 0;
                    }
                    tkData.uniformDetails.push(transformTimeKeeping(tk));
                    // tkData.totalSalaryNotPaid += tk.otherAmount || 0;
                    break;
                  case OtherAmountTypeEnum.PENALTY:
                    tkData.totalPenalty += tk.otherAmount || 0;
                    tkData.penaltyDetails.push(transformTimeKeeping(tk));
                    if (!tk.isPaid) {
                      tkData.totalSalaryNotPaid -= tk.otherAmount || 0;
                    }
                    break;
                  case OtherAmountTypeEnum.BONUS:
                  case OtherAmountTypeEnum.REFERRER_ORDER:
                  case OtherAmountTypeEnum.CREATE_ORDER:
                  case OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER:
                    tkData.totalBonus += tk.otherAmount || 0;
                    tkData.bonusDetails.push(transformTimeKeeping(tk));
                    if (!tk.isPaid) {
                      tkData.totalSalaryNotPaid += tk.otherAmount || 0;
                    }
                    break;
                }
              }
            }

            tkData.totalDayWorked += 1;
            tkData.totalHours += hours;
            tkData.totalSalary += salary;
            tkData.timeKeepings.push({
              date: dateStr,
              hours,
              salary,
              salaryNotPaid,
              details: tks.map(transformTimeKeeping),
            });
          } else {
            tkData.totalDayOff += 1;
            tkData.timeKeepings.push({
              date: dateStr,
              hours: 0,
              salary: 0,
              salaryNotPaid: 0,
              details: [],
            });
          }
        }

        //? Tính lương thực nhận 1 lần sau khi xử lý hết tất cả ngày
        // tkData.totalRealSalary =
        //   tkData.totalSalary +
        //   tkData.totalMargin +
        //   tkData.totalUniform +
        //   tkData.totalBonus -
        //   tkData.totalAdvance -
        //   tkData.totalPenalty;

        tkData.totalRealSalary = tkData.totalSalaryNotPaid;

        return tkData;
      }),
    );

    return ApiResponseHandler.getSuccess(
      "OK",
      employeeTimeKeepings,
      {
        totalRecords: employees.total,
        currentPage: data.page || 1,
        size: data.size || 10,
        totalPages: Math.ceil(employees.total / (data.size || 10)),
      },
      {
        totalHours,
        totalSalary,
        totalRealSalary,
      },
    );
  }

  async confirmTimeKeeping(
    data: ConfirmTimeKeepingDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<TimeKeeping>> {
    const check = await this.timeKeepingRepository.validateConfirmTimeKeeping(data, req, manager);

    if (!check) {
      throw new BadRequestError("Dữ liệu chấm công không hợp lệ");
    }

    const userId = req?.user?.userId;

    const dataCreateConfirm: CreateTimeKeepingConfirmDto = {
      employeeId: data.employeeId,
      startAt: data.startAt,
      endAt: data.endAt,
      totalHours: data.totalHours,
      totalDayWorked: data.totalDayWorked,
      totalSalary: data.totalSalary,
      totalRealSalary: data.totalRealSalary,
      totalAdvance: data.totalAdvance,
      totalMargin: data.totalMargin,
      totalUniform: data.totalUniform,
      totalPenalty: data.totalPenalty,
      totalBonus: data.totalBonus,
      timeAt: new Date(),
      userId: userId!,
    };

    await this.timeKeepingConfirmService.create(dataCreateConfirm, req, manager);

    return ApiResponseHandler.createSuccess("OK");
  }

  async createCustomTimeKeeping(req: Request, manager?: IEntityManager): Promise<ApiResponse<TimeKeeping>> {
    const data: CreateTimeKeepingWithOrderDto = req.body;
    const dataCreates: CreateTimeKeepingDto[] = [];

    if (data.employeeIds && data.employeeIds.length > 0) {
      const employees = await this.employeeRepository.findByOptions(
        {
          where: {
            id: In(data.employeeIds),
          },
        },
        manager,
      );

      for (const emp of employees) {
        data.details.forEach((detail) => {
          if (detail.startTime && detail.endTime) {
            detail.totalHours = dayjs(detail.endTime, "HH:mm:ss").diff(
              dayjs(detail.startTime, "HH:mm:ss"),
              "hour",
              true,
            );
          }
          dataCreates.push({
            ...detail,
            employeeId: emp.id,
            timeAt: detail.timeAt,
            type: TimeKeepingTypeEnum.OUT,
          });
        });
      }
      await this.timeKeepingRepository.createMany(dataCreates, manager);
    }

    return ApiResponseHandler.createSuccess("OK");
  }

  async validateBeforeCreate(data: CreateTimeKeepingDto, req?: Request, manager?: IEntityManager): Promise<void> {
    if (data.employeeId) {
      const employee = await this.employeeRepository.findById(data.employeeId, manager);
      if (!employee) {
        throw new Error("Nhân viên trong hợp đồng không tồn tại");
      }
    }

    if (data.startTime && data.endTime) {
      data.totalHours = dayjs(data.endTime, "HH:mm:ss").diff(dayjs(data.startTime, "HH:mm:ss"), "hour", true);
      console.log("data.totalHours", data.totalHours);
    }
  }

  async validateBeforeUpdate(
    id: string | number,
    data: Partial<TimeKeeping>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const timeKeeping = await this.timeKeepingRepository.findById(id as string, manager);
    if (!timeKeeping) {
      throw new Error("Dữ liệu chấm công không tồn tại");
    }

    if (timeKeeping.isPaid) {
      if (data.salary && data.salary !== timeKeeping.salary) {
        throw new BadRequestError("Chấm công đã được thanh toán, không thể cập nhật lương");
      }
    }

    if (data.startTime && data.endTime) {
      data.totalHours = dayjs(data.endTime, "HH:mm:ss").diff(dayjs(data.startTime, "HH:mm:ss"), "hour", true);
    }
  }

  async actionAfterUpdate(data: TimeKeeping, req?: Request, manager?: IEntityManager): Promise<void> {
    if (data.orderEmployeeId) {
      await this.orderEmployeeRepository.update(
        data.orderEmployeeId,
        {
          timeAt: data.timeAt,
          startTime: data.startTime,
          endTime: data.endTime,
          totalHours: data.totalHours,
          salary: data.salary,
        },
        manager,
      );
    }
  }

  async validateBeforeDelete(id: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const timeKeeping = await this.timeKeepingRepository.findById(id, manager);
    if (!timeKeeping) {
      throw new Error("Dữ liệu chấm công không tồn tại");
    }

    if (timeKeeping.isPaid) {
      throw new BadRequestError("Chấm công đã được thanh toán, không thể xóa");
    }
  }

  /**
   * Sau khi xóa TimeKeeping:
   * - Nếu là bản ghi phân bổ doanh thu (isRevenueShareAllocation = true):
   *   + Tìm các Order có timeAt nằm trong khoảng [revenueShareStartDate, revenueShareEndDate]
   *   + Tìm các OrderLeader có employeeId trùng và orderId thuộc danh sách trên
   *   + Cập nhật isRevenueShareAllocated = false để các lần phân bổ sau có thể chạy lại
   */
  async actionAfterDelete(data: TimeKeeping, req?: Request, manager?: IEntityManager): Promise<void> {
    if (!data.isRevenueShareAllocation) return;
    if (!data.employeeId) return;
    if (!data.revenueShareStartDate || !data.revenueShareEndDate) return;

    const startAt = dayjs.tz(data.revenueShareStartDate, "Asia/Ho_Chi_Minh").startOf("day").toDate();
    const endAt = dayjs.tz(data.revenueShareEndDate, "Asia/Ho_Chi_Minh").endOf("day").toDate();

    // Lấy danh sách orderId có timeAt nằm trong khoảng và đã hoàn thành
    const orders = await this.orderRepository.findByOptions({
      where: {
        timeAt: Between(startAt, endAt),
        status: OrderStatusEnum.COMPLETED,
      },
      select: { id: true, code: true },
    });
    const orderMap = new Map(orders.map((o) => [o.id, o.code]));
    const orderIds = Array.from(orderMap.keys());

    if (orderIds.length === 0) {
      logger.info(
        `[TimeKeeping.delete] Không có hợp đồng nào trong khoảng ${data.revenueShareStartDate} - ${data.revenueShareEndDate} cho nhân viên ${data.employeeId}`,
      );
      return;
    }

    // Tìm các OrderLeader cần reset
    const orderLeaders = await this.orderLeaderRepository.findByOptions({
      where: {
        employeeId: data.employeeId,
        orderId: In(orderIds),
      },
    });

    for (const orderLeader of orderLeaders) {
      logger.info(
        `[TimeKeeping.delete] Reset isRevenueShareAllocated = false cho order leader ${orderLeader.id} của hợp đồng ${orderMap.get(orderLeader.orderId)}`,
      );
      await this.orderLeaderRepository.update(orderLeader.id, { isRevenueShareAllocated: false }, manager);
    }
  }

  async getAllTimeKeepingSummaryByEmployee(req?: Request, manager?: IEntityManager): Promise<ApiResponse<any>> {
    const keyword = req?.query.keyword as string | undefined;
    const isEmployee = req?.user?.role === UserRoleEnum.EMPLOYEE;
    const employeeId = req?.user?.employeeId;

    if (isEmployee && !employeeId) {
      return ApiResponseHandler.getSuccess("OK", {
        totalSalaries: 0,
        totalRealSalaries: 0,
        totalHours: 0,
      });
    }

    let employeeIds: string[] | undefined = isEmployee && employeeId ? [employeeId] : undefined;

    if (!isEmployee && keyword) {
      const employees = await this.employeeRepository.findWithPagination({
        keyword: keyword,
      });

      if (employees.data.length > 0) {
        employeeIds = employees.data.map((employee) => employee.id);
      }
    }

    const totalSalaries = await this.timeKeepingRepository.calculateTotalSalaryInTimeRange(
      undefined,
      undefined,
      employeeIds,
      undefined,
      false,
      manager,
    );
    const totalRealSalaries = await this.timeKeepingRepository.calculateTotalRealSalaryInTimeRange(
      undefined,
      undefined,
      employeeIds,
      manager,
    );
    const totalHours = await this.timeKeepingRepository.calculateTotalHoursInTimeRange(
      undefined,
      undefined,
      employeeIds,
      manager,
    );

    return ApiResponseHandler.getSuccess("OK", {
      totalSalaries,
      totalRealSalaries,
      totalHours,
    });
  }
}
