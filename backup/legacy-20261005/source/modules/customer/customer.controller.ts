import { injectable, inject } from "inversify";
import { CustomerService } from "./customer.service";
import { CUSTOMER_TYPES } from "./customer.types";
import { ORDER_TYPES } from "../order/order.types";
import { Request, Response } from "express";
import { COMMON_TYPES } from "../common/common.types";
import { DEBT_TYPES } from "../accountant/debt/debt.types";
import { DebtService } from "../accountant/debt/debt.service";
import { ClientOrderQueryDto } from "../order/order.validator";
import { BaseController } from "@/shared/base/BaseController";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ClientOrderService } from "../order/client.order.service";

@injectable()
export class CustomerController extends BaseController<CustomerService> {
  constructor(
    @inject(CUSTOMER_TYPES.CustomerService) protected service: CustomerService,
    @inject(ORDER_TYPES.ClientOrderService) protected orderService: ClientOrderService,
    @inject(DEBT_TYPES.DebtService) protected debtService: DebtService,
    @inject(COMMON_TYPES.TransactionManager) protected transactionManager: TransactionManager,
  ) {
    super(service);
  }

  getAttachmentInOrders = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const data = await this.orderService.getFileInAllOrderByCustomer(
        req.params.id as string,
        req.query as unknown as ClientOrderQueryDto,
        req,
      );
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

  getDebts = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      console.log("customerId", req.params.id as string);
      const customerId = req.params.id as string;
      const data = await this.debtService.getDebtByCustomerId(customerId, req.query);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const data = await this.service.updateClientProfile(req.body, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      // Hoặc nếu muốn quản lý transaction từ controller
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.create(req.body, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };
}
