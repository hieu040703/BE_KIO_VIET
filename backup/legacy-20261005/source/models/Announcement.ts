import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { AnnouncementStatusEnum } from "@/shared/constants/constance";
import { User } from "./User";

@Entity("announcements")
export class Announcement extends BaseEntity {
  @Column({ type: "varchar", length: 500 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "timestamp", nullable: true })
  sentAt!: Date | null;

  @Column({ type: "uuid", nullable: true })
  sentBy!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "sentBy" })
  sender!: User | null;

  @Column({
    type: "enum",
    enum: AnnouncementStatusEnum,
    default: AnnouncementStatusEnum.DRAFT,
  })
  status!: AnnouncementStatusEnum;
}
