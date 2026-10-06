import { injectable, inject } from "inversify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Request } from "express";
import { BaseService } from "@/shared/base/BaseService";
import { AllocateRevenue } from "@/database/models/AllocateRevenue";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { NotFoundError } from "@/shared/types/errors";
import { ORDER_TYPES } from "../order/order.types";
import { OrderRepository } from "../order/order.repository";
import { TIME_KEEPING_TYPES } from "../timeKeeping/timeKeeping.types";
import { TimeKeepingRepository } from "../timeKeeping/timeKeeping.repository";
import { CreateTimeKeepingDto } from "../timeKeeping/timeKeeping.validator";
import { ORDER_LEADER_TYPES } from "../order/orderLeader/orderLeader.types";
import { AllocateRevenueRepository } from "./allocateRevenue.repository";
import { ALLOCATE_REVENUE_TYPES } from "./allocateRevenue.types";
import { Employee } from "@/database/models/Employee";
import { OrderLeaderSelectFull } from "../order/orderLeader/orderLeader.select";
import { OrderLeaderRepository } from "../order/orderLeader/orderLeader.repository";
import { OrderStatusEnum, TimeKeepingTypeEnum } from "@/shared/constants/constance";
import { AllocateRevenueRelations, AllocateRevenueSelectFull } from "./allocateRevenue.select";
import { AllocateRevenueToEmployeesDto, CreateAllocateRevenueRecordDto } from "./allocateRevenue.validator";
import { Between } from "typeorm";

dayjs.extend(utc);
dayjs.extend(timezone);

type AllocatedRevenueType = {
  employee: Employee;
  totalOrder: number; // tổng số hợp đồng mà nhân viên này phụ trách / tham gia
  totalLeaderPercentAmount: number; // tổng số tiền doanh thu từ hợp đồng mà nhân viên này được hưởng (ví dụ: hợp đồng 100 triệu, nhân viên này phụ trách 70 triệu)
  allocatedRevenue: number; //? phần chia sẻ doanh thu mà nhân viên nhận được
};

@injectable()
export class AllocateRevenueService extends BaseService<AllocateRevenue> {
  protected relations = AllocateRevenueRelations;
  protected selectedFields = AllocateRevenueSelectFull;

  constructor(
    @inject(ALLOCATE_REVENUE_TYPES.AllocateRevenueRepository)
    private allocateRevenueRepository: AllocateRevenueRepository,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
    @inject(ORDER_LEADER_TYPES.OrderLeaderRepository) private orderLeaderRepository: OrderLeaderRepository,
  ) {
    super(allocateRevenueRepository);
  }

  //? tính tổng doanh thu của các hợp đồng trong khoảng thời gian + chi nhánh (nếu có)
  async calculateTotalRevenue(
    data: AllocateRevenueToEmployeesDto,
    manager?: IEntityManager,
  ): Promise<{
    totalRevenue: number;
    totalAllocatedRevenue: number;
    totalUnallocatedRevenue: number;
    totalRevenueToAllocate: number;
    allocatedRevenues: AllocatedRevenueType[];
    orderLeaderIds: string[];
  }> {
    //? Lấy những đơn hàng trong khoảng thời gian và có trạng thái đã hoàn thành, nếu có branchId thì lọc thêm theo chi nhánh
    const orderLeaders = await this.orderLeaderRepository.findByOptions(
      {
        where: {
          position: data.allocationTarget,
          order: {
            ...(data.branchId ? { branchId: data.branchId } : {}),
            timeAt: Between(data.startAt, data.endAt),
            status: OrderStatusEnum.COMPLETED,
          },
        },
        select: OrderLeaderSelectFull,
        relations: {
          employee: true,
          order: true,
        },
      },
      manager,
    );

    //? tổng doanh thu của các hợp đồng trong khoảng thời gian + chi nhánh (nếu có)
    const totalRevenue = await this.orderRepository.getTotalAmountByTime(data.startAt, data.endAt, data.branchId);

    //? tổng doanh thu đã được phân bổ cho nhân viên (chỉ tính những quản lý đã được phân bổ, tức là orderLeaders.isRevenueAllocated = true)
    const totalAllocatedRevenue = orderLeaders.reduce((sum, ol) => {
      if (ol.isRevenueShareAllocated && ol.revenueShare) {
        return sum + ol.revenueShare;
      }

      return sum;
    }, 0);

    //? tổng doanh thu từ hợp đồng chưa được phân bổ cho nhân viên (tức là những hợp đồng có isRevenueAllocated = false)
    const totalUnallocatedRevenue = totalRevenue - totalAllocatedRevenue;

    //? tổng số tiền sẽ dùng để chia cho các nhân viên
    const totalRevenueToAllocate = (totalUnallocatedRevenue / 100) * data.revenueSharePercent;

    let allocatedRevenues: AllocatedRevenueType[] = [];
    const orderLeaderIds: string[] = [];

    for (const ol of orderLeaders) {
      if (!ol.isRevenueShareAllocated && ol.revenueShare) {
        orderLeaderIds.push(ol.id);
        const existing = allocatedRevenues.find((ar) => ar.employee.id === ol.employeeId);

        if (existing) {
          existing.totalOrder += 1;
          existing.totalLeaderPercentAmount += ol.revenueShare || 0;
        } else {
          allocatedRevenues.push({
            employee: ol.employee,
            totalOrder: 1,
            totalLeaderPercentAmount: ol.revenueShare,
            allocatedRevenue: 0,
          });
        }
      }
    }

    //? tính phần chia sẻ doanh thu mà mỗi nhân viên nhận được dựa trên tổngLeaderPercentAmount của nhân viên đó so với tổngLeaderPercentAmount của tất cả nhân viên, rồi nhân với tổng RevenueToAllocate
    allocatedRevenues = allocatedRevenues.map((ar) => {
      if (totalUnallocatedRevenue > 0) {
        const leaderPercentRatio = ar.totalLeaderPercentAmount / totalUnallocatedRevenue;
        return {
          ...ar,
          allocatedRevenue: leaderPercentRatio * totalRevenueToAllocate,
        };
      } else {
        return {
          ...ar,
          allocatedRevenue: 0, // Set to 0 if totalUnallocatedRevenue is 0 to prevent division by zero
        };
      }
    });

    return {
      totalRevenue,
      totalAllocatedRevenue,
      totalUnallocatedRevenue,
      totalRevenueToAllocate,
      orderLeaderIds,
      allocatedRevenues,
    };
  }

