import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { Fund } from "./Fund";

// Lưu trữ các giao dịch quỹ / tài khoản
@Entity("fund_transactions")
export class FundTransaction extends BaseEntity {
  //? ID giao dịch
  @Column({ type: "varchar", unique: true })
  code!: string;

  //? quỹ / tài khoản công ty
  @Column({ type: "uuid" })
  fundId!: string;

  //? số tiền giao dịch
  @Column(BaseNumericColumnOptions)
  amount!: number;

  //? thời gian giao dịch
  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  //? số tài khoản giao dịch
  @Column({ type: "varchar", nullable: true })
  transactionAccountNumber!: string | null;

  //? mã giao dịch từ hệ thống thanh toán
  @Column({ type: "varchar", nullable: true })
  transactionCode!: string | null;

  //? referenceCode
  @Column({ type: "varchar", nullable: true })
  referenceCode!: string | null;

  //? transferType
  @Column({ type: "varchar", nullable: true })
  transferType!: string | null;

  //? nội dung giao dịch
  @Column({ type: "varchar", nullable: true })
  description!: string | null;

  //===== relations =====//
  @ManyToOne(() => Fund)
  @JoinColumn({ name: "fundId" })
  fund!: Fund;
}
