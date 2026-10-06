import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, Unique, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailTenant } from "./RetailTenant";

@Entity("customers")
@Unique(["tenantId", "code"])
export class RetailCustomer extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customers_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ type: "varchar", length: 50 }) code!: string;
  @Column({ name: "full_name", type: "varchar", length: 255 }) fullName!: string;
  @Column({ type: "varchar", length: 30, nullable: true }) phone!: string | null;
  @Column({ type: "varchar", length: 255, nullable: true }) email!: string | null;
  @Column({ type: "date", nullable: true }) birthday!: string | null;
  @Column({ type: "varchar", length: 20, nullable: true }) gender!: string | null;
  @Column({ name: "total_spent", type: "numeric", precision: 18, scale: 2, default: 0 }) totalSpent!: number;
  @Column({ name: "order_count", type: "integer", default: 0 }) orderCount!: number;
  @Column({ type: "varchar", length: 30, default: "ACTIVE" }) status!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true }) deletedAt!: Date | null;
}
