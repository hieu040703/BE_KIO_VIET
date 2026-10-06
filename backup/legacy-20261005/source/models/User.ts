import { Entity, Column, OneToMany, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { SettingDefault, UserRoleEnum } from "@/shared/constants/constance";
import { PermissionGroup } from "./PermissionGroup";
import { IAddress, ISetting } from "@/modules/common/common.validator";
import { NotificationDetail } from "./NotificationDetail";
import { Employee } from "./Employee";
import { Customer } from "./Customer";

// ============================== USER ENTITIES ==============================
@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "uuid", nullable: true })
  permissionGroupId: string | null;

  // nhân viên ID - nếu đây là tài khoản dành cho nhân viên
  @Column({ type: "uuid", nullable: true })
  employeeId!: string | null;

  // customerId - nếu đây là tài khoản dành cho khách hàng
  @Column({ type: "uuid", nullable: true })
  customerId!: string | null;

  @Column({ type: "varchar", length: 255 })
  code: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  username!: string | null;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "enum", enum: UserRoleEnum, default: UserRoleEnum.EMPLOYEE })
  role!: UserRoleEnum;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  name: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar?: string | null;

  @Column({ type: "jsonb", default: {} })
  address!: IAddress;

  @Column({ type: "boolean", default: true })
  isActive?: boolean;

  @Column({ type: "jsonb", default: SettingDefault })
  setting: ISetting;

  //? otp xác thực
  @Column({ type: "varchar", length: 10, nullable: true })
  otpCode!: string | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  otpExpiresAt!: Date | null;

  //? mã giới thiệu (mỗi người dùng sẽ có một mã giới thiệu duy nhất, có thể dùng để giới thiệu người khác)
  @Column({ type: "varchar", length: 255, nullable: true })
  referralCode!: string | null;

  //============================= RELATIONS =============================//

  @OneToOne(() => Employee, (employee) => employee.user, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "employeeId" })
  employee: Employee;

  @OneToOne(() => Customer, (customer) => customer.user)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @ManyToOne(() => PermissionGroup, (permissionGroup) => permissionGroup.users)
  @JoinColumn({ name: "permissionGroupId" })
  permissionGroup?: PermissionGroup;

  @OneToMany(() => NotificationDetail, (notificationDetail) => notificationDetail.user)
  notificationDetails: NotificationDetail[];
}
