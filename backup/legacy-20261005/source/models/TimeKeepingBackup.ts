import { Entity, ManyToOne, Column, OneToMany, Unique } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";

@Entity("time_keeping_backups")
export class TimeKeepingBackup extends BaseEntity {
  //? tham chiếu đến bản ghi timeKeeping đã được sao lưu
  @Column({ type: "uuid" })
  timeKeepingConfirmId!: string;

  //? data sao lưu
  @Column({ type: "jsonb", array: true })
  data!: any;
}
