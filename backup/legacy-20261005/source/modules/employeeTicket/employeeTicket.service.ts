import { injectable, inject } from "inversify";
import { DeepPartial, EntityManager } from "typeorm";
import { Request } from "express";
import { BaseService } from "@/shared/base/BaseService";
import { EmployeeTicket } from "@/database/models/EmployeeTicket";
import { EmployeeTicketRepository } from "./employeeTicket.repository";
import { EmployeeTicketParticipantRepository } from "./employeeTicketParticipant.repository";
import { EMPLOYEE_TICKET_TYPES } from "./employeeTicket.types";
import { COMMON_TYPES } from "../common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { USER_TYPES } from "../user/user.types";
import { UserRepository } from "../user/user.repository";
import { EMPLOYEE_TYPES } from "../employee/employee.types";
import { EmployeeRepository } from "../employee/employee.repository";
import { NOTIFICATION_TYPES } from "../notification/notification.types";
import { NotificationService } from "../notification/notification.service";
import {
  EmployeeStatusType,
  EmployeeTicketStatusEnum,
  NotificationTypeEnum,
} from "@/shared/constants/constance";
import { EmployeeTicketRelations, EmployeeTicketSelectFull } from "./employeeTicket.select";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { ForbiddenError, BadRequestError, NotFoundError, UnauthorizedError } from "@/shared/types/errors";
import {
  canAccessEmployeeTicket,
  canCreateEmployeeTicket,
  canReadEmployeeTickets,
  canUpdateEmployeeTickets,
  resolveEmployeeTicketNotificationRecipientIds,
} from "./employeeTicket.permissions";
import { ApiResponse } from "@/shared/types/interfaces";

@injectable()
export class EmployeeTicketService extends BaseService<EmployeeTicket> {
  protected relations = EmployeeTicketRelations;
  protected selectedFields = EmployeeTicketSelectFull;
  protected searchableFields = ["issue", "description"] as (keyof EmployeeTicket)[] & string[];

  constructor(
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketRepository)
    private employeeTicketRepository: EmployeeTicketRepository,
    @inject(COMMON_TYPES.TransactionManager)
    private transactionManager: TransactionManager,
    @inject(USER_TYPES.UserRepository)
    private userRepository: UserRepository,
    @inject(EMPLOYEE_TYPES.EmployeeRepository)
    private employeeRepository: EmployeeRepository,
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantRepository)
    private employeeTicketParticipantRepository: EmployeeTicketParticipantRepository,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private notificationService: NotificationService,
  ) {
    super(employeeTicketRepository);
  }

  private requireActor(req?: Request): NonNullable<Request["user"]> {
    if (!req?.user?.userId) {
      throw new UnauthorizedError("Invalid or expired token");
    }
    return req.user;
  }

  private async assertCanCreate(req: Request, manager?: EntityManager): Promise<void> {
    const actor = this.requireActor(req);
    const user = await this.userRepository.findById(actor.userId, manager);
    if (!user || !canCreateEmployeeTicket(user)) {
      throw new ForbiddenError("Tài khoản không liên kết với nhân viên đang hoạt động");
    }

    const employee = await this.employeeRepository.findById(actor.employeeId as string, manager);
    if (!employee || employee.status !== EmployeeStatusType.ACTIVE) {
      throw new ForbiddenError("Nhân viên không còn hoạt động");
    }
  }

  private async assertCanAccess(
    ticket: EmployeeTicket,
    req?: Request,
    manager?: EntityManager,
  ): Promise<void> {
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
  }

  private async findNotificationRecipientIds(manager?: EntityManager): Promise<string[]> {
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

    return resolveEmployeeTicketNotificationRecipientIds(users);
  }

  async create(data: DeepPartial<EmployeeTicket>, req?: Request): Promise<ApiResponse<EmployeeTicket>> {
    return this.transactionManager.withTransaction(async (tx) => {
      return super.create(data, req, tx.manager);
    });
  }

  async validateBeforeCreate(data: DeepPartial<EmployeeTicket>, req?: Request, manager?: EntityManager): Promise<void> {
    if (!req) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    await this.assertCanCreate(req, manager);
    const actor = this.requireActor(req);

    data.employeeId = actor.employeeId as string;
    data.createdByUserId = actor.userId;
    data.status = EmployeeTicketStatusEnum.OPEN;
  }

  async actionAfterCreate(ticket: EmployeeTicket, _req?: Request, manager?: EntityManager): Promise<void> {
    const recipientIds = await this.findNotificationRecipientIds(manager);
    if (recipientIds.length === 0) {
      return;
    }

    await this.notificationService.createNotificationForMultipleUsers(
      recipientIds,
      {
        title: `Ticket nội bộ mới: ${ticket.issue}`,
        content: ticket.description.slice(0, 160),
        type: NotificationTypeEnum.ALERT,
        objectId: ticket.id,
        metadata: {
          employeeTicketId: ticket.id,
          employeeId: ticket.employeeId,
          type: ticket.type,
          priority: ticket.priority,
        },
      },
      manager,
    );
  }

  async findById(id: string, req?: Request, manager?: EntityManager) {
    const ticket = await this.employeeTicketRepository.findById(id, manager, false, req);
    if (!ticket) {
      throw new NotFoundError("Employee ticket not found");
    }

    await this.assertCanAccess(ticket, req, manager);
    return ApiResponseHandler.getSuccess("OK", ticket);
  }

  async updateTicketStatus(id: string, status: EmployeeTicketStatusEnum, req?: Request) {
    return this.transactionManager.withTransactionCallback(async (manager) => {
      const ticket = await this.employeeTicketRepository.findById(id, manager, false, req);
      if (!ticket) {
        throw new NotFoundError("Employee ticket not found");
      }

      const actor = this.requireActor(req);
      if (!canUpdateEmployeeTickets(actor)) {
        throw new ForbiddenError("Bạn không có quyền xử lý ticket nội bộ");
      }
      if (ticket.status === EmployeeTicketStatusEnum.CLOSED) {
        throw new BadRequestError("Employee ticket is already closed");
      }
      if (ticket.status === status) {
        throw new BadRequestError(`Employee ticket is already in ${status} status`);
      }

      const updatedTicket = await this.employeeTicketRepository.update(id, { status }, manager);
      if (!updatedTicket) {
        throw new NotFoundError("Employee ticket not found");
      }

      if (ticket.createdByUserId !== actor.userId) {
        await this.notificationService.createNotificationForMultipleUsers(
          [ticket.createdByUserId],
          {
            title: "Cập nhật ticket nội bộ",
            content: `${ticket.issue}: ${status}`,
            type: NotificationTypeEnum.ALERT,
            objectId: ticket.id,
            metadata: { employeeTicketId: ticket.id, status },
          },
          manager,
        );
      }

      return ApiResponseHandler.updateSuccess("OK", updatedTicket);
    });
  }

  async closeTicket(id: string, req?: Request) {
    return this.updateTicketStatus(id, EmployeeTicketStatusEnum.CLOSED, req);
  }
}
