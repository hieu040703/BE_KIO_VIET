import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { InvoiceTypeEnum } from "@/shared/constants/constance";
import { Order } from "./Order";
import { Customer } from "./Customer";
import { Employee } from "./Employee";
import { Branch } from "./Branch";

@Entity("invoices")
export class Invoice extends BaseEntity {
  // hợp đồng liên quan nếu có
  @Column({ type: "uuid", nullable: true })
  orderId?: string | null;

  // chi nhánh liên quan nếu có
  @Column({ type: "uuid", nullable: true })
  branchId?: string | null;

  // khách hàng liên quan nếu có
  @Column({ type: "uuid", nullable: true })
  customerId?: string | null;

  // nhân viên liên quan nếu có
  @Column({ type: "uuid", nullable: true })
  employeeId?: string | null;

  // ngày hóa đơn
  @Column({ type: "timestamp with time zone" })
  timeAt!: Date;

  // mã hóa đơn
  @Column({ type: "varchar" })
  code!: string;

  // loại hóa đơn
  @Column({ type: "enum", enum: InvoiceTypeEnum, default: InvoiceTypeEnum.SALES })
  type!: InvoiceTypeEnum;

  // nội dung hóa đơn
  @Column({ type: "varchar" })
  description!: string;

  // tổng tiền trước thuế
  @Column(BaseNumericColumnOptions)
  totalBeforeTax!: number;

  // % thuế
  @Column({ type: "float" })
  taxPercent!: number;

  // tổng tiền thuế
  @Column(BaseNumericColumnOptions)
  taxAmount!: number;

  // tổng tiền sau thuế
  @Column(BaseNumericColumnOptions)
  totalAfterTax!: number;

  //====== Quan hệ ======//

  @ManyToOne(() => Order)
  @JoinColumn({ name: "orderId" })
  order?: Order;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer?: Customer;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employeeId" })
  employee?: Employee;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "branchId" })
  branch?: Branch;
}
