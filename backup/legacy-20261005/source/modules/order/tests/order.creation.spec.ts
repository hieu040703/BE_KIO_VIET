import { Request } from "express";
import { UserRoleEnum } from "@/shared/constants/constance";
import { resolveAllocateRevenuePercent, resolveCreatedByEmployeeFields } from "../order.creation";

const requestWithUser = (user: Partial<NonNullable<Request["user"]>>): Request =>
  ({ user } as Request);

describe("resolveCreatedByEmployeeFields", () => {
  it("uses the JWT employee and permits an ADMIN to override the default percent", () => {
    const result = resolveCreatedByEmployeeFields(
      8,
      requestWithUser({
        employeeId: "employee-from-jwt",
        role: UserRoleEnum.ADMIN,
      }),
      3,
    );

    expect(result).toEqual({
      createdByEmployeeId: "employee-from-jwt",
      createdByEmployeePercent: 8,
      isPaidForEmployeeCreateOrder: false,
    });
  });

  it("keeps the app setting percent for users without the override permission", () => {
    const result = resolveCreatedByEmployeeFields(
      99,
      requestWithUser({
        employeeId: "employee-from-jwt",
        role: UserRoleEnum.EMPLOYEE,
        permissionAdvance: false,
      }),
      3,
    );

    expect(result.createdByEmployeeId).toBe("employee-from-jwt");
    expect(result.createdByEmployeePercent).toBe(3);
  });

  it("uses the permission group's advance permission for non-admin overrides", () => {
    const result = resolveCreatedByEmployeeFields(
      8,
      requestWithUser({
        employeeId: "employee-from-jwt",
        role: UserRoleEnum.MANAGER,
        permissionAdvance: true,
      }),
      3,
    );

    expect(result.createdByEmployeePercent).toBe(8);
  });
});

describe("resolveAllocateRevenuePercent", () => {
  it("uses the order value when the creator overrides the app setting", () => {
    expect(resolveAllocateRevenuePercent(18, 12)).toBe(18);
  });

  it("uses branchManagerRevenueShare when the order value is omitted", () => {
    expect(resolveAllocateRevenuePercent(undefined, 12)).toBe(12);
  });

  it("preserves an explicit zero percent", () => {
    expect(resolveAllocateRevenuePercent(0, 12)).toBe(0);
  });
});
