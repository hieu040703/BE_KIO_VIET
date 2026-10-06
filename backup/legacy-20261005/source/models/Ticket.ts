import { Entity, ManyToOne, Column, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { TicketStatusEnum, TicketTypeEnum } from "@/shared/constants/constance";
import { Customer } from "./Customer";
import { ServiceOrder } from "./ServiceOrder";
import { TicketReply } from "./TicketReply";

@Entity("tickets")
export class Ticket extends BaseEntity {
  @Column({ type: "uuid" })
  customerId!: string;
  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @Column({ type: "uuid", nullable: true })
  serviceOrderId?: string | null;
  @ManyToOne(() => ServiceOrder, (ServiceOrder) => ServiceOrder.tickets, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "serviceOrderId" })
  serviceOrder?: ServiceOrder | null;

  @Column({ type: "enum", enum: TicketTypeEnum })
  type!: TicketTypeEnum;

  @Column({ type: "int", default: 0 })
  priority!: number;

  @Column({ type: "varchar", length: 255 })
  issue!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 20 })
  contactPhone!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  preferredTime?: string | null;

  @Column({ type: "enum", enum: TicketStatusEnum })
  status!: TicketStatusEnum;

  @OneToMany(() => TicketReply, (reply) => reply.ticket)
  replies?: TicketReply[];
}
