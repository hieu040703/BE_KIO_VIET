import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, Unique, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailTenant } from "./RetailTenant";
import { RetailBrands, RetailCategories, RetailUnits } from "./RetailGenericEntities";

@Entity("products")
@Unique(["tenantId", "code"])
export class RetailProduct extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "products_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "category_id", type: "uuid", nullable: true }) categoryId!: string | null;
  @ManyToOne(() => RetailCategories, { nullable: true })
  @JoinColumn({ name: "category_id", foreignKeyConstraintName: "products_category_id_fkey" }) category!: RetailCategories | null;
  @Column({ name: "brand_id", type: "uuid", nullable: true }) brandId!: string | null;
  @ManyToOne(() => RetailBrands, { nullable: true })
  @JoinColumn({ name: "brand_id", foreignKeyConstraintName: "products_brand_id_fkey" }) brand!: RetailBrands | null;
  @Column({ name: "unit_id", type: "uuid", nullable: true }) unitId!: string | null;
  @ManyToOne(() => RetailUnits, { nullable: true })
  @JoinColumn({ name: "unit_id", foreignKeyConstraintName: "products_unit_id_fkey" }) unit!: RetailUnits | null;
  @Column({ type: "varchar", length: 80 }) code!: string;
  @Column({ type: "varchar", length: 255 }) name!: string;
  @Column({ name: "product_type", type: "varchar", length: 30, default: "STANDARD" }) productType!: string;
  @Column({ name: "track_inventory", type: "boolean", default: true }) trackInventory!: boolean;
  @Column({ name: "track_batch", type: "boolean", default: false }) trackBatch!: boolean;
  @Column({ name: "track_serial", type: "boolean", default: false }) trackSerial!: boolean;
  @Column({ type: "varchar", length: 30, default: "ACTIVE" }) status!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true }) deletedAt!: Date | null;
}
