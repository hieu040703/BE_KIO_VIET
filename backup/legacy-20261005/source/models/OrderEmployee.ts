import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Employee } from "./Employee";
import { Order } from "./Order";
import { BaseEntity, BaseNullableNumericColumnOptions } from "@/shared/base/BaseEntity";
import { TimeKeeping } from "./TimeKeeping";
import { OrderEmployeeStatusEnum } from "@/shared/constants/constance";

@Entity("order_employees")
export class OrderEmployee extends BaseEntity {
  @Column({ type: "uuid" })
  orderId!: string;

  @Column({ type: "uuid" })
  employeeId!: string;

  //? thời gian bắt đầu công việc
  @Column({ type: "timestamp with time zone", nullable: true })
  timeAt!: Date | null;

  //? thời điểm nhân viên check-in thực tế
  @Column({ type: "timestamp with time zone", nullable: true })
  checkInAt!: Date | null;

  //? tọa độ tại thời điểm check-in
  @Column({ type: "double precision", nullable: true })
  checkInLatitude!: number | null;

  @Column({ type: "double precision", nullable: true })
  checkInLongitude!: number | null;

  //? thời điểm nhân viên check-out thực tế
  @Column({ type: "timestamp with time zone", nullable: true })
  checkOutAt!: Date | null;

  //? giờ bắt đầu
  @Column({ type: "time without time zone", nullable: true })
  startTime!: string | null;

  //? so gio giai lao (don vi gio, tru vao totalHours)
  @Column({ type: "float", nullable: true, default: 0 })
  breakTime!: number | null;

  //? giờ kết thúc
  @Column({ type: "time without time zone", nullable: true })
  endTime!: string | null;

  //? số giờ làm việc
  @Column({ type: "float", nullable: true })
  totalHours!: number | null;

  //? mức lương
  @Column(BaseNullableNumericColumnOptions)
  salary!: number | null;

  //? đã xác nhận (admin sẽ xác nhận mức lương, khi đã xác nhận thì chỉ có admin mới được chỉnh sửa)
  @Column({ type: "boolean", default: false })
  isConfirmed!: boolean;

  //? trạng thái phản hồi nhận thực hiện hợp đồng
  @Column({
    type: "enum",
    enum: OrderEmployeeStatusEnum,
    default: OrderEmployeeStatusEnum.PENDING,
  })
  status!: OrderEmployeeStatusEnum;

  //? Phân biệt nhân viên đầu cánh của đội thi công
  @Column({ type: "boolean", default: false })
  isLeader!: boolean;

  //? Số tiền tính % cho nhân viên phụ trách chính (nếu có)
  @Column(BaseNullableNumericColumnOptions)
  leaderPercentAmount!: number | null;

  //? Đã gửi thông báo báo động chưa checkin (dùng để tránh gửi trùng lặp)
  @Column({ type: "boolean", default: false })
  hasNotifiedCheckIn!: boolean;

  // Relations
  @ManyToOne(() => Order, (order) => order.orderEmployees, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => Employee, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @OneToOne(() => TimeKeeping, (timeKeeping) => timeKeeping.orderEmployee, {
    eager: true,
    cascade: ["insert", "update", "remove", "soft-remove"],
  })
  timeKeeping?: TimeKeeping;
}
