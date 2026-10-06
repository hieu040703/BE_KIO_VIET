import { Entity, ManyToOne, Column } from "typeorm";
import { User } from "./User";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { AuthSessionTypeEnum } from "@/shared/constants/constance";

// Token entity for tracking user tokens
@Entity("tokens")
export class Token extends BaseEntity {
  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", nullable: true })
  refreshToken!: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  sessionType!: AuthSessionTypeEnum | null;

  @Column({ type: "varchar", nullable: true })
  firebaseToken!: string | null;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  expiresAt!: Date;

  @ManyToOne(() => User)
  user!: User;
}
