import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { EmployeeTicketStatusEnum, EmployeeTicketTypeEnum } from "@/shared/constants/constance";
import { Employee } from "./Employee";
import { User } from "./User";
import { EmployeeTicketReply } from "./EmployeeTicketReply";
import { EmployeeTicketParticipant } from "./EmployeeTicketParticipant";

@Entity("employee_tickets")
export class EmployeeTicket extends BaseEntity {
  @Column({ type: "uuid" })
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @Column({ type: "uuid" })
  createdByUserId!: string;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "createdByUserId" })
  createdByUser!: User;

  @Column({ type: "enum", enum: EmployeeTicketTypeEnum })
  type!: EmployeeTicketTypeEnum;

  @Column({ type: "int", default: 3 })
  priority!: number;

  @Column({ type: "varchar", length: 255 })
  issue!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "jsonb", nullable: true })
  attachments?: unknown[] | null;

  @Column({ type: "enum", enum: EmployeeTicketStatusEnum, default: EmployeeTicketStatusEnum.OPEN })
  status!: EmployeeTicketStatusEnum;

  @OneToMany(() => EmployeeTicketReply, (reply) => reply.employeeTicket)
  replies?: EmployeeTicketReply[];

  @OneToMany(() => EmployeeTicketParticipant, (participant) => participant.employeeTicket)
  participants?: EmployeeTicketParticipant[];
}
