import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity, BaseNullableNumericColumnOptions } from "@/shared/base/BaseEntity";
import { Order } from "./Order";
import { Employee } from "./Employee";
import { AllocateRevenue } from "./AllocateRevenue";
import { PositionDefaultEnum } from "@/shared/constants/constance";

//# lưu trữ thông tin các nhân viên quản lý của đơn hàng và số phần trăm doanh thu được phân bổ cho mỗi leader(dùng để tính lương được chia từ doanh thu của đơn hàng)
@Entity("order_leaders")
export class OrderLeader extends BaseEntity {
  // phân biệt phần chia sẻ doanh thu cho quản lý chi nhánh hay người tạo đơn (kế toán)
  @Column({ type: "enum", enum: PositionDefaultEnum, default: PositionDefaultEnum.BRANCH_MANAGER })
  position: PositionDefaultEnum;

  //? order ID
  @Column({ type: "uuid" })
  orderId!: string;

  //? employee ID
  @Column({ type: "uuid" })
  employeeId!: string;

  //? giá trị phân bổ doanh thu cho leader
  @Column(BaseNullableNumericColumnOptions)
  revenueShare!: number | null;

  //? đã phân bổ doanh thu cho leader chưa
  @Column({ type: "boolean", default: false })
  isRevenueShareAllocated!: boolean;

  //? lần phân bổ doanh thu liên quan
  @Column({ type: "uuid", nullable: true })
  allocateRevenueId!: string | null;

  @ManyToOne(() => Order, (order) => order.orderLeaders, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @ManyToOne(() => AllocateRevenue, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "allocateRevenueId" })
  allocateRevenue!: AllocateRevenue | null;
}
