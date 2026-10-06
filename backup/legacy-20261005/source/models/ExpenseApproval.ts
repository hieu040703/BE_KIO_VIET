import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { User } from "./User";

@Entity("expense_approvals")
export class ExpenseApproval extends BaseEntity {
  // thời gian gửi phê duyệt
  @Column({ type: "timestamp with time zone" })
  timeAt!: Date;

  // người gửi phê duyệt
  @Column({ type: "uuid" })
  requestedBy!: string;

  // người phê duyệt
  @Column({ type: "uuid", nullable: true })
  approvedBy!: string | null;

  // thời gian phê duyệt
  @Column({ type: "timestamp with time zone", nullable: true })
  approvedAt?: Date | null;

  // trạng thái phê duyệt
  @Column({ type: "boolean", default: false })
  isConfirm!: boolean;

  // tổng giá trị phê duyệt
  @Column(BaseNumericColumnOptions)
  amount!: number;

  //===== Quan hệ =====//

  @ManyToOne(() => User)
  @JoinColumn({ name: "requestedBy" })
  requestedUser!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "approvedBy" })
  approvedUser!: User | null;
}
