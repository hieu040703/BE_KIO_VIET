import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { ExpenseApprovalStatusEnum, FinanceTypeEnum, MarginStatusEnum } from "@/shared/constants/constance";
import { Branch } from "./Branch";
import { Customer } from "./Customer";
import { Order } from "./Order";
import { Employee } from "./Employee";
import { User } from "./User";
import { ExpenseApproval } from "./ExpenseApproval";
import { TimeKeepingConfirm } from "./TimeKeepingConfirm";

@Entity("finances")
export class Finance extends BaseEntity {
  //? chi nhánh
  @Column({ type: "uuid", nullable: true })
  branchId!: string | null;

  //? Số phiếu
  @Column({ type: "varchar" })
  code!: string;

  //? Loại giao dịch
  @Column({ type: "enum", enum: FinanceTypeEnum })
  type!: FinanceTypeEnum;

  //? TK Người lập phiếu
  @Column({ type: "uuid", nullable: true })
  userId!: string | null;

  //? Ngày giờ
  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  //? category
  @Column({ type: "text" })
  category!: string;

  //? Số tiền
  @Column(BaseNumericColumnOptions)
  amount!: number;

  //? thu chi nhân viên (tạm ứng, hoàn ứng)
  @Column({ type: "uuid", nullable: true })
  employeeId!: string | null;

  //? khách hàng liên quan
  @Column({ type: "uuid", nullable: true })
  customerId!: string | null;

  //? hợp đồng liên quan
  @Column({ type: "uuid", nullable: true })
  orderId!: string | null;

  //? số hóa đơn
  @Column({ type: "varchar", nullable: true })
  invoiceNumber!: string | null;

  //? đã khấu trừ tạm ứng lương
  @Column({ type: "boolean", default: false })
  isDeductedAdvanceSalary?: boolean;

  //? là khoản đặt cọc trước
  @Column({ type: "boolean", default: false })
  isDeposit?: boolean;

  //? có tính công nợ không
  @Column({ type: "boolean", default: true })
  isDebtRelated?: boolean;

  //? đã được phê duyệt chưa
  @Column({ type: "enum", enum: ExpenseApprovalStatusEnum, nullable: true })
  status!: ExpenseApprovalStatusEnum | null;

  //? ID phiếu phê duyệt chi tiêu
  @Column({ type: "uuid", nullable: true })
  expenseApprovalId!: string | null;

  //? ID phiếu xác nhận bảng lương (khi phê duyệt phiếu chi có timeKeepingConfirmId thì phải cập nhật lại trạng thái của các bản ghi timeKeeping tương ứng: isPaid => true)
  @Column({ type: "uuid", nullable: true })
  timeKeepingConfirmId!: string | null;

  remainingDebt: number;

  //============================= RELATIONS ========================//

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @ManyToOne(() => Order, (order) => order.finances, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => ExpenseApproval)
  @JoinColumn({ name: "expenseApprovalId" })
  expenseApproval!: ExpenseApproval;

  @OneToOne(() => TimeKeepingConfirm)
  @JoinColumn({ name: "timeKeepingConfirmId" })
  timeKeepingConfirm!: TimeKeepingConfirm;
}