  //? Lấy danh sách order leader được phân bổ trong 1 phiếu allocate revenue
  async getOrderLeaders(id: string, manager?: IEntityManager) {
    return this.orderLeaderRepository.findByOptions(
      {
        where: { allocateRevenueId: id },
        select: OrderLeaderSelectFull,
        relations: { employee: true, order: true },
      },
      manager,
    );
  }

  async allocateRevenueToEmployees(
    data: CreateAllocateRevenueRecordDto,
    manager?: IEntityManager,
  ): Promise<ApiResponse<any>> {
    const allocateRevenue = await this.allocateRevenueRepository.create(
      {
        fromDate: data.startAt,
        toDate: data.endAt,
        type: data.type,
        totalRevenue: data.totalRevenue,
        totalAllocatedRevenue: data.totalAllocatedRevenue,
        totalUnallocatedRevenue: data.totalUnallocatedRevenue,
        totalRevenueToAllocate: data.totalRevenueToAllocate,
        timeAt: new Date(),
      },
      manager,
    );

    for (const employeeData of data.employeeData) {
      const dataCreateTimekeeping: CreateTimeKeepingDto = {
        type: TimeKeepingTypeEnum.OUT,
        employeeId: employeeData.employeeId,
        timeAt: new Date(),
        salary: employeeData.allocatedRevenue,
        isRevenueShareAllocation: true,
        allocateRevenueId: allocateRevenue.id,
        revenueShareStartDate: data.startAt,
        revenueShareEndDate: data.endAt,
        note: `Phân bổ doanh thu từ ngày ${dayjs(data.startAt).tz("Asia/Ho_Chi_Minh").format("DD-MM-YYYY")} đến ${dayjs(data.endAt).tz("Asia/Ho_Chi_Minh").format("DD-MM-YYYY")} cho nhân viên`,
      };

      await this.timeKeepingRepository.create(dataCreateTimekeeping, manager);
    }

    for (const orderLeaderId of data.orderLeaderIds) {
      const orderLeader = await this.orderLeaderRepository.findByOption({ where: { id: orderLeaderId } }, manager);
      if (orderLeader) {
        await this.orderLeaderRepository.update(
          orderLeaderId,
          { isRevenueShareAllocated: true, allocateRevenueId: allocateRevenue.id },
          manager,
        );
      }
    }

    return ApiResponseHandler.getSuccess("OK", { message: "Phân bổ doanh thu thành công" });
  }

  async actionAfterDelete(data: AllocateRevenue, req?: Request, manager?: IEntityManager): Promise<void> {
    const timeKeepings = await this.timeKeepingRepository.findByOptions(
      {
        where: { allocateRevenueId: data.id },
        select: { id: true },
      },
      manager,
    );

    if (timeKeepings.length > 0) {
      await this.timeKeepingRepository.softDeleteMany(
        timeKeepings.map((timeKeeping) => timeKeeping.id),
        manager,
      );
    }

    const orderLeaders = await this.orderLeaderRepository.findByOptions(
      {
        where: { allocateRevenueId: data.id },
        select: { id: true },
      },
      manager,
    );

    if (orderLeaders.length > 0) {
      await this.orderLeaderRepository.updateMany(
        orderLeaders.map((orderLeader) => orderLeader.id),
        { isRevenueShareAllocated: false, allocateRevenueId: null },
        manager,
      );
    }
  }

  async delete(id: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<Boolean>> {
    await this.validateBeforeDelete(id, req, manager);
    const exist = await this.allocateRevenueRepository.findById(id, manager);
    if (!exist) {
      throw new NotFoundError("id.not_found");
    }

    const isDeleted = await this.allocateRevenueRepository.softDelete(id, manager, req);
    if (isDeleted) {
      await this.actionAfterDelete(exist, req, manager);
    }

    return ApiResponseHandler.deleteSuccess("OK", id);
  }
}
