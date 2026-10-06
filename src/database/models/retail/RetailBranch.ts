import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Unique, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailTenant } from "./RetailTenant";
import { RetailStores } from "./RetailGenericEntities";

@Entity("branches")
@Unique(["tenantId", "code"])
export class RetailBranch extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "branches_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ name: "store_id", type: "uuid", nullable: true }) storeId!: string | null;
  @ManyToOne(() => RetailStores, { nullable: true })
  @JoinColumn({ name: "store_id", foreignKeyConstraintName: "branches_store_id_fkey" }) store!: RetailStores | null;
  @Column({ type: "varchar", length: 50 }) code!: string;
  @Column({ type: "varchar", length: 255 }) name!: string;
  @Column({ type: "text", nullable: true }) address!: string | null;
  @Column({ type: "varchar", length: 30, nullable: true }) phone!: string | null;
  @Column({ type: "varchar", length: 60, default: "Asia/Ho_Chi_Minh" }) timezone!: string;
  @Column({ type: "varchar", length: 30, default: "ACTIVE" }) status!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
