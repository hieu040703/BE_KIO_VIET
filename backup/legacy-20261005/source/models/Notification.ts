import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { NotificationTypeEnum } from "@/shared/constants/constance";
import { NotificationDetail } from "./NotificationDetail";

// Notification entity for system, club, friend, and tournament notifications
@Entity("notifications")
export class Notification extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  @Column({ type: "enum", enum: NotificationTypeEnum })
  type!: NotificationTypeEnum;

  @Column({ type: "uuid", nullable: true })
  objectId?: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata?: any;

  @OneToMany(() => NotificationDetail, (detail) => detail.notification, {
    eager: true,
    cascade: true,
  })
  details!: NotificationDetail[];
}
