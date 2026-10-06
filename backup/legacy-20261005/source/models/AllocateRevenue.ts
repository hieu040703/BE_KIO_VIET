import { Entity, ManyToOne, Column, OneToMany, Unique } from "typeorm";
import { BaseEntity, BaseNullableNumericColumnOptions, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { PositionDefaultEnum } from "@/shared/constants/constance";

//? bảng lưu lại lịch sử phân bổ doanh thu cho quản lý chi nhánh , kế toán
@Entity("allocate_revenue")
export class AllocateRevenue extends BaseEntity {
  //? ngày phân bổ doanh thu
  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  timeAt!: Date;

  //? phân bổ từ ngày
  @Column({ type: "date", nullable: true })
  fromDate: Date | null;

  //? phân bổ đến ngày
  @Column({ type: "date", nullable: true })
  toDate: Date | null;

  //? loại phân bổ (quản lý chi nhánh / kế toán)
  @Column({ type: "enum", enum: PositionDefaultEnum })
  type!: PositionDefaultEnum;

  //? tổng doanh thu được phân bổ
  @Column(BaseNumericColumnOptions)
  totalRevenue!: number;

  //? tổng doanh thu đã được phân bổ cho nhân viên
  @Column(BaseNullableNumericColumnOptions)
  totalAllocatedRevenue!: number;

  //? tổng doanh thu chưa được phân bổ cho nhân viên
  @Column(BaseNullableNumericColumnOptions)
  totalUnallocatedRevenue!: number;

  //? tổng doanh thu cần phân bổ cho nhân viên (tổng doanh thu - tổng doanh thu đã phân bổ)
  @Column(BaseNullableNumericColumnOptions)
  totalRevenueToAllocate!: number;
}
