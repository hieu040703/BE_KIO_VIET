import { Check, Column, Entity, JoinColumn, ManyToOne, Unique, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailProductVariant } from "./RetailProductVariant";
import { RetailTenant } from "./RetailTenant";
import { RetailWarehouse } from "./RetailWarehouse";

@Entity("inventories")
@Unique(["warehouseId", "variantId"])
@Check('"reserved" >= 0')
export class RetailInventory extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "inventories_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "warehouse_id", type: "uuid" }) warehouseId!: string;
  @ManyToOne(() => RetailWarehouse)
  @JoinColumn({ name: "warehouse_id", foreignKeyConstraintName: "inventories_warehouse_id_fkey" }) warehouse!: RetailWarehouse;
  @Column({ name: "variant_id", type: "uuid" }) variantId!: string;
  @ManyToOne(() => RetailProductVariant)
  @JoinColumn({ name: "variant_id", foreignKeyConstraintName: "inventories_variant_id_fkey" }) variant!: RetailProductVariant;
  @Column({ name: "on_hand", type: "numeric", precision: 18, scale: 4, default: 0 }) onHand!: number;
  @Column({ name: "reserved", type: "numeric", precision: 18, scale: 4, default: 0 }) reserved!: number;
  @Column({
    name: "available",
    type: "numeric",
    precision: 18,
    scale: 4,
    asExpression: '"on_hand" - "reserved"',
    generatedType: "STORED",
    insert: false,
    update: false,
  })
  available!: number;
  @Column({ type: "bigint", default: 0 }) version!: number;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
