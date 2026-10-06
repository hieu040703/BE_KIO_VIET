import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { Branch } from "./Branch";
import { Employee } from "./Employee";
import { User } from "./User";
import { MarginStatusEnum, MarginTypeEnum } from "@/shared/constants/constance";
import { ExpenseApproval } from "./ExpenseApproval";

//? Bảng ký quỹ, tiền nhân viên đặt cọc với công ty
@Entity("margins")
export class Margin extends BaseEntity {
  //? chi nhánh
  @Column({ type: "uuid", nullable: true })
  branchId!: string | null;

  //? nhân viên liên quan
  @Column({ type: "uuid", nullable: true })
  employeeId!: string | null;

  //? Số phiếu
  @Column({ type: "varchar" })
  code!: string;

  //? Ngày giờ
  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  //? Số tiền
  @Column(BaseNumericColumnOptions)
  amount!: number;

  //? TK Người lập phiếu
  @Column({ type: "uuid" })
  userId!: string;

  //? type
  @Column({ type: "enum", enum: MarginTypeEnum, default: MarginTypeEnum.MARGIN })
  type: MarginTypeEnum;

  // status
  @Column({ type: "enum", enum: MarginStatusEnum, nullable: true })
  status: MarginStatusEnum | null;

  //? is automatic: nếu khoản ký quỹ này được tạo tự động khi chấm công thì sẽ có giá trị là true, ngược lại nếu nhân viên tự tạo để nộp tiền ký quỹ thì sẽ có giá trị là false
  // @Column({ type: "boolean", default: false })
  // isAutomatic!: boolean;

  //============================= RELATIONS ========================//

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => ExpenseApproval)
  @JoinColumn({ name: "expenseApprovalId" })
  expenseApproval!: ExpenseApproval;
}
