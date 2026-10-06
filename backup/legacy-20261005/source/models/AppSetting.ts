import { Entity, ManyToOne, Column, OneToMany, Unique } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { ReferralTypeEnum } from "@/shared/constants/constance";

// cấu hình đơn hàng
interface OrderSetting {
  // phần trăm VAT
  vat: number;
  // phần trăm hoa hồng cho nhân viên khi bán hàng
  commission: number;
  // sai số khoảng cách checkin tối đa cho phép (tính bằng mét)
  checkInDistanceThreshold: number;
  // số phút nhắc trước khi đến giờ bắt đầu đơn hàng
  orderStartNotificationMinutes: number;
  // chu kỳ gửi cảnh báo cho đơn gấp (phút)
  urgentOrderAlertIntervalMinutes: number;
  // chu kỳ gửi cảnh báo cho đơn thường (phút)
  regularOrderAlertIntervalMinutes: number;
  // % phân bổ doanh thu cho quản lý chi nhánh
  branchManagerRevenueShare: number;
  // % phân bổ doanh thu cho kế toán
  accountantRevenueShare: number;
  // kích hoạt đặt đơn gấp (dưới 2 tiếng)
  urgentOrderEnabled: boolean;
  // số giờ tính cho đơn hàng gấp (ví dụ: 2 giờ)
  urgentOrderHours: number;
  // % phụ phí cho đơn hàng gấp (ví dụ: 20%)
  urgentOrderSurchargePercent: number;
  // % phụ phí cho đơn hàng có vật dễ vỡ (ví dụ: 10%)
  fragileItemSurchargePercent: number;
}

// cấu hình khách hàng (khi khách hàng giới thiệu cho khách khác)
interface CustomerSetting {
  // số đơn người giới thiệu được thưởng khi khách được giới thiệu đặt đơn hàng
  referralBonus: number;
  // số tiền tối thiểu đặt đơn để người giới thiệu được thưởng
  referralThreshold: number;
}

// cấu hình nhân viên
interface EmployeeSetting {
  // thưởng phạt cho nhân viên khi đạt/không đạt được mục tiêu doanh số
  salesTargetBonus: {
    code: string; // mã cấu hình (dùng để dedupe các bản ghi thưởng đã tạo)
    type: ReferralTypeEnum; // loại thưởng phạt
    daysWorking: number; // số ngày làm việc để đạt được mục tiêu
    bonusValue: number; // giá trị thưởng phạt
    daysOff: number; // số ngày tính lao động nghỉ việc (ví dụ 7 : tính số nhân viên nghỉ việc trong vòng 7 ngày kể từ ngày hiện tại đổ
    percentOff: number; // số % lao động nghỉ việc để tính vào phạt (số người nghỉ việc / số nhân viên tuyển được trong tháng)
    percentFine: number; // số % tiền phạt so với lương tháng (số % lương sẽ trừ đi / tổng lương trong tháng)
    appliedDate: Date; // ngày áp dụng cấu hình (tính theo ngày tạo cấu hình)
  }[];
  // thưởng phạt cho nhân viên khi nghỉ việc
  turnoverPenalty: {
    daysOff: number; // số ngày tính lao động nghỉ việc
    percentOff: number; // số % lao động nghỉ việc để tính vào phạt
    percentFine: number; // số % tiền phạt so với lương tháng
  };
  // tiền đồng phục
  uniform: number;
  // tiền ký quỹ
  margin: number;
}

// cấu hình voucher
interface VoucherSetting {
  // số tiền tối thiểu đặt đơn để khách hàng được áp dụng voucher
  minOrderValue: number;
  // quy đổi bao nhiêu tiền trên 1 điểm thưởng
  pointToMoneyRate: number;
}

// cấu hình thông báo
interface NotificationSetting {
  // danh sách các loại thông báo mà người dùng muốn nhận
  preferences: string[];
}

@Entity("app_settings")
export class AppSetting extends BaseEntity {
  // order settings
  @Column({ type: "json" })
  order!: OrderSetting;

  // customer care settings
  @Column({ type: "json" })
  customer!: CustomerSetting;

  // employee settings
  @Column({ type: "json" })
  employee!: EmployeeSetting;

  // voucher settings
  @Column({ type: "json" })
  voucher!: VoucherSetting;

  // notification settings
  @Column({ type: "json" })
  notification!: NotificationSetting;
}
