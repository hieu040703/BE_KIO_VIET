import { UserRoleEnum } from "@/shared/constants/constance";
import {
  canAccessEmployeeTicket,
  canCreateEmployeeTicket,
  canManageEmployeeTicketParticipants,
  canReadEmployeeTickets,
  canUpdateEmployeeTickets,
  resolveEmployeeTicketNotificationRecipientIds,
} from "../employeeTicket.permissions";

describe("employee ticket permissions", () => {
  it("allows an active account linked to an employee to create a ticket", () => {
    expect(
      canCreateEmployeeTicket({
        employeeId: "employee-1",
        isActive: true,
      }),
    ).toBe(true);
  });

  it("rejects inactive accounts and accounts without an employee link", () => {
    expect(canCreateEmployeeTicket({ employeeId: "employee-1", isActive: false })).toBe(false);
    expect(canCreateEmployeeTicket({ employeeId: null, isActive: true })).toBe(false);
  });

  it("allows admins or managers with employeeTicket.read to read the broadcast inbox", () => {
    expect(canReadEmployeeTickets({ role: UserRoleEnum.ADMIN, isActive: true })).toBe(true);
    expect(
      canReadEmployeeTickets({
        role: UserRoleEnum.MANAGER,
        isActive: true,
        permissionGroup: { permissions: { employeeTicket: ["read"] } },
      }),
    ).toBe(true);
  });

  it("does not grant global inbox access to non-manager roles with employeeTicket.read", () => {
    expect(
      canReadEmployeeTickets({
        role: UserRoleEnum.EMPLOYEE,
        isActive: true,
        permissionGroup: { permissions: { employeeTicket: ["read"] } },
      }),
    ).toBe(false);
  });

  it("requires read and update for a manager to manage ticket status", () => {
    expect(
      canUpdateEmployeeTickets({
        role: UserRoleEnum.MANAGER,
        isActive: true,
        permissionGroup: { permissions: { employeeTicket: ["read", "update"] } },
      }),
    ).toBe(true);
    expect(
      canUpdateEmployeeTickets({
        role: UserRoleEnum.MANAGER,
        isActive: true,
        permissionGroup: { permissions: { employeeTicket: ["update"] } },
      }),
    ).toBe(false);
  });

  it("uses the permission group attached to the request context", () => {
    const requestUser: Parameters<typeof canReadEmployeeTickets>[0] = {
      role: UserRoleEnum.MANAGER,
      isActive: true,
      permissionGroup: { permissions: { employeeTicket: ["read", "update"] } },
    };

    expect(canReadEmployeeTickets(requestUser)).toBe(true);
    expect(canUpdateEmployeeTickets(requestUser)).toBe(true);
  });

  it("allows only active admins to manage ticket participants", () => {
    expect(
      canManageEmployeeTicketParticipants({ role: UserRoleEnum.ADMIN, isActive: true }),
    ).toBe(true);
    expect(
      canManageEmployeeTicketParticipants({
        role: UserRoleEnum.MANAGER,
        isActive: true,
        permissionGroup: { permissions: { employeeTicket: ["read", "update"] } },
      }),
    ).toBe(false);
    expect(
      canManageEmployeeTicketParticipants({ role: UserRoleEnum.ADMIN, isActive: false }),
    ).toBe(false);
  });

  it("does not grant broadcast access to inactive or unpermissioned accounts", () => {
    expect(
      canReadEmployeeTickets({
        role: UserRoleEnum.MANAGER,
        isActive: true,
        permissionGroup: { permissions: { employeeTicket: ["create"] } },
      }),
    ).toBe(false);
    expect(canReadEmployeeTickets({ role: UserRoleEnum.ADMIN, isActive: false })).toBe(false);
  });

  it("broadcasts once to active admins and active permitted managers", () => {
    expect(
      resolveEmployeeTicketNotificationRecipientIds([
        { id: "admin-1", role: UserRoleEnum.ADMIN, isActive: true },
        {
          id: "manager-1",
          role: UserRoleEnum.MANAGER,
          isActive: true,
          permissionGroup: { permissions: { employeeTicket: ["read"] } },
        },
        {
          id: "manager-1",
          role: UserRoleEnum.MANAGER,
          isActive: true,
          permissionGroup: { permissions: { employeeTicket: ["read"] } },
        },
        { id: "inactive-admin", role: UserRoleEnum.ADMIN, isActive: false },
        {
          id: "employee-1",
          role: UserRoleEnum.EMPLOYEE,
          isActive: true,
          permissionGroup: { permissions: { employeeTicket: ["read"] } },
        },
      ]),
    ).toEqual(["admin-1", "manager-1"]);
  });

  it("allows only the owner or a broadcast reader to access a ticket", () => {
    expect(
      canAccessEmployeeTicket(
        { employeeId: "employee-1" },
        { role: UserRoleEnum.EMPLOYEE, employeeId: "employee-1", isActive: true },
      ),
    ).toBe(true);
    expect(
      canAccessEmployeeTicket(
        { employeeId: "employee-1" },
        { role: UserRoleEnum.EMPLOYEE, employeeId: "employee-2", isActive: true },
      ),
    ).toBe(false);
    expect(
      canAccessEmployeeTicket(
        { employeeId: "employee-1" },
        {
          role: UserRoleEnum.MANAGER,
          employeeId: "employee-2",
          isActive: true,
          permissionGroup: { permissions: { employeeTicket: ["read"] } },
        },
      ),
    ).toBe(true);
  });

  it("allows an active participant to access a ticket without global inbox permission", () => {
    expect(
      canAccessEmployeeTicket(
        { employeeId: "employee-1" },
        { role: UserRoleEnum.EMPLOYEE, employeeId: "employee-2", isActive: true },
        true,
      ),
    ).toBe(true);
  });

  it("does not trust a stale viewAll flag to grant access", () => {
    const staleUser = {
      role: UserRoleEnum.EMPLOYEE,
      employeeId: "employee-2",
      isActive: true,
      viewAll: true,
    };

    expect(
      canAccessEmployeeTicket(
        { employeeId: "employee-1" },
        staleUser,
      ),
    ).toBe(false);
  });
});
