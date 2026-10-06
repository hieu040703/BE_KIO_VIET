import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { EmployeeTicketReplyTypeEnum } from "@/shared/constants/constance";
import { EmployeeTicket } from "./EmployeeTicket";
import { User } from "./User";

@Entity("employee_ticket_replies")
export class EmployeeTicketReply extends BaseEntity {
  @Column({ type: "uuid" })
  employeeTicketId!: string;

  @ManyToOne(() => EmployeeTicket, (employeeTicket) => employeeTicket.replies, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employeeTicketId" })
  employeeTicket!: EmployeeTicket;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "enum", enum: EmployeeTicketReplyTypeEnum })
  type!: EmployeeTicketReplyTypeEnum;

  @Column({ type: "jsonb", nullable: true })
  attachments?: unknown[] | null;
}
