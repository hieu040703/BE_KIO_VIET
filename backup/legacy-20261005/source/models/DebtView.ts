import { Entity, ManyToOne, Column, JoinColumn } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { Customer } from "./Customer";

@Entity("debts")
export class DebtView extends BaseEntity {
  //? khách hàng liên quan
  @Column({ type: "uuid" })
  customerId!: string;

  //? beginningDebt
  @Column(BaseNumericColumnOptions)
  beginningDebt!: number;

  //? debtIncrease
  @Column(BaseNumericColumnOptions)
  debtIncrease!: number;

  //? debtDecrease
  @Column(BaseNumericColumnOptions)
  debtDecrease!: number;

  //? endingDebt
  @Column(BaseNumericColumnOptions)
  endingDebt!: number;

  //============================= RELATIONS ========================//
  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;
}
