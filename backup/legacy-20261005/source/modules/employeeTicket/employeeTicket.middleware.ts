import { Request, Response, NextFunction, RequestHandler } from "express";
import DatabaseConfig from "@/database/database";
import { Employee } from "@/database/models/Employee";
import { EmployeeTicketParticipant } from "@/database/models/EmployeeTicketParticipant";
import { User } from "@/database/models/User";
import { EmployeeStatusType } from "@/shared/constants/constance";
import { ForbiddenError, UnauthorizedError } from "@/shared/types/errors";
import { IsNull } from "typeorm";
import {
  canCreateEmployeeTicket,
  canManageEmployeeTicketParticipants,
  canReadEmployeeTickets,
  canUpdateEmployeeTickets,
} from "./employeeTicket.permissions";

const loadActiveUser = async (
  req: Request,
): Promise<{ user: User; hasActiveEmployee: boolean }> => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  const user = await DatabaseConfig.getRepository(User).findOne({
    where: { id: userId },
    relations: { permissionGroup: true },
    select: {
      id: true,
      role: true,
      isActive: true,
      employeeId: true,
      permissionGroup: {
        id: true,
        permissions: true,
      },
    },
  });

  if (!user || user.isActive === false) {
    throw new ForbiddenError("Tài khoản không hoạt động");
  }

  const hasActiveEmployee = Boolean(
    user.employeeId &&
    (await DatabaseConfig.getRepository(Employee).findOne({
      where: { id: user.employeeId, status: EmployeeStatusType.ACTIVE },
      select: { id: true },
    })),
  );

  req.user!.role = user.role;
  req.user!.employeeId = user.employeeId;
  req.user!.permissionGroup = user.permissionGroup
    ? { permissions: user.permissionGroup.permissions }
    : null;
  return { user, hasActiveEmployee };
};

const handle =
  (mode: "create" | "access" | "manage" | "participant"): RequestHandler =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, hasActiveEmployee } = await loadActiveUser(req);

      if (
        mode === "create" &&
        (!canCreateEmployeeTicket(user) || !hasActiveEmployee)
      ) {
        throw new ForbiddenError(
          "Tài khoản không liên kết với nhân viên đang hoạt động",
        );
      }

      if (
        mode === "access" &&
        !hasActiveEmployee &&
        !canReadEmployeeTickets(user)
      ) {
        const ticketId =
          typeof req.params.id === "string"
            ? req.params.id
            : typeof req.params.ticketId === "string"
              ? req.params.ticketId
              : undefined;
        const isActiveParticipant = Boolean(
          ticketId &&
          (await DatabaseConfig.getRepository(
            EmployeeTicketParticipant,
          ).findOne({
            where: {
              employeeTicketId: ticketId,
              userId: user.id,
              deletedAt: IsNull(),
            },
            select: { id: true },
          })),
        );

        if (!isActiveParticipant) {
          throw new ForbiddenError("Bạn không có quyền truy cập ticket nội bộ");
        }
      }

      if (mode === "manage" && !canUpdateEmployeeTickets(user)) {
        throw new ForbiddenError("Bạn không có quyền xử lý ticket nội bộ");
      }

      if (
        mode === "participant" &&
        !canManageEmployeeTicketParticipants(user)
      ) {
        throw new ForbiddenError(
          "Chỉ quản trị viên mới được quản lý người tham gia ticket",
        );
      }

      req.user!.viewAll = canReadEmployeeTickets(user);
      next();
    } catch (error) {
      next(error);
    }
  };

export const employeeTicketEmployeeMiddleware = handle("create");
export const employeeTicketAccessMiddleware = handle("access");
export const employeeTicketManagerMiddleware = handle("manage");
export const employeeTicketParticipantAdminMiddleware = handle("participant");
