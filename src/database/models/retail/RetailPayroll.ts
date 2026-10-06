import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailEmployee } from "./RetailEmployee";
import { RetailTenant } from "./RetailTenant";
import { RetailPayrollPeriods } from "./RetailGenericEntities";

@Entity("payrolls")
export class RetailPayroll extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "payrolls_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "payroll_period_id", type: "uuid", nullable: true }) payrollPeriodId!: string | null;
  @ManyToOne(() => RetailPayrollPeriods, { nullable: true })
  @JoinColumn({ name: "payroll_period_id", foreignKeyConstraintName: "payrolls_payroll_period_id_fkey" }) payrollPeriod!: RetailPayrollPeriods | null;
  @Column({ name: "employee_id", type: "uuid" }) employeeId!: string;
  @ManyToOne(() => RetailEmployee)
  @JoinColumn({ name: "employee_id", foreignKeyConstraintName: "payrolls_employee_id_fkey" }) employee!: RetailEmployee;
  @Column({ name: "base_salary", type: "numeric", precision: 18, scale: 2, default: 0 }) baseSalary!: number;
  @Column({ name: "allowance_total", type: "numeric", precision: 18, scale: 2, default: 0 }) allowanceTotal!: number;
  @Column({ name: "overtime_total", type: "numeric", precision: 18, scale: 2, default: 0 }) overtimeTotal!: number;
  @Column({ name: "commission_total", type: "numeric", precision: 18, scale: 2, default: 0 }) commissionTotal!: number;
  @Column({ name: "bonus_total", type: "numeric", precision: 18, scale: 2, default: 0 }) bonusTotal!: number;
  @Column({ name: "deduction_total", type: "numeric", precision: 18, scale: 2, default: 0 }) deductionTotal!: number;
  @Column({ name: "gross_salary", type: "numeric", precision: 18, scale: 2, default: 0 }) grossSalary!: number;
  @Column({ name: "net_salary", type: "numeric", precision: 18, scale: 2, default: 0 }) netSalary!: number;
  @Column({ type: "varchar", length: 30, default: "DRAFT" }) status!: string;
  @Column({ name: "paid_at", type: "timestamptz", nullable: true }) paidAt!: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
