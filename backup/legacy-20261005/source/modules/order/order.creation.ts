import { Request } from "express";
import { UserRoleEnum } from "@/shared/constants/constance";

export interface CreatedByEmployeeFields {
  createdByEmployeeId: string | null;
  createdByEmployeePercent: number;
  isPaidForEmployeeCreateOrder: false;
}

export const resolveCreatedByEmployeeFields = (
  requestedPercent: number | undefined,
  req: Request | undefined,
  defaultPercent: number,
): CreatedByEmployeeFields => {
  const canOverridePercent =
    req?.user?.role === UserRoleEnum.ADMIN || req?.user?.permissionAdvance === true;

  return {
    createdByEmployeeId: req?.user?.employeeId ?? null,
    createdByEmployeePercent:
      canOverridePercent && requestedPercent !== undefined ? requestedPercent : defaultPercent,
    isPaidForEmployeeCreateOrder: false,
  };
};

export const resolveAllocateRevenuePercent = (
  requestedPercent: number | null | undefined,
  defaultPercent: number,
): number => requestedPercent ?? defaultPercent;
