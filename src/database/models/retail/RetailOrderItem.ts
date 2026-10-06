import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailEmployee } from "./RetailEmployee";
import { RetailOrder } from "./RetailOrder";
import { RetailProductVariant } from "./RetailProductVariant";
import { RetailTenant } from "./RetailTenant";

@Entity("order_items")
@Check('"quantity" > 0')
@Check('"unit_price" >= 0')
export class RetailOrderItem extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "order_items_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "order_id", type: "uuid" }) orderId!: string;
  @ManyToOne(() => RetailOrder, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id", foreignKeyConstraintName: "order_items_order_id_fkey" }) order!: RetailOrder;
  @Column({ name: "variant_id", type: "uuid" }) variantId!: string;
  @ManyToOne(() => RetailProductVariant)
  @JoinColumn({ name: "variant_id", foreignKeyConstraintName: "order_items_variant_id_fkey" }) variant!: RetailProductVariant;
  @Column({ name: "employee_id", type: "uuid", nullable: true }) employeeId!: string | null;
  @ManyToOne(() => RetailEmployee, { nullable: true })
  @JoinColumn({ name: "employee_id", foreignKeyConstraintName: "order_items_employee_id_fkey" }) employee!: RetailEmployee | null;
  @Column({ type: "numeric", precision: 18, scale: 4 }) quantity!: number;
  @Column({ name: "unit_price", type: "numeric", precision: 18, scale: 2 }) unitPrice!: number;
  @Column({ name: "discount_total", type: "numeric", precision: 18, scale: 2, default: 0 }) discountTotal!: number;
  @Column({ name: "tax_total", type: "numeric", precision: 18, scale: 2, default: 0 }) taxTotal!: number;
  @Column({ name: "line_total", type: "numeric", precision: 18, scale: 2 }) lineTotal!: number;
  @Column({ name: "cost_total", type: "numeric", precision: 18, scale: 2, default: 0 }) costTotal!: number;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}
