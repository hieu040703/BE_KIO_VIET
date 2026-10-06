import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { AdminTicketRepository } from "./admin.ticket.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { TICKET_TYPES } from "./ticket.types";
import { COMMON_TYPES } from "../common/common.types";
import { NOTIFICATION_TYPES } from "../notification/notification.types";
import { Ticket } from "@/database/models/Ticket";
import { TicketRelations, TicketSelectFull } from "./ticket.select";
import { TicketStatusEnum, NotificationTypeEnum } from "@/shared/constants/constance";
import { NotificationService } from "../notification/notification.service";
import { EntityManager } from "typeorm";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";

@injectable()
export class AdminTicketService extends BaseService<Ticket> {
  protected relations = TicketRelations;
  protected selectedFields = TicketSelectFull;
  constructor(
    @inject(TICKET_TYPES.AdminTicketRepository) private ticketRepository: AdminTicketRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(NOTIFICATION_TYPES.NotificationService) private notificationService: NotificationService,
  ) {
    super(ticketRepository);
  }

  async closeTicket(ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    if (ticket.status === TicketStatusEnum.CLOSED) {
      throw new BadRequestError("Ticket is already closed");
    }

    const updatedTicket = await this.ticketRepository.update(ticketId, {
      status: TicketStatusEnum.CLOSED,
    } as any);

    if (!updatedTicket) {
      throw new Error("Failed to close ticket");
    }

    return updatedTicket;
  }

  async updateTicketStatus(ticketId: string, status: TicketStatusEnum, _manager?: EntityManager): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    if (ticket.status === status) {
      throw new BadRequestError(`Ticket is already in ${status} status`);
    }

    const updatedTicket = await this.ticketRepository.update(ticketId, {
      status,
    } as any);

    if (!updatedTicket) {
      throw new Error("Failed to update ticket status");
    }

    return updatedTicket;
  }
}
