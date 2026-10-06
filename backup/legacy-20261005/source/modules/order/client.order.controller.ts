import { injectable, inject } from "inversify";
import { ORDER_TYPES } from "./order.types";
import { BaseController } from "@/shared/base/BaseController";
import { Request, Response } from "express";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { COMMON_TYPES } from "../common/common.types";
import { ClientOrderService } from "./client.order.service";

@injectable()
export class ClientOrderController extends BaseController<ClientOrderService> {
  constructor(
    @inject(ORDER_TYPES.ClientOrderService) protected service: ClientOrderService,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(service);
  }

  //? for client router
  getFileInAllOrderByCustomer = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const result = await this.service.getFileInAllOrderByCustomer(req.params.id as string, req.query as any, req, undefined);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };
}
