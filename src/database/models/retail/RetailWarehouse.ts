import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Unique, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailBranch } from "./RetailBranch";
import { RetailTenant } from "./RetailTenant";

@Entity("warehouses")
@Unique(["tenantId", "code"])
export class RetailWarehouse extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "warehouses_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "branch_id", type: "uuid", nullable: true }) branchId!: string | null;
  @ManyToOne(() => RetailBranch, { nullable: true })
  @JoinColumn({ name: "branch_id", foreignKeyConstraintName: "warehouses_branch_id_fkey" }) branch!: RetailBranch | null;
  @Column({ type: "varchar", length: 50 }) code!: string;
  @Column({ type: "varchar", length: 255 }) name!: string;
  @Column({ name: "is_default", type: "boolean", default: false }) isDefault!: boolean;
  @Column({ type: "varchar", length: 30, default: "ACTIVE" }) status!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
