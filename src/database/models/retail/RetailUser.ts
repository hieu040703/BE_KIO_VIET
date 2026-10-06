import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailTenant } from "./RetailTenant";

@Entity("users")
export class RetailUser extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "users_tenant_id_fkey" }) tenant!: RetailTenant;
  @Column({ type: "varchar", length: 255, nullable: true }) email!: string | null;
  @Column({ type: "varchar", length: 30, nullable: true }) phone!: string | null;
  @Column({ name: "password_hash", type: "text", select: false }) passwordHash!: string;
  @Column({ type: "varchar", length: 30, default: "ACTIVE" }) status!: string;
  @Column({ name: "last_login_at", type: "timestamptz", nullable: true }) lastLoginAt!: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true }) deletedAt!: Date | null;
}
