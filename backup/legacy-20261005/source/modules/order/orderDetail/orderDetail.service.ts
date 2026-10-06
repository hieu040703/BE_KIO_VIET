import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { OrderDetailRepository } from "./orderDetail.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ORDER_DETAIL_TYPES } from "./orderDetail.types";
import { OrderDetail } from "@/database/models/OrderDetail";
import { OrderDetailRelations, OrderDetailSelectFull } from "./orderDetail.select";
import { IEntityManager } from "@/shared/types/interfaces";
import { Request } from "express";
import { CreateOrderDetailDto } from "./orderDetail.validator";
import { ORDER_TYPES } from "../order.types";
import { CalculateOrderData } from "../handles/calculate.order";
@injectable()
export class OrderDetailService extends BaseService<OrderDetail> {
  protected relations = OrderDetailRelations;
  protected selectedFields = OrderDetailSelectFull;
  constructor(
    @inject(ORDER_DETAIL_TYPES.OrderDetailRepository) private orderDetailRepository: OrderDetailRepository,
    @inject(ORDER_TYPES.CalculateOrderData) private calculateOrderData: CalculateOrderData,
  ) {
    super(orderDetailRepository);
  }

  async validateBeforeCreate(data: CreateOrderDetailDto, req?: Request, manager?: IEntityManager): Promise<void> {
    const orderId = req?.params.orderId as string | undefined;
    console.log("orderId", orderId);

    // Gán orderId từ params vào data trước khi tạo
    if (orderId) {
      data.orderId = orderId;
    }
  }

  async actionAfterCreate(data: OrderDetail, req?: Request, manager?: IEntityManager): Promise<void> {
    await this.calculateOrderData.process(data.orderId, manager);
  }

  async actionAfterUpdate(data: OrderDetail, req?: Request, manager?: IEntityManager): Promise<void> {
    await this.calculateOrderData.process(data.orderId, manager);
  }

  async actionAfterDelete(data: OrderDetail, req?: Request, manager?: IEntityManager): Promise<void> {
    await this.calculateOrderData.process(data.orderId, manager);
  }
}
