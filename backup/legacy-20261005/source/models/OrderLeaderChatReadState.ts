import { Entity, Column, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Order } from "./Order";
import { User } from "./User";
import { OrderLeaderChat } from "./OrderLeaderChat";

@Index("UQ_order_leader_chat_read_states_order_user", ["orderId", "userId"], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Entity("order_leader_chat_read_states")
export class OrderLeaderChatReadState extends BaseEntity {
  @Column({ type: "uuid" })
  orderId!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid", nullable: true })
  lastReadMessageId!: string | null;

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => OrderLeaderChat, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "lastReadMessageId" })
  lastReadMessage!: OrderLeaderChat | null;
}
