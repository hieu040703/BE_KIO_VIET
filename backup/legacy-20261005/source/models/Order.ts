import { Entity, ManyToOne, Column, OneToMany, Unique, JoinColumn, Index, OneToOne } from "typeorm";
import { BaseEntity, BaseNullableNumericColumnOptions, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { BranchManagerConfirmStatusEnum, OrderStatusEnum } from "@/shared/constants/constance";
import { IAddress } from "@/modules/common/common.validator";
import { Customer } from "./Customer";
import { Branch } from "./Branch";
import { Employee } from "./Employee";
import { OrderDetail } from "./OrderDetail";
import { OrderEmployee } from "./OrderEmployee";
import { OrderComment } from "./OrderComment";
import { Finance } from "./Finance";
import { OrderLeader } from "./OrderLeader";
import { ServiceOrder } from "./ServiceOrder";
import { OrderLeaderChat } from "./OrderLeaderChat";

// Lưu trữ các hợp đồng
@Index("IDX_orders_active_timeAt", ["timeAt"], { where: '"deletedAt" IS NULL' })
@Index("IDX_orders_active_branch_status_timeAt", ["branchId", "status", "timeAt"], {
  where: '"deletedAt" IS NULL',
})
@Index("IDX_orders_active_customer_timeAt", ["customerId", "timeAt"], {
  where: '"deletedAt" IS NULL',
})
@Index("IDX_orders_active_referrer_timeAt", ["referrerId", "timeAt"], {
  where: '"deletedAt" IS NULL',
})
@Index("IDX_orders_active_code", ["code"], { where: '"deletedAt" IS NULL' })
@Index("IDX_orders_pending_calculation", ["calculationVersion", "calculatedVersion"], {
  where: '"deletedAt" IS NULL AND "calculationVersion" > "calculatedVersion"',
})
@Entity("orders")
export class Order extends BaseEntity {
  //? serviceOrderId (nếu có, dùng để liên kết với các dịch vụ khác như vận chuyển, kho bãi...)
  @Column({ type: "uuid", nullable: true })
  serviceOrderId!: string | null;

  @OneToOne(() => ServiceOrder, (serviceOrder) => serviceOrder.order, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "serviceOrderId" })
  serviceOrder!: ServiceOrder | null;

  //? chi nhanh ID (nếu có)
  @Index("IDX_orders_branchId")
  @Column({ type: "uuid" })
  branchId!: string;

  //? name
  @Column({ type: "varchar", length: 255, nullable: true })
  name!: string | null;

  //? mã hợp đồng
  @Index("IDX_orders_code")
  @Column({ type: "varchar", length: 50 })
  code!: string;

  //? khách hàng đặt đơn
  @Index("IDX_orders_customerId")
  @Column({ type: "uuid" })
  customerId!: string;

  //? email khách hàng (mặc định sẽ lấy từ thông tin khách hàng, người dùng có. thể cập nhật)
  @Column({ type: "varchar", length: 255, nullable: true })
  customerEmail!: string | null;

  //? số điện thoại khách hàng dùng riêng cho hợp đồng này (nếu khác hồ sơ khách hàng)
  @Column({ type: "varchar", length: 50, nullable: true })
  customerPhone!: string | null;

  //? mã số thuế khách hàng
  @Column({ type: "varchar", length: 20, nullable: true })
  customerTaxCode!: string | null;

  //? thời gian bắt đầu công việc
  @Index("IDX_orders_timeAt")
  @Column({ type: "timestamp with time zone" })
  timeAt!: Date;

  //? thời gian dự kiến hoàn thành công việc
  @Column({ type: "timestamp with time zone", nullable: true })
  estimatedCompletionAt!: Date | null;

  //? địa chỉ bốc hàng
  @Column({ type: "jsonb", default: {} })
  address!: IAddress;

  //? địa chỉ giao hàng
  @Column({ type: "jsonb", default: {} })
  deliveryAddress!: IAddress;

  //? tổng tiền hợp đồng trước vat và chiết khấu
  @Column(BaseNullableNumericColumnOptions)
  preVatAmount!: number | null;

  //? % chiết khấu nếu có
  @Column({ type: "float", nullable: true })
  discountPercent!: number | null;

  //? tiền chiết khấu nếu có
  @Column(BaseNullableNumericColumnOptions)
  discountAmount!: number | null;

  //? vat
  @Column({ type: "float", nullable: true })
  vat!: number | null;

  //? vat amount
  @Column(BaseNullableNumericColumnOptions)
  vatAmount!: number | null;

  //? tổng tiền hợp đồng
  @Column(BaseNumericColumnOptions)
  amount!: number;

  //##### Nhân sự #####//

  //? quản lý chi nhánh (người quản lý chi nhánh tại thời điểm ký hợp đồng)
  @Column({ type: "uuid", nullable: true })
  branchManagerId!: string;

  //? quản lý chi nhánh đã xác nhận nhận đơn hay chưa
  @Column({ type: "enum", enum: BranchManagerConfirmStatusEnum, default: BranchManagerConfirmStatusEnum.PENDING })
  branchManagerConfirmedStatus!: BranchManagerConfirmStatusEnum;

  //? thời gian quản lý chi nhánh xác nhận nhận đơn
  @Column({ type: "timestamp with time zone", nullable: true })
  branchManagerConfirmedAt!: Date | null;

  //? % lấy từ tổng tiền hợp đồng chia sẻ cho quản lý.
  @Column({ type: "float", nullable: true })
  allocateRevenuePercent!: number | null;

  //? đã phân bổ cho quản lý hay chưa
  @Column({ type: "boolean", default: false })
  hasAllocatedRevenue: boolean;

  //? nhân viên giới thiệu
  @Column({ type: "uuid", nullable: true })
  referrerId!: string | null;

  //? % hoa hồng giới thiệu
  @Column({ type: "float", nullable: true })
  referrerPercent!: number | null;

  //? đã thanh toán hoa hồng chưa
  @Column({ type: "boolean", default: false })
  isReferrerPaid!: boolean;

  //? tiền hoa hồng giới thiệu
  @Column(BaseNullableNumericColumnOptions)
  referrerAmount!: number | null;

  //? nhân viên tạo đơn
  @Column({ type: "uuid", nullable: true })
  createdByEmployeeId!: string | null;

  //? % hoa hồng cho nhân viên tạo đơn
  @Column({ type: "float", nullable: true })
  createdByEmployeePercent!: number | null;

  //? đã thanh toán hoa hồng chưa tạo đơn chưa
  @Column({ type: "boolean", default: false })
  isPaidForEmployeeCreateOrder!: boolean;

  //? số lượng nhân sự tham gia
  @Column({ type: "int", default: 1 })
  employeeCount!: number;

  //? mô tả công việc
  @Column({ type: "text", nullable: true })
  description!: string | null;

  //? trạng thái hợp đồng
  @Index("IDX_orders_status")
  @Column({
    type: "enum",
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  status!: OrderStatusEnum;

  //? link khác
  @Column({ type: "varchar", length: 255, nullable: true })
  link!: string | null;

  //? đã xuất hóa đơn chưa
  @Column({ type: "boolean", default: false })
  isInvoiced!: boolean;

  //? số hóa đơn nếu có
  @Column({ type: "varchar", length: 100, nullable: true })
  invoiceNumber!: string | null;

  //? ngày xuất hóa đơn nếu có
  @Column({ type: "timestamp with time zone", nullable: true })
  invoiceDate!: Date | null;

  //? số tiền trả trước
  @Column({ type: "float", nullable: true })
  deposit!: number | null;

  //? đã thanh toán xong chưa
  @Column({ type: "boolean", default: false })
  isPaid!: boolean;

  //? đơn gấp - cần xử lý ngay
  @Column({ type: "boolean", default: false })
  isUrgent!: boolean;

  //? nhân viên xác nhận hoàn thành
  @Column({ type: "uuid", nullable: true })
  completedByEmployeeId!: string | null;
  @ManyToOne(() => Employee, { onDelete: "SET NULL" })
  @JoinColumn({ name: "completedByEmployeeId" })
  completedByEmployee!: Employee | null;

  //? thời gian hoàn thành
  @Column({ type: "timestamp with time zone", nullable: true })
  completedAt!: Date | null;

  // Phiên bản dữ liệu dẫn xuất cần đồng bộ qua queue.
  @Column({ type: "int", default: 0 })
  calculationVersion!: number;

  // Phiên bản gần nhất worker đã xử lý thành công.
  @Column({ type: "int", default: 0 })
  calculatedVersion!: number;

  //? số sao đánh giá từ khách hàng
  @Column({ type: "int", nullable: true })
  rating!: number | null;

  attachment: File[] | null;
  totalIncomeAmount: number | null;
  totalUnpaidAmount: number | null;

  //============================= RELATIONS ========================//

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "branchId" })
  branch!: Branch | null;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "branchManagerId" })
  branchManager!: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "referrerId" })
  referrer!: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "createdByEmployeeId" })
  createdByEmployee!: Employee | null;

  @OneToMany(() => OrderDetail, (detail) => detail.order, {
    eager: true,
    cascade: ["insert", "update", "remove", "soft-remove"],
  })
  details!: OrderDetail[];

  @OneToMany(() => OrderEmployee, (orderEmployee) => orderEmployee.order, {
    eager: true,
    cascade: ["insert", "update", "remove", "soft-remove"],
  })
  orderEmployees!: OrderEmployee[];

  @OneToMany(() => OrderComment, (orderComment) => orderComment.order, {
    eager: true,
    cascade: ["insert", "update", "remove", "soft-remove"],
  })
  orderComments!: OrderComment[];

  @OneToMany(() => Finance, (finance) => finance.order, {
    eager: true,
    cascade: ["insert", "update", "remove", "soft-remove"],
  })
  finances!: Finance[];

  @OneToMany(() => OrderLeader, (orderLeader) => orderLeader.order, {
    eager: true,
    cascade: ["insert", "update", "remove", "soft-remove"],
  })
  orderLeaders!: OrderLeader[];

  @OneToMany(() => OrderLeaderChat, (chat) => chat.order)
  orderLeaderChats!: OrderLeaderChat[];

  // Virtual field for unread comment count (derived từ order_comment_read_states)
  // KHÔNG khai báo trong class: mapRawEntities map alias addSelect vào extras,
  // nếu khai báo field sẽ bị useDefineForClassFields define undefined → extras bị bỏ qua.
  // unreadCommentCount?: number;
}
