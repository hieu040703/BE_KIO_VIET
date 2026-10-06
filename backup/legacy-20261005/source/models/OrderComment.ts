import { Entity, ManyToOne, Column, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Order } from "./Order";
import { User } from "./User";
import { File } from "./File";

@Index("IDX_order_comments_active_order_created", ["orderId", "createdAt"], {
  where: '"deletedAt" IS NULL',
})
@Entity("order_comments")
export class OrderComment extends BaseEntity {
  //? hợp đồng ID
  @Column({ type: "uuid" })
  orderId!: string;

  //? người dùng báo cáo
  @Column({ type: "uuid", nullable: true })
  userId!: string | null;

  //? phản hồi comment ID (nếu có)
  @Column({ type: "uuid", nullable: true })
  replyCommentId!: string | null;

  //? nội dung
  @Column({ type: "text", nullable: true })
  content!: string | null;

  //? file đính kèm
  @Column({ type: "jsonb", nullable: true })
  attachments!: File[] | null;

  //? thời gian
  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  //? tags
  @Column({ type: "uuid", array: true, nullable: true, default: null })
  tags!: string[] | null;

  //============================= RELATIONS ========================//

  @ManyToOne(() => OrderComment, (orderComment) => orderComment.id, { nullable: true })
  @JoinColumn({ name: "replyCommentId" })
  replyComment!: OrderComment | null;

  @ManyToOne(() => Order, (order) => order.orderComments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User | null;
}
