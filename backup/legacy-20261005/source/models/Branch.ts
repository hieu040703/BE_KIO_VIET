import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { IAddress } from "@/modules/common/common.validator";
import { Employee } from "./Employee";

@Entity("branches")
export class Branch extends BaseEntity {
  //? tên chi nhánh
  @Column({ type: "varchar" })
  name!: string;

  //? mã chi nhánh
  @Column({ type: "varchar", nullable: true })
  code!: string | null;

  //? địa chỉ chi nhánh
  @Column({ type: "jsonb", default: {} })
  address!: IAddress;

  //? nhân viên phụ trách chi nhánh
  @Column({ type: "uuid", nullable: true })
  employeeId!: string | null;

  //? hotline chi nhánh
  @Column({ type: "varchar", length: 20, nullable: true })
  hotline!: string | null;

  //? chi nhánh nội bộ hay là đối tác
  @Column({ type: "boolean", default: false })
  isInternal!: boolean;

  @Column({ type: "boolean", default: false })
  isDefault!: boolean;

  //============================================ Relations ============================================//

  @ManyToOne(() => Employee, { onDelete: "SET NULL" })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee | null;
}
