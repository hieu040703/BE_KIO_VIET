import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailProductVariant } from "./RetailProductVariant";
import { RetailTenant } from "./RetailTenant";
import { RetailUser } from "./RetailUser";
import { RetailWarehouse } from "./RetailWarehouse";

@Entity("stock_ledgers")
@Check('"quantity" <> 0')
@Index("idx_stock_ledgers_tenant", ["tenantId"])
@Index("idx_stock_ledgers_lookup", ["tenantId", "warehouseId", "variantId", "occurredAt"])
export class RetailStockLedger extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "stock_ledgers_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "warehouse_id", type: "uuid" }) warehouseId!: string;
  @ManyToOne(() => RetailWarehouse)
  @JoinColumn({ name: "warehouse_id", foreignKeyConstraintName: "stock_ledgers_warehouse_id_fkey" }) warehouse!: RetailWarehouse;
  @Column({ name: "variant_id", type: "uuid" }) variantId!: string;
  @ManyToOne(() => RetailProductVariant)
  @JoinColumn({ name: "variant_id", foreignKeyConstraintName: "stock_ledgers_variant_id_fkey" }) variant!: RetailProductVariant;
  @Column({ name: "movement_type", type: "varchar", length: 40 }) movementType!: string;
  @Column({ type: "numeric", precision: 18, scale: 4 }) quantity!: number;
  @Column({ name: "unit_cost", type: "numeric", precision: 18, scale: 2, nullable: true }) unitCost!: number | null;
  @Column({ name: "reference_type", type: "varchar", length: 50, nullable: true }) referenceType!: string | null;
  @Column({ name: "reference_id", type: "uuid", nullable: true }) referenceId!: string | null;
  @Column({ name: "occurred_at", type: "timestamptz" }) occurredAt!: Date;
  @Column({ name: "created_by", type: "uuid", nullable: true }) createdBy!: string | null;
  @ManyToOne(() => RetailUser, { nullable: true })
  @JoinColumn({ name: "created_by", foreignKeyConstraintName: "stock_ledgers_created_by_fkey" }) creator!: RetailUser | null;
  @Column({ type: "jsonb", default: () => "'{}'::jsonb" }) metadata!: Record<string, unknown>;
}
