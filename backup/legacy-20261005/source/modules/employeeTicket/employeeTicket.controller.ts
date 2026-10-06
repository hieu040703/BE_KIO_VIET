import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { BaseController } from "@/shared/base/BaseController";
import { EmployeeTicketService } from "./employeeTicket.service";
import { EMPLOYEE_TICKET_TYPES } from "./employeeTicket.types";
import { EmployeeTicketStatusEnum } from "@/shared/constants/constance";

@injectable()
export class EmployeeTicketController extends BaseController<EmployeeTicketService> {
  constructor(
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketService)
    protected service: EmployeeTicketService,
  ) {
    super(service);
  }

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.updateTicketStatus(
        req.params.id as string,
        req.body.status as EmployeeTicketStatusEnum,
        req,
      );
      res.status(ticket.statusCode).json(ticket);
    } catch (error) {
      next(error);
    }
  };

  closeTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.service.closeTicket(req.params.id as string, req);
      res.status(ticket.statusCode).json(ticket);
    } catch (error) {
      next(error);
    }
  };
}
