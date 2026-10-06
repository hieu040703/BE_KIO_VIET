import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Order } from "./Order";
import { Customer } from "./Customer";
import { RewardPointTypeEnum } from "@/shared/constants/constance";

//? lưu trữ điểm thưởng của khách hàng cho từng đơn hàng
@Entity("reward_points")
export class RewardPoint extends BaseEntity {
  //? khách hàng
  @Column({ type: "uuid" })
  customerId!: string;
  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  //? đơn hàng
  @Column({ type: "uuid", nullable: true })
  orderId!: string | null;
  @ManyToOne(() => Order)
  @JoinColumn({ name: "orderId" })
  order!: Order | null;

  //? loại điểm thưởng (tích lũy hoặc sử dụng)
  @Column({ type: "enum", enum: RewardPointTypeEnum })
  type!: RewardPointTypeEnum;

  //? số điểm thưởng
  @Column({ type: "int" })
  points!: number;
}
