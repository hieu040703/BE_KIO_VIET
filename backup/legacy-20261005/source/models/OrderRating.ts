import { Entity, ManyToOne, Column, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Order } from "./Order";
import { Employee } from "./Employee";

//? lưu trữ phần sao đánh giá của khách hàng cho từng cộng tác viên trong đơn hàng
@Entity("service_order_ratings")
export class ServiceOrderRating extends BaseEntity {
  //? đơn hàng
  @Column({ type: "uuid" })
  orderId!: string;
  @ManyToOne(() => Order)
  @JoinColumn({ name: "orderId" })
  order!: Order;

  //? cộng tác viên được đánh giá
  @Column({ type: "uuid" })
  employeeId!: string;
  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  //? số sao đánh giá (1-5)
  @Column({ type: "int" })
  rating!: number;

  //? đánh giá chi tiết (nếu có)
  @Column({ type: "text", nullable: true })
  review?: string;

}
