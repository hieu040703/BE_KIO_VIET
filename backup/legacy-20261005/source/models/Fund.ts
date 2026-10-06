import { Entity, ManyToOne, Column, OneToMany, Unique } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";

// Lưu trữ danh sách quỹ / tài khoản
@Entity("funds")
export class Fund extends BaseEntity {
  @Column({ type: "varchar" })
  name!: string;

  //? tên ngân hàng
  @Column({ type: "varchar" })
  bankName!: string;

  //? bin
  @Column({ type: "varchar", nullable: true })
  bin!: string | null;

  //? số tài khoản
  @Column({ type: "varchar" })
  accountNumber!: string;

  //? chủ tài khoản
  @Column({ type: "varchar" })
  accountHolder!: string;

  //? chi nhánh
  @Column({ type: "varchar", nullable: true })
  branch!: string | null;

  //? mặc định
  @Column({ type: "boolean", default: false })
  isDefault!: boolean;
}
