import { ServiceOrderChatMessageTypeEnum } from "@/shared/constants/constance";
import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { SupportRoom } from "./SupportRoom";
import { User } from "./User";
import { File } from "./File";

@Index("IDX_support_room_chat_messages_active_supportRoom_timeAt", ["supportRoomId", "timeAt"], {
  where: '"deletedAt" IS NULL',
})
@Entity("support_room_chat_messages")
export class SupportRoomChatMessage extends BaseEntity {
  @Column({ type: "uuid" })
  supportRoomId!: string;

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

  @ManyToOne(() => SupportRoom, { onDelete: "CASCADE" })
  @JoinColumn({ name: "supportRoomId" })
  supportRoom!: SupportRoom;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "senderUserId" })
  sender!: User | null;
}
