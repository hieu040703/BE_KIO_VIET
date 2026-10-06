import { injectable } from "inversify";
import logger from "@/shared/utils/logger";
import { ORDER_TYPES } from "../order.types";
import { container } from "@/modules/container";
import { OrderRepository } from "../order.repository";
import { Order } from "@/database/models/Order";
import { BadRequestError } from "@/shared/types/errors";
import { IEntityManager } from "@/shared/types/interfaces";
import { DEBT_TYPES } from "@/modules/accountant/debt/debt.types";
import { DebtRepository } from "@/modules/accountant/debt/debt.repository";
import { FINANCE_TYPES, FinanceCreationSourceEnum } from "@/modules/accountant/finance/finance.types";
import { FinanceService } from "@/modules/accountant/finance/finance.service";
import { CreateFinanceDto } from "@/modules/accountant/finance/finance.validator";
import { FinanceRepository } from "@/modules/accountant/finance/finance.repository";
import {
  DebtTypeEnum,
  FinanceTypeEnum,
  OrderStatusEnum,
  OtherAmountTypeEnum,
  PositionDefaultEnum,
  TimeKeepingTypeEnum,
} from "@/shared/constants/constance";
import { DebtService } from "@/modules/accountant/debt/debt.service";
import { ORDER_LEADER_TYPES } from "../orderLeader/orderLeader.types";
import { OrderLeaderService } from "../orderLeader/orderLeader.service";
import { CreateDebtDto } from "@/modules/accountant/debt/debt.validator";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import { OrderLeaderRepository } from "../orderLeader/orderLeader.repository";
import { TimeKeepingRepository } from "@/modules/timeKeeping/timeKeeping.repository";
import { IsNull } from "typeorm";

@injectable()
export class CalculateOrderData {
  constructor() {}

  private async syncOrderRewardTimeKeeping(
    order: Pick<Order, "id" | "code" | "timeAt" | "amount">,
    employeeId: string | null,
    percent: number | null,
    isPaid: boolean,
    otherAmountType: OtherAmountTypeEnum,
    note: string,
    timeKeepingRepository: TimeKeepingRepository,
    manager?: IEntityManager,
  ): Promise<void> {
    if (isPaid || !employeeId || !percent || percent <= 0 || order.amount <= 0) {
      return;
    }

    const expectedAmount = Math.round((order.amount * percent) / 100);
    if (expectedAmount <= 0) return;

    const existingTimeKeeping = await timeKeepingRepository.findOne(
      {
        referrerOrderId: order.id,
        otherAmountType,
      },
      manager,
    );

    if (!existingTimeKeeping) {
      await timeKeepingRepository.create(
        {
          employeeId,
          type: TimeKeepingTypeEnum.OUT,
          timeAt: order.timeAt,
          otherAmount: expectedAmount,
          otherAmountType,
          referrerOrderId: order.id,
          note,
        },
        manager,
      );
    } else if (!existingTimeKeeping.isPaid) {
      const updates: { employeeId?: string; otherAmount?: number } = {};
      if (existingTimeKeeping.employeeId !== employeeId) updates.employeeId = employeeId;
      if (existingTimeKeeping.otherAmount !== expectedAmount) updates.otherAmount = expectedAmount;

      if (Object.keys(updates).length > 0) {
        await timeKeepingRepository.update(existingTimeKeeping.id, updates, manager);
      }
    }

    // Chỉ tạo/đồng bộ khoản phải trả; cờ "đã thanh toán" được cập nhật
    // trong TimeKeepingConfirmService khi khoản thưởng thực sự được chốt lương.
  }

