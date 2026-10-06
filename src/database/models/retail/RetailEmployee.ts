import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, Unique, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailTenant } from "./RetailTenant";
import { RetailUser } from "./RetailUser";

@Entity("employees")
@Unique(["tenantId", "employeeCode"])
export class RetailEmployee extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "employees_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "user_id", type: "uuid", nullable: true }) userId!: string | null;
  @ManyToOne(() => RetailUser, { nullable: true })
  @JoinColumn({ name: "user_id", foreignKeyConstraintName: "employees_user_id_fkey" }) user!: RetailUser | null;
  @Column({ name: "employee_code", type: "varchar", length: 50 }) employeeCode!: string;
  @Column({ name: "full_name", type: "varchar", length: 255 }) fullName!: string;
  @Column({ type: "varchar", length: 30, nullable: true }) phone!: string | null;
  @Column({ type: "varchar", length: 255, nullable: true }) email!: string | null;
  @Column({ name: "hire_date", type: "date", nullable: true }) hireDate!: string | null;
  @Column({ name: "employment_status", type: "varchar", length: 30, default: "ACTIVE" }) employmentStatus!: string;
  @Column({ name: "base_salary", type: "numeric", precision: 18, scale: 2, default: 0 }) baseSalary!: number;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true }) deletedAt!: Date | null;
}
