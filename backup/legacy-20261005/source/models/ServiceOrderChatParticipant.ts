import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { ServiceOrder } from "./ServiceOrder";
import { User } from "./User";

@Index("IDX_service_order_chat_participants_active", ["serviceOrderId", "userId"], {
  where: '"deletedAt" IS NULL',
  unique: true,
})
@Entity("service_order_chat_participants")
export class ServiceOrderChatParticipant extends BaseEntity {
  @Column({ type: "uuid" })
  serviceOrderId!: string;

  //? user được thêm vào cuộc hội thoại
  @Column({ type: "uuid" })
  userId!: string;

  //? admin đã thêm user này
  @Column({ type: "uuid", nullable: true })
  addedByUserId!: string | null;

  //============================= RELATIONS ========================//

  @ManyToOne(() => ServiceOrder, { onDelete: "CASCADE" })
  @JoinColumn({ name: "serviceOrderId" })
  serviceOrder!: ServiceOrder;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "addedByUserId" })
  addedBy!: User | null;
}
