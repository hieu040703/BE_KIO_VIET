import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Unique, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailEmployee } from "./RetailEmployee";
import { RetailTenant } from "./RetailTenant";
import { RetailWorkShifts } from "./RetailGenericEntities";

@Entity("attendances")
@Unique(["employeeId", "workDate", "shiftId"])
export class RetailAttendance extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "attendances_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "employee_id", type: "uuid" }) employeeId!: string;
  @ManyToOne(() => RetailEmployee)
  @JoinColumn({ name: "employee_id", foreignKeyConstraintName: "attendances_employee_id_fkey" }) employee!: RetailEmployee;
  @Column({ name: "work_date", type: "date" }) workDate!: string;
  @Column({ name: "shift_id", type: "uuid", nullable: true }) shiftId!: string | null;
  @ManyToOne(() => RetailWorkShifts, { nullable: true })
  @JoinColumn({ name: "shift_id", foreignKeyConstraintName: "attendances_shift_id_fkey" }) shift!: RetailWorkShifts | null;
  @Column({ name: "check_in", type: "timestamptz", nullable: true }) checkIn!: Date | null;
  @Column({ name: "check_out", type: "timestamptz", nullable: true }) checkOut!: Date | null;
  @Column({ name: "worked_minutes", type: "integer", default: 0 }) workedMinutes!: number;
  @Column({ name: "late_minutes", type: "integer", default: 0 }) lateMinutes!: number;
  @Column({ name: "early_leave_minutes", type: "integer", default: 0 }) earlyLeaveMinutes!: number;
  @Column({ name: "overtime_minutes", type: "integer", default: 0 }) overtimeMinutes!: number;
  @Column({ type: "varchar", length: 30, default: "PRESENT" }) status!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
