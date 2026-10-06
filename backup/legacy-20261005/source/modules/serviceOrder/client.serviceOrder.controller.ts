import { injectable, inject } from "inversify";
import { NextFunction, Request, Response } from "express";
import { ClientServiceOrderService } from "./client.serviceOrder.service";
import { SERVICE_ORDER_TYPES } from "./serviceOrder.types";
import { BaseController } from "@/shared/base/BaseController";
import { COMMON_TYPES } from "../common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";

@injectable()
export class ClientServiceOrderController extends BaseController<ClientServiceOrderService> {
  constructor(
    @inject(SERVICE_ORDER_TYPES.ClientServiceOrderService) protected service: ClientServiceOrderService,
    @inject(COMMON_TYPES.TransactionManager) private readonly transactionManager: TransactionManager,
  ) {
    super(service);
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.createCustomerOrder(req.body, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  estimatePrice = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.service.estimatePrice(req.body, req);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.update(id, req.body, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.cancelOrder(id, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  confirmCompleted = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.confirmCompleted(id, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  createCustomerRating = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.createCustomerRating(id, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  confirmQuote = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.confirmQuote(id, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };
}
