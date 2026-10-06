import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { OrderDetailService } from "./orderDetail.service";
import { ORDER_DETAIL_TYPES } from "./orderDetail.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class OrderDetailController extends BaseController<OrderDetailService> {
  constructor(@inject(ORDER_DETAIL_TYPES.OrderDetailService) protected service: OrderDetailService) {
    super(service);
  }
}
