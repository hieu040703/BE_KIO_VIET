import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";

@Entity("tenants")
export class RetailTenant extends RetailBaseEntity {
  @Column({ type: "varchar", length: 50, unique: true }) code!: string;
  @Column({ type: "varchar", length: 255 }) name!: string;
  @Column({ type: "varchar", length: 30, default: "ACTIVE" }) status!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
