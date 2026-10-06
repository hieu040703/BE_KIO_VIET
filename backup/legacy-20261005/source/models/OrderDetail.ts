import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { Order } from "./Order";

@Entity("order_details")
export class OrderDetail extends BaseEntity {
  //? hợp đồng ID
  @Column({ type: "uuid" })
  orderId!: string;

  //? tên hàng hóa/dịch vụ
  @Column({ type: "varchar", length: 255 })
  name!: string;

  //? đơn vị tính
  @Column({ type: "varchar", length: 100 })
  unit!: string;

  //? số lượng
  @Column({ type: "float" })
  quantity!: number;

  //? số giờ làm việc (nếu có)
  @Column({ type: "float", nullable: true })
  totalHours?: number | null;

  //? giá tiền
  @Column(BaseNumericColumnOptions)
  price!: number;

  //? số tiền
  @Column(BaseNumericColumnOptions)
  amount!: number;

  //============================= RELATIONS ========================//

  @ManyToOne(() => Order, (order) => order.details, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;
}
