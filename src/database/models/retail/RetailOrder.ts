import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Unique, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailBranch } from "./RetailBranch";
import { RetailCustomer } from "./RetailCustomer";
import { RetailEmployee } from "./RetailEmployee";
import { RetailTenant } from "./RetailTenant";
import { RetailWarehouse } from "./RetailWarehouse";

@Entity("orders")
@Unique(["tenantId", "orderCode"])
export class RetailOrder extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "orders_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "branch_id", type: "uuid" }) branchId!: string;
  @ManyToOne(() => RetailBranch)
  @JoinColumn({ name: "branch_id", foreignKeyConstraintName: "orders_branch_id_fkey" }) branch!: RetailBranch;
  @Column({ name: "warehouse_id", type: "uuid", nullable: true }) warehouseId!: string | null;
  @ManyToOne(() => RetailWarehouse, { nullable: true })
  @JoinColumn({ name: "warehouse_id", foreignKeyConstraintName: "orders_warehouse_id_fkey" }) warehouse!: RetailWarehouse | null;
  @Column({ name: "customer_id", type: "uuid", nullable: true }) customerId!: string | null;
  @ManyToOne(() => RetailCustomer, { nullable: true })
  @JoinColumn({ name: "customer_id", foreignKeyConstraintName: "orders_customer_id_fkey" }) customer!: RetailCustomer | null;
  @Column({ name: "employee_id", type: "uuid", nullable: true }) employeeId!: string | null;
  @ManyToOne(() => RetailEmployee, { nullable: true })
  @JoinColumn({ name: "employee_id", foreignKeyConstraintName: "orders_employee_id_fkey" }) employee!: RetailEmployee | null;
  @Column({ name: "order_code", type: "varchar", length: 60 }) orderCode!: string;
  @Column({ type: "varchar", length: 30, default: "POS" }) channel!: string;
  @Column({ type: "varchar", length: 30, default: "DRAFT" }) status!: string;
  @Column({ name: "payment_status", type: "varchar", length: 30, default: "UNPAID" }) paymentStatus!: string;
  @Column({ name: "fulfillment_status", type: "varchar", length: 30, default: "UNFULFILLED" }) fulfillmentStatus!: string;
  @Column({ name: "subtotal", type: "numeric", precision: 18, scale: 2, default: 0 }) subtotal!: number;
  @Column({ name: "discount_total", type: "numeric", precision: 18, scale: 2, default: 0 }) discountTotal!: number;
  @Column({ name: "tax_total", type: "numeric", precision: 18, scale: 2, default: 0 }) taxTotal!: number;
  @Column({ name: "shipping_total", type: "numeric", precision: 18, scale: 2, default: 0 }) shippingTotal!: number;
  @Column({ name: "grand_total", type: "numeric", precision: 18, scale: 2, default: 0 }) grandTotal!: number;
  @Column({ name: "paid_total", type: "numeric", precision: 18, scale: 2, default: 0 }) paidTotal!: number;
  @Column({ name: "debt_total", type: "numeric", precision: 18, scale: 2, default: 0 }) debtTotal!: number;
  @Column({ name: "ordered_at", type: "timestamptz", nullable: true }) orderedAt!: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