  // tính toán lại các trường liên quan đến tiền (preVatAmount, discountAmount, vatAmount, amount, isPaid) của hợp đồng khi có sự thay đổi về chi tiết hợp đồng hoặc các khoản thu liên quan đến hợp đồng
  async process(orderId: string, manager?: IEntityManager): Promise<void> {
    const orderRepository = container.get<OrderRepository>(ORDER_TYPES.OrderRepository);
    const orderEntityRepository = orderRepository.getRepository(manager);

    logger.info(`Processing calculate order data for orderId: ${orderId}`);

    // Không dùng OrderRepository.findById ở đây: query đó JOIN đồng thời nhiều quan hệ one-to-many
    // (details, orderEmployees, orderLeaders), làm số raw row tăng theo tích Descartes và có thể gây OOM.
    // Chỉ lấy đúng các cột cần cho phép tính và relation details.
    const order = await orderEntityRepository.findOne({
      where: { id: orderId },
      select: {
        id: true,
        code: true,
        branchId: true,
        customerId: true,
        timeAt: true,
        discountPercent: true,
        vat: true,
        isPaid: true,
        status: true,
        deposit: true,
        details: true,
      },
      loadEagerRelations: false,
      relations: {
        details: true,
      },
    });
    if (!order) {
      throw new BadRequestError("Hợp đồng không tồn tại");
    }

    //? tính tổng số tiền hợp đồng từ chi tiết hợp đồng
    const totalPreVatAmount = order.details.reduce((sum, detail) => {
      return sum + detail.amount;
    }, 0);

    const discountPercent = order.discountPercent || 0;

    const totalDiscountAmount = (totalPreVatAmount * discountPercent) / 100;

    const vat = order.vat ? order.vat : 0;

    const totalVatAmount = ((totalPreVatAmount - totalDiscountAmount) * vat) / 100;

    const totalAmount = totalPreVatAmount - totalDiscountAmount + totalVatAmount;

    //? tính tổng số tiền đã thu
    const totalIncome = await orderRepository.getTotalIncomeByOrderId(order.id, manager);

    let isPaid = order.isPaid;

    //? chỉ cập nhật lại trạng thái về chưa thanh toán nếu số tiền đã thu  < tiền hợp đồng, không cập nhật đã thanh toán vì khách hàng muốn làm thủ công
    if (totalIncome < totalAmount && totalAmount > 0) {
      isPaid = false;
    }

    await orderEntityRepository.update(
      order.id,
      {
        preVatAmount: totalPreVatAmount,
        discountAmount: totalDiscountAmount,
        vatAmount: totalVatAmount,
        amount: totalAmount,
        isPaid: isPaid,
      },
    );

    // Đánh dấu bền vững trong cùng transaction. Dispatcher chỉ enqueue sau khi version này đã commit.
    await orderEntityRepository.increment({ id: order.id }, "calculationVersion", 1);
  }

