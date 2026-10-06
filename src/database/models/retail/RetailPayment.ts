import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailCustomer } from "./RetailCustomer";
import { RetailOrder } from "./RetailOrder";
import { RetailTenant } from "./RetailTenant";
import { RetailPaymentMethods } from "./RetailGenericEntities";

@Entity("payments")
@Unique(["tenantId", "idempotencyKey"])
@Check('"amount" > 0')
export class RetailPayment extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "payments_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "order_id", type: "uuid", nullable: true }) orderId!: string | null;
  @ManyToOne(() => RetailOrder, { nullable: true })
  @JoinColumn({ name: "order_id", foreignKeyConstraintName: "payments_order_id_fkey" }) order!: RetailOrder | null;
  @Column({ name: "customer_id", type: "uuid", nullable: true }) customerId!: string | null;
  @ManyToOne(() => RetailCustomer, { nullable: true })
  @JoinColumn({ name: "customer_id", foreignKeyConstraintName: "payments_customer_id_fkey" }) customer!: RetailCustomer | null;
  @Column({ name: "payment_method_id", type: "uuid", nullable: true }) paymentMethodId!: string | null;
  @ManyToOne(() => RetailPaymentMethods, { nullable: true })
  @JoinColumn({ name: "payment_method_id", foreignKeyConstraintName: "payments_payment_method_id_fkey" }) paymentMethod!: RetailPaymentMethods | null;
  @Column({ type: "numeric", precision: 18, scale: 2 }) amount!: number;
  @Column({ type: "varchar", length: 30, default: "PENDING" }) status!: string;
  @Column({ name: "external_reference", type: "varchar", length: 255, nullable: true }) externalReference!: string | null;
  @Column({ name: "idempotency_key", type: "varchar", length: 255, nullable: true }) idempotencyKey!: string | null;
  @Column({ name: "paid_at", type: "timestamptz", nullable: true }) paidAt!: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}
