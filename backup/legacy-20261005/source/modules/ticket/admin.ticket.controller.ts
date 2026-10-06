import { injectable, inject } from "inversify";
import { AdminTicketService } from "./admin.ticket.service";
import { TICKET_TYPES } from "./ticket.types";
import { BaseController } from "@/shared/base/BaseController";
import { Request, Response, NextFunction } from "express";
import { TicketStatusEnum } from "@/shared/constants/constance";

@injectable()
export class AdminTicketController extends BaseController<AdminTicketService> {
  constructor(@inject(TICKET_TYPES.AdminTicketService) protected service: AdminTicketService) {
    super(service);
  }

  closeTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const ticket = await this.service.closeTicket(id as string);
      res.status(200).json({ statusCode: 200, data: ticket, message: "Ticket closed successfully" });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const ticket = await this.service.updateTicketStatus(id as string, status as TicketStatusEnum);
      res.status(200).json({ statusCode: 200, data: ticket, message: "Ticket status updated successfully" });
    } catch (error) {
      next(error);
    }
  };
}
    