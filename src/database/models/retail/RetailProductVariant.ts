import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Unique, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailProduct } from "./RetailProduct";
import { RetailTenant } from "./RetailTenant";

@Entity("product_variants")
@Unique(["tenantId", "sku"])
@Check('"cost_price" >= 0')
@Check('"sale_price" >= 0')
export class RetailProductVariant extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "product_variants_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "product_id", type: "uuid" }) productId!: string;
  @ManyToOne(() => RetailProduct)
  @JoinColumn({ name: "product_id", foreignKeyConstraintName: "product_variants_product_id_fkey" }) product!: RetailProduct;
  @Column({ type: "varchar", length: 100 }) sku!: string;
  @Column({ type: "varchar", length: 255, nullable: true }) name!: string | null;
  @Column({ name: "cost_price", type: "numeric", precision: 18, scale: 2, default: 0 }) costPrice!: number;
  @Column({ name: "sale_price", type: "numeric", precision: 18, scale: 2, default: 0 }) salePrice!: number;
  @Column({ type: "varchar", length: 30, default: "ACTIVE" }) status!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
