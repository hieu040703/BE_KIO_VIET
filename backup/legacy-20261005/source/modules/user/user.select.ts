import { User } from "@/database/models/User";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { EmployeeSelectBasic, EmployeeSelectLite } from "../employee/employee.select";
import { PermissionGroupSelectBasic } from "../permissionGroup/permissionGroup.select";
import { CustomerSelectBasic } from "../customer/customer.select";

export const UserSelectLite: FindOptionsSelect<User> = {
  id: true,
  name: true,
  code: true,
  email: true,
  phone: true,
  avatar: true,
  employeeId: true,
  customerId: true,
  permissionGroupId: true,
};

export const UserSelectWithEmployee: FindOptionsSelect<User> = {
  ...UserSelectLite,
  employee: EmployeeSelectLite,
};

export const UserSelectBasic: FindOptionsSelect<User> = {
  ...UserSelectLite,
  role: true,
  username: true,
  address: true,
  isActive: true,
  setting: true,
};

export const UserSelectFull: FindOptionsSelect<User> = {
  ...UserSelectBasic,
  permissionGroup: PermissionGroupSelectBasic,
  employee: EmployeeSelectBasic,
  customer: CustomerSelectBasic,
};

export const UserRelations: FindOptionsRelations<User> = {
  permissionGroup: true,
  employee: true,
  customer: true,
};
