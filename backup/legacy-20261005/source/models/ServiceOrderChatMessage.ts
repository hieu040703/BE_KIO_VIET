import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { ServiceOrder } from "./ServiceOrder";
import { User } from "./User";
import { File } from "./File";
import { ServiceOrderChatMessageTypeEnum } from "@/shared/constants/constance";

@Index("IDX_service_order_chat_messages_active_serviceOrder_timeAt", ["serviceOrderId", "timeAt"], {
  where: '"deletedAt" IS NULL',
})
@Entity("service_order_chat_messages")
export class ServiceOrderChatMessage extends BaseEntity {
  @Column({ type: "uuid" })
  serviceOrderId!: string;

  @Column({ type: "uuid", nullable: true })
  senderUserId!: string | null;

  @Column({ type: "enum", enum: ServiceOrderChatMessageTypeEnum })
  messageType!: ServiceOrderChatMessageTypeEnum;

  @Column({ type: "text", nullable: true })
  content!: string | null;

  @Column({ type: "jsonb", nullable: true })
  attachments!: File[] | null;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, any> | null;

  //? danh sách user được tag trong tin nhắn (UUID array)
  @Column({ type: "uuid", array: true, nullable: true, default: null })
  tags!: string[] | null;

  @ManyToOne(() => ServiceOrder, { onDelete: "CASCADE" })
  @JoinColumn({ name: "serviceOrderId" })
  serviceOrder!: ServiceOrder;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "senderUserId" })
  sender!: User | null;
}
