import { UserRoleEnum } from "@/shared/constants/constance";
import { Permission, PermissionStructure } from "@/database/models/PermissionGroup";

type EmployeeTicketUser = {
  id?: string;
  role?: UserRoleEnum | string;
  isActive?: boolean;
  employeeId?: string | null;
  permissionGroup?: {
    permissions?: PermissionStructure | null;
  } | null;
};

type EmployeeTicketOwner = {
  employeeId: string;
};

const isActiveUser = (user: EmployeeTicketUser): boolean => user.isActive !== false;

const isAdmin = (user: EmployeeTicketUser): boolean => user.role === UserRoleEnum.ADMIN;

const isManager = (user: EmployeeTicketUser): boolean => user.role === UserRoleEnum.MANAGER;

export const hasEmployeeTicketPermission = (
  user: EmployeeTicketUser,
  permission: Permission,
): boolean => {
  if (!isActiveUser(user)) {
    return false;
  }

  if (user.role === UserRoleEnum.ADMIN) {
    return true;
  }

  return user.permissionGroup?.permissions?.employeeTicket?.includes(permission) ?? false;
};

export const canCreateEmployeeTicket = (
  user: Pick<EmployeeTicketUser, "employeeId" | "isActive">,
): boolean => isActiveUser(user) && Boolean(user.employeeId);

export const canReadEmployeeTickets = (user: EmployeeTicketUser): boolean =>
  isActiveUser(user) && (isAdmin(user) || (isManager(user) && hasEmployeeTicketPermission(user, "read")));

export const canUpdateEmployeeTickets = (user: EmployeeTicketUser): boolean =>
  isActiveUser(user) &&
  (isAdmin(user) ||
    (isManager(user) &&
      hasEmployeeTicketPermission(user, "read") &&
      hasEmployeeTicketPermission(user, "update")));

export const canManageEmployeeTicketParticipants = (user: EmployeeTicketUser): boolean =>
  isActiveUser(user) && isAdmin(user);

export const canAccessEmployeeTicket = (
  ticket: EmployeeTicketOwner,
  user: EmployeeTicketUser,
  isParticipant: boolean = false,
): boolean => {
  if (!isActiveUser(user)) {
    return false;
  }

  if (canReadEmployeeTickets(user) || isParticipant) {
    return true;
  }

  return Boolean(user.employeeId && user.employeeId === ticket.employeeId);
};

export const resolveEmployeeTicketNotificationRecipientIds = (
  users: EmployeeTicketUser[],
): string[] => {
  const recipientIds = users
    .filter((user) => Boolean(user.id) && canReadEmployeeTickets(user))
    .map((user) => user.id as string);

  return [...new Set(recipientIds)];
};
