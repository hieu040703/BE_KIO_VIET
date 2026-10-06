import { Entity, ManyToOne, Column, OneToMany, Unique } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { TransactionTypeEnum } from "@/shared/constants/constance";

@Entity("transactions")
export class Transaction extends BaseEntity {
  //? Số phiếu
  @Column({ type: "varchar" })
  code!: string;

  //? ID phiếu liên quan
  @Column({ type: "uuid" })
  financeId!: string;

  //? Loại giao dịch
  @Column({ type: "enum", enum: TransactionTypeEnum })
  type!: TransactionTypeEnum;

  //? Ngày giờ
  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  //? Số tiền
  @Column(BaseNumericColumnOptions)
  amount!: number;
}
