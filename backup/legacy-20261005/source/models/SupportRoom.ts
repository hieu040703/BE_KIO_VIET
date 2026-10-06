import { Entity, ManyToOne, Column, OneToMany, Unique, OneToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { SupportRoomChatMessage } from "./SupportRoomChatMessage";
import { Customer } from "./Customer";

//? 1 room sẽ tương ứng với 1 customerId để support
@Entity("support_rooms")
export class SupportRoom extends BaseEntity {
  @Column({ type: "varchar" })
  name!: string;

  // customerId
  @Column({ type: "varchar" })
  customerId!: string;

  @OneToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  //? có tin nhắn chưa đọc hay không, để hiển thị badge ở UI
  @Column({ type: "boolean", default: false })
  hasUnreadMessages!: boolean;

  @OneToMany(() => SupportRoomChatMessage, (chatMessage) => chatMessage.supportRoom)
  chatMessages!: SupportRoomChatMessage[];
}
