import { Entity, ManyToOne, Column, JoinColumn } from "typeorm";
import { User } from "./User";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Notification } from "./Notification";

// Notification entity for system, club, friend, and tournament notifications
@Entity("notification_details")
export class NotificationDetail extends BaseEntity {
  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "uuid" })
  notificationId!: string;

  @Column({ type: "boolean", default: false })
  isRead!: boolean;

  @ManyToOne(() => User, (user) => user.notificationDetails)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Notification, (notification) => notification.details)
  @JoinColumn({ name: "notificationId" })
  notification!: Notification;
}