  // Đồng bộ các bảng dẫn xuất trong worker. Mỗi Order chỉ có một job chạy tại một thời điểm.
  async processRelatedData(orderId: string, manager?: IEntityManager): Promise<void> {
    const orderRepository = container.get<OrderRepository>(ORDER_TYPES.OrderRepository);
    const debtRepository = container.get<DebtRepository>(DEBT_TYPES.DebtRepository);
    const financeRepository = container.get<FinanceRepository>(FINANCE_TYPES.FinanceRepository);
    const financeService = container.get<FinanceService>(FINANCE_TYPES.FinanceService);
    const debtService = container.get<DebtService>(DEBT_TYPES.DebtService);
    const orderLeaderRepository = container.get<OrderLeaderRepository>(ORDER_LEADER_TYPES.OrderLeaderRepository);
    const orderLeaderService = container.get<OrderLeaderService>(ORDER_LEADER_TYPES.OrderLeaderService);
    const timeKeepingRepository = container.get<TimeKeepingRepository>(TIME_KEEPING_TYPES.TimeKeepingRepository);

    logger.info(`Processing related order data for orderId: ${orderId}`);

    const order = await orderRepository.getRepository(manager).findOne({
      where: { id: orderId },
      select: {
        id: true,
        code: true,
        branchId: true,
        customerId: true,
        timeAt: true,
        amount: true,
        allocateRevenuePercent: true,
        hasAllocatedRevenue: true,
        referrerId: true,
        referrerPercent: true,
        isReferrerPaid: true,
        createdByEmployeeId: true,
        createdByEmployeePercent: true,
        isPaidForEmployeeCreateOrder: true,
        status: true,
        deposit: true,
      },
      loadEagerRelations: false,
    });
    if (!order) {
      throw new BadRequestError("Hợp đồng không tồn tại");
    }

    //? Cập nhật thưởng cho quản lý đơn hàng
    if (
      order.status === OrderStatusEnum.COMPLETED &&
      !order.hasAllocatedRevenue &&
      order.amount > 0 &&
      order.allocateRevenuePercent &&
      order.allocateRevenuePercent > 0
    ) {
      const expectedAmount = Math.round((order.amount * order.allocateRevenuePercent) / 100);

      if (expectedAmount > 0) {
        const orderLeader = await orderLeaderRepository.findByOption(
          {
            where: {
              orderId: order.id,
              position: PositionDefaultEnum.BRANCH_MANAGER,
            },
            select: { id: true, employeeId: true },
          },
          manager,
        );

        if (orderLeader?.employeeId) {
          const existingRevenueTimeKeeping = await timeKeepingRepository.findOne(
            {
              referrerOrderId: order.id,
              otherAmountType: OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER,
            },
            manager,
          );

          if (!existingRevenueTimeKeeping) {
            await timeKeepingRepository.create(
              {
                employeeId: orderLeader.employeeId,
                type: TimeKeepingTypeEnum.OUT,
                timeAt: order.timeAt,
                otherAmount: expectedAmount,
                otherAmountType: OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER,
                referrerOrderId: order.id,
                note: `Phân bổ doanh thu hợp đồng ${order.code}`,
              },
              manager,
            );
          } else if (!existingRevenueTimeKeeping.isPaid) {
            const updates: { employeeId?: string; otherAmount?: number } = {};
            if (existingRevenueTimeKeeping.employeeId !== orderLeader.employeeId) {
              updates.employeeId = orderLeader.employeeId;
            }
            if (existingRevenueTimeKeeping.otherAmount !== expectedAmount) {
              updates.otherAmount = expectedAmount;
            }

            if (Object.keys(updates).length > 0) {
              await timeKeepingRepository.update(existingRevenueTimeKeeping.id, updates, manager);
            }
          }
        }
      }
    }

    //? Cập nhật thưởng giới thiệu đơn hàng
    if (
      order.status === OrderStatusEnum.COMPLETED &&
      order.referrerId &&
      order.referrerPercent &&
      order.referrerPercent > 0
    ) {
      await this.syncOrderRewardTimeKeeping(
        order,
        order.referrerId,
        order.referrerPercent,
        order.isReferrerPaid,
        OtherAmountTypeEnum.REFERRER_ORDER,
        `Hoa hồng giới thiệu hợp đồng ${order.code}`,
        timeKeepingRepository,
        manager,
      );
    }

    //? cập nhật thưởng cho nhân viên tạo đơn hàng
    if (
      order.status === OrderStatusEnum.COMPLETED &&
      order.createdByEmployeeId &&
      order.createdByEmployeePercent &&
      order.createdByEmployeePercent > 0
    ) {
      await this.syncOrderRewardTimeKeeping(
        order,
        order.createdByEmployeeId,
        order.createdByEmployeePercent,
        order.isPaidForEmployeeCreateOrder,
        OtherAmountTypeEnum.CREATE_ORDER,
        `Thưởng tạo đơn hợp đồng ${order.code}`,
        timeKeepingRepository,
        manager,
      );
    }

    // Lấy công nợ liên quan đến hợp đồng
    const debt = await debtRepository.findOne(
      {
        orderId: order.id,
      },
      manager,
    );

    if (debt) {
      debt.amount = order.amount;
      debt.timeAt = order.timeAt;
      debt.customerId = order.customerId;
      await debtRepository.update(debt.id, debt, manager);
    } else {
      if (order.amount > 0 && order.status === OrderStatusEnum.COMPLETED) {
        //? nếu chưa có công nợ nào liên quan đến hợp đồng và hợp đồng đã hoàn thành thì tạo mới
        const dataCreate: CreateDebtDto = {
          type: DebtTypeEnum.RECEIVABLE,
          amount: order.amount,
          timeAt: order.timeAt,
          customerId: order.customerId,
          orderId: order.id,
          note: `Công nợ phát sinh từ hợp đồng ${order.code}`,
        };
        await debtService.create(dataCreate, undefined, manager);
      }
    }

    const financeEntityRepository = financeRepository.getRepository(manager);

    // Đồng bộ khách hàng cho toàn bộ phiếu thu/chi bằng một query, tránh N lần update tuần tự.
    await financeEntityRepository.update({ orderId: order.id, deletedAt: IsNull() }, { customerId: order.customerId });

    if (order.deposit && order.deposit > 0) {
      // tìm xem đã có bản ghi thu chi nào liên quan đến tiền đặt cọc chưa, nếu có thì cập nhật lại số tiền, nếu chưa có thì tạo mới
      const depositFinance = await financeEntityRepository.findOne({
        where: {
          orderId: order.id,
          isDeposit: true,
        },
        select: {
          id: true,
          isDeposit: true,
        },
        loadEagerRelations: false,
      });

      //? nếu không tìm thấy thì tạo mới
      if (!depositFinance) {
        //? create finance income
        const dataCreateFinance: CreateFinanceDto = {
          branchId: order.branchId,
          customerId: order.customerId,
          type: FinanceTypeEnum.INCOME,
          category: "Tiền tạm ứng hợp đồng",
          amount: order.deposit,
          timeAt: new Date(),
          orderPayments: [
            {
              orderId: order.id,
              amount: order.deposit,
            },
          ],
          isDeposit: true,
          note: `Tiền tạm ứng hợp đồng ${order.code}`,
        };
        await financeService.create(dataCreateFinance, undefined, manager, FinanceCreationSourceEnum.SYSTEM);
      } else {
        //? nếu tìm thấy thì cập nhật lại số tiền
        // Dùng financeRepository.update thay vì financeService.update để tránh vòng lặp vô hạn:
        // financeService.update → actionAfterUpdate → calculateOrderData.process → financeService.update → ...
        await financeRepository.update(
          depositFinance.id,
          {
            amount: order.deposit,
            customerId: order.customerId,
          },
          manager,
        );
      }
    }

    //? tính toán lại tổng số tiền phân bổ cho người phụ trách hợp đồng
    await orderLeaderService.redistributeOrderLeaderRevenueShare(order.id, order.amount, manager);

    //$ cộng điểm thưởng cho khách hàng nếu có - tắt tạm vì phần này chưa handle thực tế
    // if (order.amount > 0) {
    //   const rewardPoints = Math.floor(order.amount / config.ORDER_POINT_RATE); // Ví dụ: cứ 100k thì được 1 điểm thưởng
    //   if (rewardPoints > 0) {
    //     const existingRewardPoint = await this.rewardPointRepository.findOne(
    //       {
    //         orderId: order.id,
    //         type: RewardPointTypeEnum.EARNED,
    //       },
    //       manager,
    //     );

    //     if (!existingRewardPoint) {
    //       await this.rewardPointRepository.create(
    //         {
    //           customerId: order.customerId!,
    //           orderId: order.id,
    //           points: rewardPoints,
    //           type: RewardPointTypeEnum.EARNED,
    //           note: `Điểm thưởng tích lũy từ hợp đồng ${order.code}`,
    //         },
    //         manager,
    //       );
    //     } else if (existingRewardPoint.points !== rewardPoints) {
    //       await this.rewardPointRepository.update(
    //         existingRewardPoint.id,
    //         {
    //           points: rewardPoints,
    //           note: `Điểm thưởng tích lũy từ hợp đồng ${order.code}`,
    //         },
    //         manager,
    //       );
    //     }
    //   }
    // }

    //$ cập nhật trạng thái order service tương ứng nếu có => chuyển sang trạng thái chờ khách hàng xác nhận
    // if (order.serviceOrderId) {
    //   await this.serviceOrderRepository.update(
    //     order.serviceOrderId,
    //     { status: ServiceOrderStatusEnum.COMPLETED_BY_EMPLOYEE },
    //     manager,
    //   );
    // }
  }
}
