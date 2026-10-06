import { BaseEntity, BaseNullableNumericColumnOptions } from "@/shared/base/BaseEntity";
import { OtherAmountTypeEnum, TimeKeepingTypeEnum } from "@/shared/constants/constance";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { TimeKeepingConfirm } from "./TimeKeepingConfirm";
import { AllocateRevenue } from "./AllocateRevenue";
import { OrderEmployee } from "./OrderEmployee";
import { Employee } from "./Employee";
import { Finance } from "./Finance";
import { Margin } from "./Margin";
import { Order } from "./Order";
import { File } from "./File";

@Entity("time_keepings")
export class TimeKeeping extends BaseEntity {
  //? nhân viên
  @Index("IDX_timeKeepings_employeeId")
  @Column({ type: "uuid" })
  employeeId!: string;

  // timeKeepingConfirmId
  @Index("IDX_timeKeepings_timeKeepingConfirmId")
  @Column({ type: "uuid", nullable: true })
  timeKeepingConfirmId!: string | null;

  // order employee id
  @Index("IDX_timeKeepings_orderEmployeeId")
  @Column({ type: "uuid", nullable: true })
  orderEmployeeId: string | null;

  //? thời gian bắt đầu công việc
  @Index("IDX_timeKeepings_timeAt")
  @Column({ type: "timestamp with time zone", nullable: true })
  timeAt!: Date | null;

  //? giờ bắt đầu
  @Column({ type: "time without time zone", nullable: true })
  startTime!: string | null;

  //? giờ kết thúc
  @Column({ type: "time without time zone", nullable: true })
  endTime!: string | null;

  //? số giờ làm việc
  @Column({ type: "float", nullable: true })
  totalHours!: number | null;

  //? mức lương
  @Column(BaseNullableNumericColumnOptions)
  salary!: number | null;

  //? phiếu tạm ứng lương liên quan
  @Index("IDX_timeKeepings_advanceSalaryId")
  @Column({ type: "uuid", nullable: true })
  advanceSalaryId!: string | null;

  //? biên lai ký quỹ liên quan
  @Index("IDX_timeKeepings_marginId")
  @Column({ type: "uuid", nullable: true })
  marginId!: string | null;

  //? đơn hàng liên  quan (liên quan đến hoa hồng giới thiệu của nhân viên / phân bổ doanh thu)
  @Index("IDX_timeKeepings_referrerOrderId")
  @Column({ type: "uuid", nullable: true })
  referrerOrderId!: string | null;

  //? khoản khác
  @Column(BaseNullableNumericColumnOptions)
  otherAmount!: number | null;

  //? loại khoản khác (thưởng, phạt...)
  @Column({ type: "enum", enum: OtherAmountTypeEnum, nullable: true })
  otherAmountType!: OtherAmountTypeEnum | null;

  //? đã trả lương chưa
  @Column({ type: "boolean", default: false })
  isPaid!: boolean;

  //? đã thu khoản lương chưa (đây là các khoản lương chưa thanh toán, nhân viên nghỉ việc giữa chừng, công ty sẽ thu về xem như doanh thu)
  @Column({ type: "boolean", default: false })
  isCollected!: boolean;

  //? incomeId => khi nhân viên nghỉ hệ thống sẽ tạo khoản thu, gắn ID khoản thu vào các Timekeeping để sau này nếu muốn không thu nữa sẽ tìm được và xóa khoản thu đó đi
  @Column({ type: "uuid", nullable: true })
  incomeId!: string | null;

  //? type => để biết được khoản này là thu vào hay chi ra cho nhân viên (ví dụ đồng phục, nếu nhân viên chưa đóng thì ở lần trả lương đầu tiên sẽ trừ đi, nếu nhân viên nghỉ thì sẽ trả lại tiền đồng phục cho nhân viên)
  @Column({ type: "enum", enum: TimeKeepingTypeEnum, nullable: true })
  type!: TimeKeepingTypeEnum | null;

  attachment?: File[] | null;

  //? nhân viên được giới thiệu
  @Column({ type: "uuid", nullable: true })
  referralEmployeeId!: string | null;

  //? mã cấu hình
  @Column({ type: "varchar", nullable: true })
  referralConfigCode!: string | null;

  //? ngày áp dụng của cấu hình salesTargetBonus (AppSetting) đã sinh ra bản ghi thưởng này
  //? dùng làm định danh vì salesTargetBonus là mảng JSON không có id ổn định
  @Index("IDX_timeKeepings_referralAppliedDate")
  @Column({ type: "timestamp with time zone", nullable: true })
  referralAppliedDate!: Date | null;

  //? đây là lương phân bổ doanh thu
  @Column({ type: "boolean", default: false })
  isRevenueShareAllocation!: boolean;

  //? ngày bắt đầu phân bổ
  @Column({ type: "date", nullable: true, default: null })
  revenueShareStartDate!: Date | null;

  //? ngày kết thúc phân bổ
  @Column({ type: "date", nullable: true, default: null })
  revenueShareEndDate!: Date | null;

  //? lần phân bổ doanh thu liên quan
  @Index("IDX_timeKeepings_allocateRevenueId")
  @Column({ type: "uuid", nullable: true })
  allocateRevenueId!: string | null;

  //============================= RELATIONS ========================//

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "referralEmployeeId" })
  referralEmployee!: Employee | null;

  @OneToOne(() => OrderEmployee, (orderEmployee) => orderEmployee.timeKeeping, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderEmployeeId" })
  orderEmployee?: OrderEmployee;

  @OneToOne(() => Finance)
  @JoinColumn({ name: "advanceSalaryId" })
  advanceSalary!: Finance;

  @ManyToOne(() => Margin)
  @JoinColumn({ name: "marginId" })
  margin!: Margin;

  @ManyToOne(() => Order)
  @JoinColumn({ name: "referrerOrderId" })
  referrerOrder!: Order;

  @ManyToOne(() => TimeKeepingConfirm, (timeKeepingConfirm) => timeKeepingConfirm.timeKeepings, { nullable: true })
  @JoinColumn({ name: "timeKeepingConfirmId" })
  timeKeepingConfirm!: TimeKeepingConfirm | null;

  @ManyToOne(() => AllocateRevenue, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "allocateRevenueId" })
  allocateRevenue!: AllocateRevenue | null;
}
