import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { TicketReplyRepository } from "./ticketReply.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { TICKET_REPLY_TYPES } from "./ticketReply.types";
import { TicketReply } from "@/database/models/TicketReply";
import { TicketReplyRelations, TicketReplySelectFull } from "./ticketReply.select";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { TICKET_TYPES } from "../ticket.types";
import { TicketStatusEnum, NotificationTypeEnum, TicketReplyTypeEnum } from "@/shared/constants/constance";
import { NotificationService } from "@/modules/notification/notification.service";
import { AdminTicketRepository } from "../admin.ticket.repository";
import { DeepPartial, EntityManager } from "typeorm";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { USER_TYPES } from "@/modules/user/user.types";
import { UserRepository } from "@/modules/user/user.repository";

@injectable()
export class TicketReplyService extends BaseService<TicketReply> {
  protected relations = TicketReplyRelations;
  protected selectedFields = TicketReplySelectFull;
  constructor(
    @inject(TICKET_REPLY_TYPES.TicketReplyRepository) private ticketReplyRepository: TicketReplyRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(NOTIFICATION_TYPES.NotificationService) private notificationService: NotificationService,
    @inject(TICKET_TYPES.AdminTicketRepository) private ticketRepository: AdminTicketRepository,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
  ) {
    super(ticketReplyRepository);
  }

  async validateBeforeQuery(options: IFindOptions<TicketReply>, _req?: Request): Promise<void> {
    const ticketId = (options as { ticketId?: string }).ticketId;
    if (!ticketId) {
      return;
    }

    options.where = {
      ...(options.where || {}),
      ticketId,
    } as any;
  }

  async validateBeforeCreate(data: DeepPartial<TicketReply>, req?: Request, manager?: IEntityManager): Promise<void> {
    const ticketId = data.ticketId || (req?.params.ticketId as string);
    if (!ticketId) {
      throw new Error("ticketId is required");
    }

    const ticket = await this.ticketRepository.findById(ticketId, manager);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const user = await this.userRepository.findById(data.userId!, manager);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    console.log("ticketId", ticketId);

    Object.assign(data, {
      ticketId,
    });
  }

  async actionAfterCreate(reply: TicketReply, _req?: any, manager?: EntityManager): Promise<void> {
    const ticket = await this.ticketRepository.findById(reply.ticketId);
    if (!ticket) return;

    // Update ticket status if this is first admin/support reply
    const isInternalReply = reply.type === TicketReplyTypeEnum.ADMIN || reply.type === TicketReplyTypeEnum.SUPPORT;

    if (ticket.status === TicketStatusEnum.OPEN && isInternalReply) {
      ticket.status = TicketStatusEnum.IN_PROGRESS;
      await this.ticketRepository.update(reply.ticketId, { status: TicketStatusEnum.IN_PROGRESS } as any);
    }

    // Send notification to customer if admin/support replies
    if (isInternalReply) {
      const responderLabel = reply.type === TicketReplyTypeEnum.SUPPORT ? "Support" : "Admin";
      const title = `Ticket reply from ${responderLabel.toLowerCase()}`;
      const content = `${responderLabel} replied: ${reply.content.substring(0, 100)}...`;

      const customerUserId = await this.userRepository.findUserIdByCustomerId(ticket.customerId);
      if (customerUserId) {
        await this.notificationService.createNotificationForMultipleUsers(
          [customerUserId],
          {
            title,
            content,
            type: NotificationTypeEnum.ALERT,
            objectId: ticket.id,
            metadata: {
              ticketId: ticket.id,
              replyId: reply.id,
            },
          },
          manager,
        );
      }
    }
  }
}
