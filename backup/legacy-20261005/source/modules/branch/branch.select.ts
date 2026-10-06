import { Branch } from "@/database/models/Branch";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { EmployeeSelectLite } from "../employee/employee.select";

export const BranchSelectBasic: FindOptionsSelect<Branch> = {
  id: true,
  name: true,
  code: true,
  address: true,
  employeeId: true,
  hotline: true,
  isInternal: true,
  isDefault: true,
  note: true,
};

export const BranchSelectFull: FindOptionsSelect<Branch> = {
  ...BranchSelectBasic,
  employee: EmployeeSelectLite, // Dùng Lite để tránh circular dependency
};

export const BranchRelations: FindOptionsRelations<Branch> = {
  employee: true,
};
