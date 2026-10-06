import { Entity, Column, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Order } from "./Order";
import { User } from "./User";
import { OrderComment } from "./OrderComment";

@Index("UQ_order_comment_read_states_order_user", ["orderId", "userId"], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Entity("order_comment_read_states")
export class OrderCommentReadState extends BaseEntity {
  @Column({ type: "uuid" })
  orderId!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid", nullable: true })
  lastReadCommentId!: string | null;

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => OrderComment, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "lastReadCommentId" })
  lastReadComment!: OrderComment | null;
}
