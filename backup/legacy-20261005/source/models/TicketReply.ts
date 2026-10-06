import { Entity, ManyToOne, Column, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { TicketReplyTypeEnum } from "@/shared/constants/constance";
import { Ticket } from "./Ticket";
import { User } from "./User";

@Entity("ticket_replies")
export class TicketReply extends BaseEntity {
  @Column({ type: "uuid" })
  userId!: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  ticketId!: string;
  @ManyToOne(() => Ticket)
  @JoinColumn({ name: "ticketId" })
  ticket!: Ticket;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "enum", enum: TicketReplyTypeEnum })
  type!: TicketReplyTypeEnum;

  @Column({ type: "jsonb", nullable: true })
  attachments?: any[] | null;

  @Column({ type: "boolean", default: false })
  isInternal!: boolean;
}
