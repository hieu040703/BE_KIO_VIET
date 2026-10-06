import { Order } from "@/database/models/Order";
import { BaseService } from "@/shared/base/BaseService";
import { injectable, inject } from "inversify";
import { OrderRelations, OrderSelectFull } from "./order.select";
import { ORDER_TYPES } from "./order.types";
import { ClientOrderRepository } from "./client.order.repository";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { IEntityManager, ApiResponse } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { ClientOrderQueryDto } from "./order.validator";
import { CUSTOMER_TYPES } from "../customer/customer.types";
import { CustomerRepository } from "../customer/customer.repository";
import { Request, Response } from "express";

@injectable()
export class ClientOrderService extends BaseService<Order> {
  protected relations = OrderRelations;
  protected selectedFields = OrderSelectFull;
  constructor(
    @inject(ORDER_TYPES.ClientOrderRepository) private orderRepository: ClientOrderRepository,
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
  ) {
    super(orderRepository);
  }

  //? for client use
  /**
   * Lấy tất cả các file liên quan đến khách hàng trong tất cả các hợp đồng của khách hàng đó, bao gồm: file đính kèm trong hợp đồng, file đính kèm trong comment của hợp đồng, file đính kèm trong phiếu thu liên quan đến hợp đồng, v.v...
   * Mục đích để hiển thị trong mục "Tài liệu của tôi" cho khách hàng
   * @param customerId
   * @param data
   * @param req
   * @param manager
   * @returns
   */
  async getFileInAllOrderByCustomer(
    customerId: string,
    data: ClientOrderQueryDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<any[]>> {
    console.log("customerId", customerId);
    //? kiểm tra customerId có phải là uuid hợp lệ không
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(customerId)) {
      throw new BadRequestError("Mã khách hàng không chính xác, vui lòng liên hệ bộ phận chăm sóc khách hàng");
    }

    const customer = await this.customerRepository.findById(customerId, manager);
    if (!customer) {
      throw new NotFoundError("Mã khách hàng không chính xác, vui lòng liên hệ bộ phận chăm sóc khách hàng");
    }

    const res = await this.orderRepository.getFileInAllOrderByCustomer(customerId, data, req, manager);

    return ApiResponseHandler.getSuccess(
      "OK",
      res.data,
      {
        totalRecords: res.total,
        currentPage: data.page,
        size: data.size,
        totalPages: Math.ceil(res.total / data.size),
      },
      {
        customer,
      },
    );
  }
}
