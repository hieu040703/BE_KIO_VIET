import { Request } from "express";
import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { OrderLeaderRepository } from "./orderLeader.repository";
import { ORDER_LEADER_TYPES } from "./orderLeader.types";
import { OrderLeader } from "@/database/models/OrderLeader";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { CreateOrderLeaderDto } from "./orderLeader.validator";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { OrderLeaderRelations, OrderLeaderSelectFull } from "./orderLeader.select";
import { ORDER_TYPES } from "../order.types";
import { OrderRepository } from "../order.repository";
import { Not } from "typeorm";
import { PositionDefaultEnum } from "@/shared/constants/constance";

@injectable()
export class OrderLeaderService extends BaseService<OrderLeader> {
  protected relations = OrderLeaderRelations;
  protected selectedFields = OrderLeaderSelectFull;
  constructor(
    @inject(ORDER_LEADER_TYPES.OrderLeaderRepository) private orderLeaderRepository: OrderLeaderRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
  ) {
    super(orderLeaderRepository);
  }

  private async validateRevenueShareTotal(
    position: PositionDefaultEnum,
    orderId: string,
    revenueShare: number | null | undefined,
    manager?: IEntityManager,
    excludeOrderLeaderId?: string | number,
  ): Promise<void> {
    const order = await this.orderRepository.findById(orderId, manager);

    if (!order) {
      throw new NotFoundError("Không tìm thấy hợp đồng");
    }

    const totalExistingRevenueShare = await this.orderLeaderRepository.sumByOptions(
      "revenueShare",
      {
        where: {
          orderId,
          position,
          ...(excludeOrderLeaderId ? { id: Not(String(excludeOrderLeaderId)) } : {}),
        } as any,
      },
      manager,
    );

    const nextTotalRevenueShare = totalExistingRevenueShare + (revenueShare || 0);

    if (nextTotalRevenueShare > order.amount) {
      throw new BadRequestError("Tổng số tiền phân bổ cho người phụ trách không được lớn hơn tổng tiền hợp đồng");
    }
  }

  async validateBeforeCreate(data: CreateOrderLeaderDto, req?: Request, manager?: IEntityManager): Promise<void> {
    const orderId = req?.params?.orderId as string | undefined;

    if (!orderId) {
      throw new NotFoundError("Order ID is required to create OrderLeader");
    }

    Object.assign(data, { orderId });

    await this.validateRevenueShareTotal(PositionDefaultEnum.BRANCH_MANAGER, orderId, data.revenueShare, manager);
  }

  async validateBeforeUpdate(
    id: string | number,
    data: Partial<OrderLeader>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const orderLeader = await this.orderLeaderRepository.findById(id, manager, false, req);

    if (!orderLeader) {
      throw new NotFoundError("Không tìm thấy dữ liệu");
    }

    if (
      orderLeader.isRevenueShareAllocated &&
      (data.revenueShare !== orderLeader.revenueShare || data.employeeId !== orderLeader.employeeId)
    ) {
      throw new BadRequestError("Không thể cập nhật khi đã phân bổ doanh thu");
    }

    const targetOrderId = data.orderId || orderLeader.orderId;
    const targetRevenueShare = data.revenueShare ?? orderLeader.revenueShare;

    await this.validateRevenueShareTotal(orderLeader.position, targetOrderId, targetRevenueShare, manager, id);
  }

  async validateBeforeDelete(id: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const orderLeader = await this.orderLeaderRepository.findById(id, manager, false, req);

    if (!orderLeader) {
      throw new NotFoundError("Không tìm thấy dữ liệu");
    }

    if (orderLeader.isRevenueShareAllocated) {
      throw new BadRequestError("Không thể xóa khi đã phân bổ doanh thu");
    }
  }

  /**
   * Phân bổ lại revenueShare cho các OrderLeader khi tổng tiền hợp đồng thay đổi.
   * - 1 leader: revenueShare = newAmount
   * - Nhiều leader: giữ nguyên tỉ lệ giữa các leader, scale theo newAmount
   */
  async redistributeOrderLeaderRevenueShare(
    orderId: string,
    newAmount: number,
    manager?: IEntityManager,
  ): Promise<void> {
    const leaders = await this.orderLeaderRepository.findByOptions({ where: { orderId } }, manager);

    if (!leaders || leaders.length === 0) return;

    if (leaders.length === 1) {
      //? 1 leader: gán toàn bộ revenueShare = newAmount
      await this.orderLeaderRepository.update(leaders[0].id, { revenueShare: newAmount }, manager);
      return;
    }

    //? nhiều leader: tính tỉ lệ hiện tại rồi nhân với newAmount
    const totalCurrent = leaders.reduce((sum, l) => sum + (l.revenueShare || 0), 0);
    if (totalCurrent <= 0) {
      //? không có base ratio để phân bổ → bỏ qua
      return;
    }

    for (const leader of leaders) {
      const ratio = (leader.revenueShare || 0) / totalCurrent;
      const newShare = Math.round(ratio * newAmount);
      await this.orderLeaderRepository.update(leader.id, { revenueShare: newShare }, manager);
    }
  }
}
