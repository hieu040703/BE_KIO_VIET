import { injectable, inject } from "inversify";
import { DeepPartial, EntityManager } from "typeorm";
import { Request } from "express";
import { BaseService } from "@/shared/base/BaseService";
import { EmployeeTicketReply } from "@/database/models/EmployeeTicketReply";
import { EmployeeTicketReplyRepository } from "./employeeTicketReply.repository";
import { EMPLOYEE_TICKET_REPLY_TYPES } from "./employeeTicketReply.types";
import { EMPLOYEE_TICKET_TYPES } from "./employeeTicket.types";
import { EmployeeTicketRepository } from "./employeeTicket.repository";
import { EmployeeTicketParticipantRepository } from "./employeeTicketParticipant.repository";
import { COMMON_TYPES } from "../common/common.types";
import { USER_TYPES } from "../user/user.types";
import { UserRepository } from "../user/user.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { NOTIFICATION_TYPES } from "../notification/notification.types";
import { NotificationService } from "../notification/notification.service";
import {
  EmployeeTicketReplyTypeEnum,
  EmployeeTicketStatusEnum,
  NotificationTypeEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { EmployeeTicketReplyRelations, EmployeeTicketReplySelectFull } from "./employeeTicketReply.select";
import { ApiResponse, IFindOptions } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/shared/types/errors";
import {
  canAccessEmployeeTicket,
  canReadEmployeeTickets,
  resolveEmployeeTicketNotificationRecipientIds,
} from "./employeeTicket.permissions";

@injectable()
export class EmployeeTicketReplyService extends BaseService<EmployeeTicketReply> {
  protected relations = EmployeeTicketReplyRelations;
  protected selectedFields = EmployeeTicketReplySelectFull;

  constructor(
    @inject(EMPLOYEE_TICKET_REPLY_TYPES.EmployeeTicketReplyRepository)
    private employeeTicketReplyRepository: EmployeeTicketReplyRepository,
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketRepository)
    private employeeTicketRepository: EmployeeTicketRepository,
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantRepository)
    private employeeTicketParticipantRepository: EmployeeTicketParticipantRepository,
    @inject(COMMON_TYPES.TransactionManager)
    private transactionManager: TransactionManager,
    @inject(USER_TYPES.UserRepository)
    private userRepository: UserRepository,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private notificationService: NotificationService,
  ) {
    super(employeeTicketReplyRepository);
  }

  private requireActor(req?: Request): NonNullable<Request["user"]> {
    if (!req?.user?.userId) {
      throw new UnauthorizedError("Invalid or expired token");
    }
    return req.user;
  }

  private async assertTicketAccess(ticketId: string, req: Request, manager?: EntityManager) {
    const ticket = await this.employeeTicketRepository.findById(ticketId, manager, false, req);
    if (!ticket) {
      throw new NotFoundError("Employee ticket not found");
    }

    const actor = this.requireActor(req);
    const isParticipant =
      !canReadEmployeeTickets(actor) &&
      Boolean(
        await this.employeeTicketParticipantRepository.findActiveByTicketAndUser(
          ticket.id,
          actor.userId,
          manager,
        ),
      );
    if (!canAccessEmployeeTicket(ticket, actor, isParticipant)) {
      throw new ForbiddenError("Bạn không có quyền truy cập ticket này");
    }

    return ticket;
  }

  async create(data: DeepPartial<EmployeeTicketReply>, req?: Request): Promise<ApiResponse<EmployeeTicketReply>> {
    return this.transactionManager.withTransaction(async (tx) => {
      return super.create(data, req, tx.manager);
    });
  }

  async validateBeforeQuery(
    options: IFindOptions<EmployeeTicketReply>,
    req?: Request,
    manager?: EntityManager,
  ): Promise<void> {
    const ticketId = (req?.params.ticketId || (options as { employeeTicketId?: string }).employeeTicketId) as string;
    if (!ticketId || !req) {
      throw new NotFoundError("Employee ticket not found");
    }

    await this.assertTicketAccess(ticketId, req, manager);
    options.where = {
      ...(options.where || {}),
      employeeTicketId: ticketId,
    } as any;
  }

  async validateBeforeCreate(
    data: DeepPartial<EmployeeTicketReply>,
    req?: Request,
    manager?: EntityManager,
  ): Promise<void> {
    if (!req) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const ticketId = (req.params.ticketId || data.employeeTicketId) as string;
    const ticket = await this.assertTicketAccess(ticketId, req, manager);
    const actor = this.requireActor(req);

    data.employeeTicketId = ticket.id;
    data.userId = actor.userId;
    data.type =
      actor.role === UserRoleEnum.ADMIN
        ? EmployeeTicketReplyTypeEnum.ADMIN
        : actor.employeeId === ticket.employeeId
          ? EmployeeTicketReplyTypeEnum.EMPLOYEE
          : EmployeeTicketReplyTypeEnum.AUTHORIZED_USER;
  }

  async actionAfterCreate(reply: EmployeeTicketReply, req?: Request, manager?: EntityManager): Promise<void> {
    const ticket = await this.employeeTicketRepository.findById(reply.employeeTicketId, manager, false, req);
    if (!ticket) {
      return;
    }

    if (
      ticket.status === EmployeeTicketStatusEnum.OPEN &&
      reply.type !== EmployeeTicketReplyTypeEnum.EMPLOYEE
    ) {
      await this.employeeTicketRepository.update(
        ticket.id,
        { status: EmployeeTicketStatusEnum.IN_PROGRESS },
        manager,
      );
    }

    const users = await this.userRepository.getRepository(manager).find({
      where: { isActive: true },
      relations: { permissionGroup: true },
      select: {
        id: true,
        role: true,
        isActive: true,
        permissionGroup: {
          id: true,
          permissions: true,
        },
      },
    });
    const participantUserIds = await this.employeeTicketParticipantRepository.findActiveUserIdsByTicketId(
      ticket.id,
      manager,
    );
    const uniqueRecipientIds = [
      ...new Set([
        ...resolveEmployeeTicketNotificationRecipientIds(users),
        ticket.createdByUserId,
        ...participantUserIds,
      ]),
    ].filter((userId) => userId !== reply.userId);
    if (uniqueRecipientIds.length > 0) {
      await this.notificationService.createNotificationForMultipleUsers(
        uniqueRecipientIds,
        {
          title: "Phản hồi ticket nội bộ",
          content: reply.content.slice(0, 160),
          type: NotificationTypeEnum.ALERT,
          objectId: ticket.id,
          metadata: {
            employeeTicketId: ticket.id,
            employeeTicketReplyId: reply.id,
          },
        },
        manager,
      );
    }
  }

  async findById(id: string, req?: Request, manager?: EntityManager) {
    const reply = await this.employeeTicketReplyRepository.findById(id, manager, false, req);
    if (!reply) {
      throw new NotFoundError("Employee ticket reply not found");
    }

    await this.assertTicketAccess(reply.employeeTicketId, req as Request, manager);
    return ApiResponseHandler.getSuccess("OK", reply);
  }
}
