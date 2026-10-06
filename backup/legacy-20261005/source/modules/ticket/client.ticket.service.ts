import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { ClientTicketRepository } from "./client.ticket.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { TICKET_TYPES } from "./ticket.types";
import { COMMON_TYPES } from "../common/common.types";
import { NOTIFICATION_TYPES } from "../notification/notification.types";
import { Ticket } from "@/database/models/Ticket";
import { TicketRelations, TicketSelectFull } from "./ticket.select";
import { TicketStatusEnum, UserRoleEnum, NotificationTypeEnum } from "@/shared/constants/constance";
import { NotificationService } from "../notification/notification.service";
import { UserRepository } from "../user/user.repository";
import { USER_TYPES } from "../user/user.types";
import { DeepPartial, EntityManager } from "typeorm";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { IEntityManager } from "@/shared/types/interfaces";
import { Request } from "express";

@injectable()
export class ClientTicketService extends BaseService<Ticket> {
  protected relations = TicketRelations;
  protected selectedFields = TicketSelectFull;
  constructor(
    @inject(TICKET_TYPES.ClientTicketRepository) private ticketRepository: ClientTicketRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(NOTIFICATION_TYPES.NotificationService) private notificationService: NotificationService,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
  ) {
    super(ticketRepository);
  }

  async validateBeforeCreate(data: DeepPartial<Ticket>, req?: Request, manager?: IEntityManager): Promise<void> {
    const customerId = req?.user?.customerId;
    if (!customerId) {
      throw new BadRequestError("Customer ID is required");
    }
    data.customerId = customerId;
    data.status = TicketStatusEnum.OPEN;
  }

  async actionAfterCreate(ticket: Ticket, _req?: any, manager?: EntityManager): Promise<void> {
    // Get all ADMIN and SUPPORT users
    const adminUsers = await this.userRepository.findByOptions({
      where: { role: UserRoleEnum.ADMIN },
    });
    const supportUsers = await this.userRepository.findByOptions({
      where: { role: UserRoleEnum.SUPPORT },
    });

    const adminAndSupportUsers = [...adminUsers, ...supportUsers];
    const targetUserIds = adminAndSupportUsers.map((user) => user.id);

    if (targetUserIds.length > 0) {
      const title = `New Ticket: ${ticket.issue}`;
      const content = `Customer reported: ${ticket.description.substring(0, 100)}...`;

      await this.notificationService.createNotificationForMultipleUsers(
        targetUserIds,
        {
          title,
          content,
          type: NotificationTypeEnum.ALERT,
          objectId: ticket.id,
          metadata: {
            ticketId: ticket.id,
            customerId: ticket.customerId,
            type: ticket.type,
            priority: ticket.priority,
          },
        },
        manager,
      );
    }
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
}
