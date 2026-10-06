import { Entity, ManyToOne, Column, OneToMany, Unique } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";

@Entity("referral_logs")
export class ReferralLog extends BaseEntity {
  //? nhân viên
  @Column({ type: "uuid" })
  employeeId!: string;

  //? người giới thiệu
  @Column({ type: "uuid" })
  referrerId!: string;

  //? timeAt
  @Column({ type: "timestamp with time zone" })
  timeAt!: Date;
}
