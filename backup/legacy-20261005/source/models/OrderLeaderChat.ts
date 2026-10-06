import { Entity, Column, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Order } from "./Order";
import { User } from "./User";
import { File } from "./File";

@Index("IDX_order_leader_chats_active_order_time_id", ["orderId", "timeAt", "id"], {
  where: '"deletedAt" IS NULL',
})
@Index("IDX_order_leader_chats_active_order_user_time", ["orderId", "userId", "timeAt"], {
  where: '"deletedAt" IS NULL',
})
@Entity("order_leader_chats")
export class OrderLeaderChat extends BaseEntity {
  @Column({ type: "uuid" })
  orderId!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid", nullable: true })
  replyMessageId!: string | null;

  @Column({ type: "text", nullable: true })
  content!: string | null;

  @Column({ type: "jsonb", nullable: true })
  attachments!: File[] | null;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  @Column({ type: "uuid", array: true, nullable: true, default: null })
  tags!: string[] | null;

  @ManyToOne(() => OrderLeaderChat, (chat) => chat.replies, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "replyMessageId" })
  replyMessage!: OrderLeaderChat | null;

  @OneToMany(() => OrderLeaderChat, (chat) => chat.replyMessage)
  replies!: OrderLeaderChat[];

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;
}
