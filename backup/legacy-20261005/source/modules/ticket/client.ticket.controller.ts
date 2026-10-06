import { injectable, inject } from "inversify";
import { ClientTicketService } from "./client.ticket.service";
import { TICKET_TYPES } from "./ticket.types";
import { BaseController } from "@/shared/base/BaseController";
import { Request, Response, NextFunction } from "express";

@injectable()
export class ClientTicketController extends BaseController<ClientTicketService> {
  constructor(@inject(TICKET_TYPES.ClientTicketService) protected service: ClientTicketService) {
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
}
    