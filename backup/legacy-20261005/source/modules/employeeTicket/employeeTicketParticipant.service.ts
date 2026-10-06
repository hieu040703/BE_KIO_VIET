import { injectable, inject } from "inversify";
import { EntityManager, In, IsNull, Brackets } from "typeorm";
import { Request } from "express";
import { User } from "@/database/models/User";
import { EmployeeTicket } from "@/database/models/EmployeeTicket";
import { EmployeeTicketParticipant } from "@/database/models/EmployeeTicketParticipant";
import { EmployeeTicketParticipantRepository } from "./employeeTicketParticipant.repository";
import { EmployeeTicketRepository } from "./employeeTicket.repository";
import { EMPLOYEE_TICKET_TYPES } from "./employeeTicket.types";
import { COMMON_TYPES } from "../common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { USER_TYPES } from "../user/user.types";
import { UserRepository } from "../user/user.repository";
import { NOTIFICATION_TYPES } from "../notification/notification.types";
import { NotificationService } from "../notification/notification.service";
import { EmployeeTicketParticipantQueryDto } from "./employeeTicket.validator";
import { ApiResponse } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/shared/types/errors";
import {
  NotificationTypeEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { canManageEmployeeTicketParticipants } from "./employeeTicket.permissions";

const INTERNAL_USER_ROLES = [
  UserRoleEnum.ADMIN,
  UserRoleEnum.MANAGER,
  UserRoleEnum.EMPLOYEE,
];

@injectable()
export class EmployeeTicketParticipantService {
  constructor(
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantRepository)
    private participantRepository: EmployeeTicketParticipantRepository,
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketRepository)
    private employeeTicketRepository: EmployeeTicketRepository,
    @inject(USER_TYPES.UserRepository)
    private userRepository: UserRepository,
    @inject(COMMON_TYPES.TransactionManager)
    private transactionManager: TransactionManager,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private notificationService: NotificationService,
  ) {}

  private requireActor(req?: Request): NonNullable<Request["user"]> {
    if (!req?.user?.userId) {
      throw new UnauthorizedError("Invalid or expired token");
    }
    return req.user;
  }

  private requireAdminActor(req?: Request): NonNullable<Request["user"]> {
    const actor = this.requireActor(req);
    if (actor.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenError(
        "Chỉ quản trị viên mới được quản lý người tham gia ticket",
      );
    }
    return actor;
  }

  private async assertAdmin(
    req?: Request,
    manager?: EntityManager,
  ): Promise<NonNullable<Request["user"]>> {
    const actor = this.requireAdminActor(req);
    const user = await this.userRepository.findById(actor.userId, manager);
    if (!user || !canManageEmployeeTicketParticipants(user)) {
      throw new ForbiddenError(
        "Chỉ quản trị viên mới được quản lý người tham gia ticket",
      );
    }
    return actor;
  }

  private async findTicket(
    employeeTicketId: string,
    req: Request,
    manager?: EntityManager,
  ): Promise<EmployeeTicket> {
    const ticket = await this.employeeTicketRepository.findById(
      employeeTicketId,
      manager,
      false,
      req,
    );
    if (!ticket) {
      throw new NotFoundError("Employee ticket not found");
    }
    return ticket;
  }

  async findCandidates(
    options: EmployeeTicketParticipantQueryDto,
    req?: Request,
  ): Promise<ApiResponse<User[]>> {
    await this.assertAdmin(req);
    const page = options.page || 1;
    const size = options.size || 20;
    const repository = this.userRepository.getRepository();
    const qb = repository
      .createQueryBuilder("user")
      .leftJoin("user.employee", "employee")
      .select([
        "user.id",
        "user.name",
        "user.code",
        "user.email",
        "user.phone",
        "user.avatar",
        "user.role",
        "user.employeeId",
        "user.isActive",
        "employee.id",
        "employee.name",
        "employee.code",
      ])
      .where("user.isActive = :isActive", { isActive: true })
      .andWhere("user.role IN (:...roles)", { roles: INTERNAL_USER_ROLES })
      .andWhere("user.customerId IS NULL");

    const keyword = options.keyword?.trim();
    if (keyword) {
      qb.andWhere(
        new Brackets((searchQb) => {
          searchQb
            .where("user.name ILIKE :keyword", { keyword: `%${keyword}%` })
            .orWhere("user.code ILIKE :keyword", { keyword: `%${keyword}%` })
            .orWhere("user.email ILIKE :keyword", { keyword: `%${keyword}%` })
            .orWhere("user.phone ILIKE :keyword", { keyword: `%${keyword}%` });
        }),
      );
    }

    const [users, total] = await qb
      .orderBy("user.name", "ASC", "NULLS LAST")
      .addOrderBy("user.code", "ASC")
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return ApiResponseHandler.getSuccess("OK", users, {
      totalRecords: total,
      currentPage: page,
      size,
      totalPages: Math.ceil(total / size),
    });
  }

  async findByTicketId(
    employeeTicketId: string,
    req?: Request,
  ): Promise<ApiResponse<EmployeeTicketParticipant[]>> {
    await this.findTicket(employeeTicketId, req as Request);
    const participants =
      await this.participantRepository.findActiveByTicketId(employeeTicketId);
    return ApiResponseHandler.getSuccess("OK", participants);
  }

  async add(
    employeeTicketId: string,
    userIds: string[],
    req?: Request,
  ): Promise<ApiResponse<EmployeeTicketParticipant[]>> {
    this.requireAdminActor(req);
    return this.transactionManager.withTransaction(async (tx) => {
      const actor = await this.assertAdmin(req, tx.manager);
      const ticket = await this.findTicket(
        employeeTicketId,
        req as Request,
        tx.manager,
      );
      const uniqueUserIds = [...new Set(userIds)];

      if (uniqueUserIds.includes(ticket.createdByUserId)) {
        throw new BadRequestError(
          "Ticket creator cannot be added as a participant",
        );
      }

      const users = await this.userRepository.getRepository(tx.manager).find({
        where: {
          id: In(uniqueUserIds),
          isActive: true,
          role: In(INTERNAL_USER_ROLES),
          customerId: IsNull(),
        },
        select: { id: true },
      });
      const validUserIds = new Set(users.map((user) => user.id));
      const invalidUserIds = uniqueUserIds.filter(
        (userId) => !validUserIds.has(userId),
      );
      if (invalidUserIds.length > 0) {
        throw new BadRequestError("Danh sách người tham gia không hợp lệ");
      }

      const existingParticipants =
        await this.participantRepository.findActiveByTicketAndUserIds(
          employeeTicketId,
          uniqueUserIds,
          tx.manager,
        );
      const existingUserIds = new Set(
        existingParticipants.map((participant) => participant.userId),
      );
      const newUserIds = uniqueUserIds.filter(
        (userId) => !existingUserIds.has(userId),
      );

      if (newUserIds.length > 0) {
        await this.participantRepository.createMany(
          newUserIds.map((userId) => ({
            employeeTicketId,
            userId,
            addedByUserId: actor.userId,
            removedByUserId: null,
          })),
          tx.manager,
        );

        await this.notificationService.createNotificationForMultipleUsers(
          newUserIds,
          {
            title: "Bạn được thêm vào ticket nội bộ",
            content: ticket.issue,
            type: NotificationTypeEnum.ALERT,
            objectId: ticket.id,
            metadata: {
              employeeTicketId: ticket.id,
              event: "PARTICIPANT_ADDED",
            },
          },
          tx.manager,
        );
      }

      const participants =
        await this.participantRepository.findActiveByTicketId(
          employeeTicketId,
          tx.manager,
        );
      return ApiResponseHandler.createSuccess("OK", participants);
    });
  }

  async remove(
    employeeTicketId: string,
    userId: string,
    req?: Request,
  ): Promise<ApiResponse<null>> {
    this.requireAdminActor(req);
    return this.transactionManager.withTransaction(async (tx) => {
      const actor = await this.assertAdmin(req, tx.manager);
      await this.findTicket(employeeTicketId, req as Request, tx.manager);
      await this.participantRepository.softDeleteByTicketAndUser(
        employeeTicketId,
        userId,
        actor.userId,
        tx.manager,
      );
      return ApiResponseHandler.deleteSuccess("OK", null);
    });
  }
}
