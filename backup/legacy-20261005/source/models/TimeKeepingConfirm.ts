import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn } from "typeorm";
import { BaseEntity, BaseNullableNumericColumnOptions, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { TimeKeeping } from "./TimeKeeping";
import { Employee } from "./Employee";

@Entity("time_keeping_confirms")
export class TimeKeepingConfirm extends BaseEntity {
  //? nhân viên
  @Column({ type: "uuid" })
  employeeId!: string;

  //? thời gian xác nhận
  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  //? chấm lương từ ngày
  @Column({ type: "timestamp with time zone" })
  startAt!: Date;

  //? chấm lương đến ngày
  @Column({ type: "timestamp with time zone" })
  endAt!: Date;

  //? người xác nhận
  @Column({ type: "uuid" })
  userId!: string;

  //? totalHours
  @Column(BaseNumericColumnOptions)
  totalHours!: number;

  // totalDayWorked
  @Column(BaseNullableNumericColumnOptions)
  totalDayWorked!: number | null;

  //? totalSalary
  @Column(BaseNumericColumnOptions)
  totalSalary!: number;

  //? totalRealSalary
  @Column(BaseNumericColumnOptions)
  totalRealSalary!: number;

  //? totalAdvance
  @Column(BaseNullableNumericColumnOptions)
  totalAdvance?: number | null;

  //? totalMargin
  @Column(BaseNullableNumericColumnOptions)
  totalMargin?: number | null;

  //? totalUniform
  @Column(BaseNullableNumericColumnOptions)
  totalUniform?: number | null;

  //? totalPenalty
  @Column(BaseNullableNumericColumnOptions)
  totalPenalty?: number | null;

  //? totalBonus
  @Column(BaseNullableNumericColumnOptions)
  totalBonus?: number | null;

  //? đã thanh toán
  @Column({ type: "boolean", default: false })
  isPaid!: boolean;

  //============================= RELATIONS =============================//
  @ManyToOne(() => Employee, (employee) => employee.timeKeepingConfirms)
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @OneToMany(() => TimeKeeping, (timeKeeping) => timeKeeping.timeKeepingConfirm)
  timeKeepings!: TimeKeeping[];
}
