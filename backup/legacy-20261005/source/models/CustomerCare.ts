import { BaseEntity } from "@/shared/base/BaseEntity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Customer } from "./Customer";
import { Employee } from "./Employee";

export enum CustomerCareMethod {
  CALL = "CALL",
  EMAIL = "EMAIL",
  ZALO = "ZALO",
  SMS = "SMS",
  IN_PERSON = "IN_PERSON",
  OTHER = "OTHER",
}

export enum CustomerCareStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

@Index("IDX_customer_cares_customer_scheduled", ["customerId", "scheduledAt"], {
  where: '"deletedAt" IS NULL',
})
@Entity("customer_cares")
export class CustomerCare extends BaseEntity {
  @Column({ type: "uuid" })
  customerId!: string;

  @Column({ type: "uuid" })
  employeeId!: string;

  @Column({ type: "enum", enum: CustomerCareMethod })
  method!: CustomerCareMethod;

  @Column({
    type: "enum",
    enum: CustomerCareStatus,
    default: CustomerCareStatus.SCHEDULED,
  })
  status!: CustomerCareStatus;

  @Column({ type: "timestamp with time zone" })
  scheduledAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  completedAt!: Date | null;

  @Column({ type: "timestamp with time zone", nullable: true })
  nextFollowUpAt!: Date | null;

  @ManyToOne(() => Customer, { onDelete: "CASCADE" })
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @ManyToOne(() => Employee, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;
}
