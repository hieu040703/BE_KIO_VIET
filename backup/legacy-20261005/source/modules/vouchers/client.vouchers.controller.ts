import { TransactionManager } from "@/shared/base/TransactionManager";
import { BaseController } from "@/shared/base/BaseController";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { ClientVouchersService } from "./client.vouchers.service";
import { VOUCHERS_TYPES } from "./vouchers.types";

@injectable()
export class ClientVouchersController extends BaseController<ClientVouchersService> {
  constructor(
    @inject(VOUCHERS_TYPES.ClientVouchersService)
    protected service: ClientVouchersService,
    @inject(COMMON_TYPES.TransactionManager)
    private transactionManager: TransactionManager,
  ) {
    super(service);
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return this.service.create(req.body, req, tx.manager);
      });
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };
}
