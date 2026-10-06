import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Customer } from "./Customer";
import { User } from "./User";
import { Order } from "./Order";

// Điều hướng cuộc gọi khi khách hàng gọi vào số hotline
@Entity("call_navigations")
export class CallNavigation extends BaseEntity {
  // customerId
  @Column({ type: "uuid", nullable: true })
  customerId!: string | null;
  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  // số điện thoại của nhân viên
  @Column({ type: "varchar", nullable: true })
  employeePhone!: string;

  // Số điện thoại của khách hàng
  @Column({ type: "varchar" })
  phone!: string;

  // Số điện thoại stringee
  @Column({ type: "varchar" })
  stringeePhone!: string;

  // userId, ID người dùng trên app sẽ được được điều hướng đến khi khách hàng gọi vào số hotline
  @Column({ type: "uuid" })
  userId!: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  // ID đơn hàng sẽ được được điều hướng đến khi khách hàng gọi vào số hotline, nếu có
  @Column({ type: "uuid" })
  orderId!: string;
  @ManyToOne(() => Order)
  @JoinColumn({ name: "orderId" })
  order!: Order;

  //? mức độ ưu tiên, nếu có nhiều bản ghi trùng phone thì sẽ ưu tiên bản ghi có priority cao hơn
  @Column({ type: "int", default: 1 })
  priority!: number;

  //? callId => lấy từ Stringee để liên kết với cuộc gọi thực tế trên Stringee
  @Column({ type: "varchar", nullable: true })
  callId!: string | null;

  //? thời gian hết hạn của điều hướng, nếu có và nhỏ hơn thời gian hiện tại thì phiên cuộc gọi đã hết hạn
  @Column({ type: "timestamp with time zone", nullable: true })
  expiresAt!: Date | null;
}
