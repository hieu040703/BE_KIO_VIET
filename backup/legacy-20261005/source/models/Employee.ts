import { User } from "./User";
import { File } from "./File";
import { Branch } from "./Branch";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { TimeKeepingConfirm } from "./TimeKeepingConfirm";
import { IAddress } from "@/modules/common/common.validator";
import { EmployeeStatusType, PositionDefaultEnum } from "@/shared/constants/constance";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";

@Entity("employees")
export class Employee extends BaseEntity {
  //? chi nhanh ID (nếu có)
  @Column({ type: "uuid", nullable: true })
  branchId!: string | null;

  //? mã nhân viên
  @Column({ type: "varchar", length: 20 })
  code!: string;

  //? ngày sinh
  @Column({ type: "date", nullable: true })
  dob: Date | null;

  //? giới tính
  @Column({ type: "varchar", length: 10, nullable: true })
  gender: string | null;

  //? tên nhân viên
  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone: string | null;

  //? tên zalo nhân viên
  @Column({ type: "varchar", nullable: true })
  zaloName!: string | null;

  //? người quản lý
  @Column({ type: "uuid", nullable: true })
  managerId!: string | null;

  //? người tuyển vào
  @Column({ type: "uuid", nullable: true })
  recruiterId!: string | null;

  //? người tuyển vào đã nhận được đủ thưởng chưa
  @Column({ type: "boolean", default: false })
  recruiterReceivedFullBonus!: boolean;

  //? ngày vào làm
  @Column({ type: "date", nullable: true })
  startDate: Date | null;

  //? ngày nghỉ làm
  @Column({ type: "date", nullable: true })
  endDate: Date | null;

  @Column({ type: "jsonb", default: {} })
  address!: IAddress;

  //? cccd
  @Column({ type: "varchar", nullable: true })
  identityNumber: string | null;

  //? Trạng thái nhân viên
  @Column({ type: "enum", enum: EmployeeStatusType, default: EmployeeStatusType.ACTIVE })
  status!: EmployeeStatusType;

  //? Kiểu nhân viên
  @Column({ type: "boolean", default: false })
  isOfficial: boolean;

  @Column({ type: "boolean", default: false })
  isDefault: boolean;

  //? chức vụ
  @Column({ type: "enum", enum: PositionDefaultEnum, nullable: true })
  position: PositionDefaultEnum | null;

  //? chuyên môn
  @Column({ type: "text", array: true, default: () => "ARRAY[]::text[]" })
  expertise!: string[];

  //? phòng ban
  @Column({ type: "varchar", length: 100, nullable: true })
  department: string | null;

  //? đang trong công việc
  @Column({ type: "boolean", default: false })
  isWorking: boolean;

  @Column({ type: "jsonb", nullable: true })
  avatar: File[] | [];

  //============================= RELATIONS ========================//

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "managerId" })
  manager!: Employee;

  @ManyToOne(() => Employee, { onDelete: "SET NULL" })
  @JoinColumn({ name: "recruiterId" })
  recruiter!: Employee;

  @OneToOne(() => User, (user) => user.employee)
  user!: User;

  @OneToMany(() => TimeKeepingConfirm, (timeKeepingConfirm) => timeKeepingConfirm.employee)
  timeKeepingConfirms!: TimeKeepingConfirm[];
}
