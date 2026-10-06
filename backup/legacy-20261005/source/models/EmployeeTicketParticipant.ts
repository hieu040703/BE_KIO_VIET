import { Entity, Column, JoinColumn, ManyToOne, Index } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { EmployeeTicket } from "./EmployeeTicket";
import { User } from "./User";

@Index("IDX_employee_ticket_participants_active", ["employeeTicketId", "userId"], {
  where: '"deletedAt" IS NULL',
  unique: true,
})
@Index("IDX_employee_ticket_participants_userId_active", ["userId"], {
  where: '"deletedAt" IS NULL',
})
@Index("IDX_employee_ticket_participants_ticketId_active", ["employeeTicketId"], {
  where: '"deletedAt" IS NULL',
})
@Entity("employee_ticket_participants")
export class EmployeeTicketParticipant extends BaseEntity {
  @Column({ type: "uuid" })
  employeeTicketId!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  addedByUserId!: string;

  @Column({ type: "uuid", nullable: true })
  removedByUserId!: string | null;

  @ManyToOne(() => EmployeeTicket, (employeeTicket) => employeeTicket.participants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "employeeTicketId" })
  employeeTicket!: EmployeeTicket;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "addedByUserId" })
  addedByUser!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "removedByUserId" })
  removedByUser!: User | null;
}
