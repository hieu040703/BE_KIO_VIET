import { BaseEntity } from "@/shared/base/BaseEntity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";

export const PERMISSIONS = [
  "create",
  "read",
  "readAll",
  "update",
  "delete",
  "resetPassword",
  "confirm",
  "export",
  "advance",
] as const;

export const MODULES = [
  // TODO: Báo cáo
  "dashboard",

  "user",
  "branch",
  "customer",
  "customerService",
  "employee",
  "order",
  "serviceOrder",
  "contract",
  "finance",
  "advanceSalary",
  "advanceEmployee",
  "timekeeping",
  "callHistory",
  "allocateRevenue",
  "fund",
  "margin",
  "debt",
  "invoice",
  "financeConfirm",
  "financeIncomeConfirm",
  "financeExpenseConfirm",
  "permission",
  "vouchersTemplate",
  "vouchers",
  "service",
  "serviceSetting",
  "appSetting",
  "employeeTicket",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type PermissionModule = (typeof MODULES)[number];

// Interface để định nghĩa cấu trúc permissions
export type PermissionStructure = {
  [key in PermissionModule]?: Permission[];
};

@Entity("permission_groups")
export class PermissionGroup extends BaseEntity {
  @Column({ name: "name", type: "text" })
  name!: string;

  @Column({ name: "permissions", type: "jsonb", default: {} })
  permissions!: PermissionStructure;

  @OneToMany(() => User, (user) => user.permissionGroup)
  users?: User[];
}
