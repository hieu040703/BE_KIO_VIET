import { injectable, inject } from "inversify";
import { NextFunction, Request, Response } from "express";
import { AdminServiceOrderService } from "./admin.serviceOrder.service";
import { SERVICE_ORDER_TYPES } from "./serviceOrder.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class AdminServiceOrderController extends BaseController<AdminServiceOrderService> {
  constructor(
    @inject(SERVICE_ORDER_TYPES.AdminServiceOrderService)
    protected service: AdminServiceOrderService,
  ) {
    super(service);
  }

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.cancel(id, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };

  confirm = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.confirm(id, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };

  submitQuote = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.submitQuote(id, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };

  startProcessing = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.startProcessing(id, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };

  checkIn = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.checkIn(id, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };

  completeByEmployee = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.completeByEmployee(id, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };
}
