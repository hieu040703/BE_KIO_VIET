import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Order } from "./Order";
import { Employee } from "./Employee";

@Index("IDX_order_manager_locations_active_order_capturedAt", ["orderId", "capturedAt"], {
  where: '"deletedAt" IS NULL',
})
@Index("IDX_order_manager_locations_active_employee_capturedAt", ["employeeId", "capturedAt"], {
  where: '"deletedAt" IS NULL',
})
@Entity("order_manager_locations")
export class OrderManagerLocation extends BaseEntity {
  @Column({ type: "uuid" })
  orderId!: string;

  @Column({ type: "uuid" })
  employeeId!: string;

  @Column({ type: "double precision" })
  latitude!: number;

  @Column({ type: "double precision" })
  longitude!: number;

  //  Độ chính xác GPS, thường tính bằng mét; càng nhỏ càng chính xác
  @Column({ type: "double precision", nullable: true })
  accuracy!: number | null;

  // Tốc độ tại thời điểm gửi vị trí, đơn vị m/s
  @Column({ type: "double precision", nullable: true })
  speedMetersPerSecond!: number | null;

  // Hướng di chuyển, thường 0–360 độ
  @Column({ type: "double precision", nullable: true })
  heading!: number | null;

  //  Khoảng cách so với lần cập nhật vị trí trước đó, tính bằng mét
  @Column({ type: "double precision", nullable: true })
  distanceFromPreviousMeters!: number | null;

  // Thời điểm thực tế thiết bị ghi nhận vị trí
  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  capturedAt!: Date;

  // Nguồn gửi vị trí, mặc định là "manager-mobile"
  @Column({ type: "varchar", length: 50, default: "manager-mobile" })
  source!: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;
}
