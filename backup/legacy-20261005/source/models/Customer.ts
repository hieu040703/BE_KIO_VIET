import { Entity, ManyToOne, Column, OneToMany, Unique, OneToOne } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { IAddress } from "@/modules/common/common.validator";
import { AdsEnum, CustomerTypeEnum } from "@/shared/constants/constance";
import { Order } from "./Order";
import { User } from "./User";

// Lưu trữ danh sách khách hàng
@Entity("customers")
export class Customer extends BaseEntity {
  //? chi nhanh ID (nếu có)
  @Column({ type: "uuid", nullable: true })
  branchId!: string | null;

  //? mã khách hàng
  @Column({ type: "varchar" })
  code!: string;

  //? Loại khách hàng
  @Column({ type: "enum", enum: CustomerTypeEnum, default: CustomerTypeEnum.INDIVIDUAL })
  type!: CustomerTypeEnum;

  //? tên khách hàng
  @Column({ type: "varchar" })
  name!: string;

  //? tên zalo khách hàng
  @Column({ type: "varchar", nullable: true })
  zaloName!: string | null;

  //? tên khách hàng tự nhập (tên khi đăng ký khách hàng tự nhập)
  @Column({ type: "varchar", nullable: true })
  customName!: string | null;

  //? số điện thoại khách hàng
  @Column({ type: "varchar" })
  phone!: string;

  //? nguồn khách hàng
  @Column({ type: "enum", enum: AdsEnum, nullable: true })
  source!: AdsEnum | null;

  //? địa chỉ
  @Column({ type: "jsonb", nullable: true })
  address!: IAddress | null;

  //? email nếu có
  @Column({ type: "varchar", nullable: true })
  email!: string | null;

  //? ngày sinh
  @Column({ type: "date", nullable: true })
  dob!: Date | null;

  //? giới tính
  @Column({ type: "varchar", nullable: true })
  gender!: string | null;

  //? mã số thuế
  @Column({ type: "varchar", nullable: true })
  taxCode!: string | null;

  //? mã kinh doanh
  @Column({ type: "varchar", nullable: true })
  businessCode!: string | null;

  //? công nợ ban đầu
  @Column(BaseNumericColumnOptions)
  openingDebt!: number;

  //? ảnh đại diện
  @Column({ type: "varchar", nullable: true })
  avatar!: string | null;

  //? mã giới thiệu
  @Column({ type: "varchar", nullable: true })
  referralCode!: string | null;

  //? nhân viên giới thiệu
  @Column({ type: "uuid", nullable: true })
  referralStaff!: string | null;

  //====== Quan hệ ======//

  @OneToMany(() => Order, (order) => order.customer)
  orders!: Order[];

  @OneToOne(() => User, (user) => user.customer)
  user!: User;
}
