import { Entity, ManyToOne, Column, JoinColumn, Index } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { DebtTypeEnum } from "@/shared/constants/constance";
import { Customer } from "./Customer";
import { Order } from "./Order";
import { Finance } from "./Finance";

@Entity("debts")
export class Debt extends BaseEntity {
  //? Số phiếu
  @Column({ type: "varchar" })
  code!: string;

  //? khách hàng liên quan
  @Index("IDX_debts_customerId")
  @Column({ type: "uuid" })
  customerId!: string;

  //? Loại giao dịch
  @Column({ type: "enum", enum: DebtTypeEnum })
  type!: DebtTypeEnum;

  //? Ngày giờ
  @Index("IDX_debts_timeAt")
  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  //? Số tiền
  @Column(BaseNumericColumnOptions)
  amount!: number;

  //? hợp đồng liên quan
  @Index("IDX_debts_orderId")
  @Column({ type: "uuid", unique: true })
  orderId!: string;

  //? khoản thu / chi liên quan
  @Index("IDX_debts_financeId")
  @Column({ type: "uuid", nullable: true })
  financeId!: string | null;

  remainingDebt: number;

  //============================= RELATIONS ========================//
  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => Finance)
  @JoinColumn({ name: "financeId" })
  finance!: Finance;
}
