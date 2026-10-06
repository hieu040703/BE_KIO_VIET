import { BaseEntity } from "@/shared/base/BaseEntity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Customer } from "./Customer";
import { User } from "./User";
import { VouchersTemplate } from "./VouchersTemplate";

@Entity("vouchers")
export class Vouchers extends BaseEntity {
  @Column({ type: "uuid" })
  userId!: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  customerId!: string;
  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @Column({ type: "uuid" })
  vouchersTemplateId!: string;
  @ManyToOne(() => VouchersTemplate, (template) => template.vouchers)
  @JoinColumn({ name: "vouchersTemplateId" })
  vouchersTemplate!: VouchersTemplate;

  @Index("IDX_vouchers_code")
  @Column({ type: "varchar", length: 80, unique: true })
  code!: string;

  @Column({ type: "timestamp without time zone" })
  redeemedAt!: Date;

  @Column({ type: "timestamp without time zone" })
  expiredAt!: Date;

  @Column({ type: "boolean", default: false })
  isUsed!: boolean;

  @Column({ type: "timestamp without time zone", nullable: true })
  usedAt!: Date | null;
}
