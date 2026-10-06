import {
  ServiceOrderTypeEnum,
  DocumentRequirementEnum,
  ServiceOrderStatusEnum,
  OrderFeeCategoryCodeEnum,
} from "@/shared/constants/constance";
import { BaseEntity, BaseNullableNumericColumnOptions } from "@/shared/base/BaseEntity";
import { Entity, Column, ManyToMany, JoinColumn, ManyToOne, OneToOne, OneToMany, Index } from "typeorm";
import { IAddress } from "@/modules/common/common.validator";
import { Customer } from "./Customer";
import { Employee } from "./Employee";
import { Branch } from "./Branch";
import { Order } from "./Order";
import { Vouchers } from "./Vouchers";
import { Ticket } from "./Ticket";

// Thông tin đồ đạc cần tháo lắp / di chuyển (dùng cho dịch vụ chuyển nhà)
export interface IItemDetail {
  name: string; // tên đồ vật
  quantity: number; // số lượng
  unit?: string | null; // đơn vị (cái, chiếc, ...)
  note?: string | null; // ghi chú riêng
}

// thông tin loại xe và số lượng xe cần thuê (dùng cho dịch vụ xe nâng, xe cẩu, dịch vụ vận tải)
export interface IServicePrice {
  name: string; // loại xe
  quantity: number; // số lượng
  unit?: string | null; // đơn vị (cái, chiếc, ...)
  price: number; // giá thuê 1 xe
  note?: string | null; // ghi chú riêng
}

export interface IQuoteItem {
  key: string; // tên mục báo giá
  value: number; // giá trị
  code: OrderFeeCategoryCodeEnum | null; // loại mục báo giá (nếu có)
  type: "inc" | "dec"; // tăng , giảm
  note?: string | null; // ghi chú riêng
}

@Entity("service_orders")
export class ServiceOrder extends BaseEntity {
  //============================= Thông tin khách hàng, nhân viên ========================//
  //# khách hàng
  @Column({ type: "uuid" })
  customerId!: string;
  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  //# chi nhánh được phân công xử lý
  @Column({ type: "uuid", nullable: true })
  branchId!: string | null;
  @ManyToOne(() => Branch, { onDelete: "SET NULL" })
  @JoinColumn({ name: "branchId" })
  branch!: Branch | null;

  //# quản lý chi nhánh (nhân viên sẽ xử lý đơn hàng, dùng để phân quyền xem đơn hàng theo quản lý chi nhánh)
  @Column({ type: "uuid", nullable: true })
  branchManagerId!: string | null;
  @ManyToOne(() => Employee, { onDelete: "SET NULL" })
  @JoinColumn({ name: "branchManagerId" })
  branchManager!: Employee | null;

  //# nhân viên đầu cánh (phụ trách chính đơn hàng)
  @Column({ type: "uuid", nullable: true })
  employeeId!: string | null;
  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employeeId" })
  employee!: Employee | null;

  //? đã đồng bộ sang pgvector cho RAG chưa
  @Column({ default: false })
  syncedToVector!: boolean;

  //============================= Thông tin chung ========================//
  //? mã đơn dịch vụ
  @Index("IDX_service_orders_code")
  @Column({ type: "varchar", length: 50, nullable: true })
  code!: string | null;

  //? loại dịch vụ
  @Column({ type: "enum", enum: ServiceOrderTypeEnum })
  type!: ServiceOrderTypeEnum;

  //# thời gian
  @Column({ type: "timestamp without time zone" })
  timeAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  orderStartNotificationSentAt!: Date | null;

  //# địa chỉ
  @Column({ type: "jsonb" })
  address!: IAddress;

  //# ghi công nợ
  @Column({ type: "boolean", default: false })
  isDebt!: boolean;

  //? yêu cầu tư vấn báo giá trực tiếp (thay vì điền thông tin đầy đủ)
  @Column({ type: "boolean", default: false })
  needsQuote!: boolean;

  //# tài liệu cần mang theo (hợp đồng hoặc biên bản nghiệm thu)
  @Column({ type: "enum", enum: DocumentRequirementEnum, nullable: true })
  documentRequirement!: DocumentRequirementEnum | null;

  //# tên người liên hệ (dùng khi cần tư vấn báo giá)
  @Column({ type: "varchar", length: 255, nullable: true })
  contactName!: string | null;

  //# số điện thoại liên hệ (dùng khi cần tư vấn báo giá)
  @Column({ type: "varchar", length: 50, nullable: true })
  contactPhone!: string | null;

  //# mô tả công việc hoặc yêu cầu đặc biệt chung (dùng khi cần tư vấn báo giá)
  @Column({ type: "text", nullable: true })
  description!: string | null;

  //# trạng thái đơn hàng (đang xử lý, đã hoàn thành, đã hủy, v.v.) - có thể thêm sau khi có yêu cầu cụ thể về workflow
  @Column({ type: "enum", enum: ServiceOrderStatusEnum, default: ServiceOrderStatusEnum.WAITING_FOR_QUOTE })
  status!: ServiceOrderStatusEnum;

  //# số sao đánh giá từ khách hàng
  @Column({ type: "int", nullable: true })
  rating!: number | null;

  //============================= Thông tin báo giá ========================//
  //$ Giá gốc trước chiết khấu/phụ
  @Column(BaseNullableNumericColumnOptions)
  basePrice!: number | null;

  //$ Đặt gấp dưới 2 tiếng → tính phụ
  @Column({ type: "boolean", default: false })
  isUrgent!: boolean;

  //$ có đồ dễ vỡ không
  @Column({ type: "boolean", default: false })
  hasFragileItems!: boolean;

  //$ phiếu giảm giá đã dùng cho đơn hàng (nếu có)
  // Lưu ý: KHÔNG dùng @OneToOne — voucher chỉ bị "khóa" khi nhân viên confirm
  // (status -> CONFIRMED), nên một voucher có thể được tham chiếu bởi nhiều
  // service order (vd: khách tạo đơn A, huỷ, tạo lại đơn B cùng voucher trước
  // khi đơn nào được confirm). Khoá thật sự nằm ở `vouchers.isUsed=true`
  // (xem AdminServiceOrderService.confirm() với pessimistic_write lock).
  @Column({ type: "uuid", nullable: true })
  vouchersId!: string | null;
  @ManyToOne(() => Vouchers)
  @JoinColumn({ name: "vouchersId" })
  vouchers!: Vouchers | null;

  //? báo giá tham khảo cho khách hàng (nếu có)
  @Column({ type: "json", nullable: true })
  quote!: IQuoteItem[] | null;

  //$ tổng tiền hợp đồng trước vat (= tổng các mục báo giá tăng - tổng các mục báo giá giảm)
  @Column(BaseNullableNumericColumnOptions)
  preVatAmount!: number | null;

  //? có lấy VAT không
  @Column({ type: "boolean", default: false })
  hasVat!: boolean;

  //? vat
  @Column(BaseNullableNumericColumnOptions)
  vat!: number | null;

  //$ vat amount
  @Column(BaseNullableNumericColumnOptions)
  vatAmount!: number | null;

  //$ tổng tiền cuối cùng
  @Column(BaseNullableNumericColumnOptions)
  amount!: number | null;

  //============================= DỊCH VỤ 1: BỐC XẾP THEO CA ========================//
  //? (Áp dụng cho ServiceOrderTypeEnum.BOC_XEP_THEO_CA)

  //? yêu cầu đặc biệt (nhân viên thuần ngành nghề nào đó)
  @Column({ type: "text", nullable: true })
  specialRequirements!: string | null;

  //? yêu cầu nhân viên thuần ngành nghề cụ thể (điện tử, nội thất, hàng lạnh, cây cảnh, ...) sẽ lấy từ bảng attribute để dễ dàng thêm sửa sau này
  @Column({ type: "varchar", length: 255, nullable: true })
  employeeSpecialization!: string | null;

  //============================= DỊCH VỤ 1 & 5: SỐ LƯỢNG NHÂN VIÊN ========================//

  //? số lượng nhân viên yêu cầu (dùng cho dịch vụ 1 và 5)
  @Column({ type: "int", nullable: true })
  employeeCount!: number | null;

  //============================= DỊCH VỤ 2: CHUYỂN NHÀ / VĂN PHÒNG ========================//
  //? (Áp dụng cho ServiceOrderTypeEnum.CHUYEN_NHA_VAN_PHONG)

  //? vị trí tầng vân chuyển lấy hàng (tầng trệt, tầng 1, tầng 2, ...)
  @Column({ type: "int", nullable: true })
  floorLocationPickup!: number | null;

  //? có thang máy hay không
  @Column({ type: "boolean", nullable: true })
  hasElevatorPickup!: boolean | null;

  //? vị trí tầng vận chuyển giao hàng (tầng trệt, tầng 1, tầng 2, ...)
  @Column({ type: "int", nullable: true })
  floorLocationDelivery!: number | null;

  //? có thang máy hay không
  @Column({ type: "boolean", nullable: true })
  hasElevatorDelivery!: boolean | null;

  //? yêu cầu bọc lót đồ
  @Column({ type: "boolean", nullable: true })
  needsWrapping!: boolean | null;

  //? yêu cầu tháo lắp đồ cồng kềnh
  @Column({ type: "boolean", nullable: true })
  needsDismantle!: boolean | null;

  //? loại xe vận chuyển (cắt nóc / thùng bạt / ba gác, ...) sẽ lấy từ bảng attribute để dễ dàng thêm sửa sau này
  @Column({ type: "varchar", nullable: true })
  movingVehicleType!: string | null;

  //? tải trọng xe (tấn) sẽ lấy từ bảng attribute để dễ dàng thêm sửa sau này
  @Column({ type: "varchar", nullable: true })
  vehicleTonnage!: string | null;

  //? số chuyến vận chuyển ước tính (dùng để tính chi phí vận chuyển nếu có)
  @Column({ type: "int", nullable: true })
  tripCount!: number | null;

  //? có vệ sinh sau chuyển không
  @Column({ type: "boolean", nullable: true })
  needsCleaning!: boolean | null;

  //? danh sách đồ đạc cần tháo lắp và khối lượng
  @Column({ type: "jsonb", nullable: true })
  itemsDetail!: IItemDetail[] | null;

  //============================= DỊCH VỤ 2 & 4 & 6 ========================//
  //? địa chỉ điểm lấy hàng / xuất phát
  @Column({ type: "jsonb", nullable: true })
  pickupAddress!: IAddress | null;

  //? khoảng cách từ xe tới điểm lấy hàng (m)
  @Column({ type: "float", nullable: true })
  distanceToPickup!: number | null;

  //? địa chỉ điểm giao hàng / đến
  @Column({ type: "jsonb", nullable: true })
  deliveryAddress!: IAddress | null;

  //? khoảng cách từ xe tới điểm giao hàng (m)
  @Column({ type: "float", nullable: true })
  distanceToDelivery!: number | null;

  //============================= DỊCH VỤ 3: PHÁ DỠ HOÀN TRẢ MẶT BẰNG ========================//
  //? (Áp dụng cho ServiceOrderTypeEnum.PHA_DO_HOAN_TRA)
  //? Loại mặt bằng: văn phòng, nhà xưởng, cửa hàng, ... sẽ lấy từ bảng attribute để dễ dàng thêm sửa sau này
  @Column({ type: "varchar", length: 255, nullable: true })
  siteType!: string | null;

  //? diện tích mặt bằng (m2)
  @Column({ type: "float", nullable: true })
  siteArea!: number | null;

  //============================= DỊCH VỤ 4: VẬN CHUYỂN VẬT TƯ ========================//
  //? (Áp dụng cho ServiceOrderTypeEnum.VAN_CHUYEN_VAT_TU)

  //? Loại vật tư / hàng hóa
  @Column({ type: "jsonb", nullable: true })
  materialsDetail!: IItemDetail[] | null;

  //============================= DỊCH VỤ 5: NÂNG HẠ CONT HÀNG ========================//
  //? (Áp dụng cho ServiceOrderTypeEnum.NANG_HA_CONT)

  //? số lượng cont cần nâng hạ
  @Column({ type: "int", nullable: true })
  containerCount!: number | null;

  //? số lượng thùng / kiện / palet
  @Column({ type: "int", nullable: true })
  cargoUnitCount!: number | null;

  //? đơn vị hàng trong cont (thùng / kiện / palet / tấn) sẽ lấy từ bảng attribute để dễ dàng thêm sửa sau này
  @Column({ type: "varchar", nullable: true })
  containerUnit!: string | null;

  //? khối lượng hàng (tấn)
  @Column(BaseNullableNumericColumnOptions)
  containerWeight!: number | null;

  //? hình thức: cont trung chuyển hay hạ tại kho
  @Column({ type: "varchar", nullable: true })
  containerLocationType!: string | null;

  //? khoảng cách từ cont đến điểm tập kết hàng (m)
  @Column({ type: "float", nullable: true })
  distanceToStorage!: number | null;

  //? yêu cầu đặc biệt khi nâng hạ cont (nâng hạ hàng lạnh, hàng dễ vỡ, cây cảnh, ...) sẽ lấy từ bảng attribute để dễ dàng thêm sửa sau này
  @Column({ type: "text", nullable: true })
  contSpecialRequirements!: string | null;

  //? cần xe nâng không
  @Column({ type: "boolean", nullable: true })
  needsForklift!: boolean | null;

  //? số lượng xe nâng cần thuê
  @Column({ type: "int", nullable: true })
  forkliftCount!: number | null;

  //? cần xe cẩu không
  @Column({ type: "boolean", nullable: true })
  needsCrane!: boolean | null;

  //? số lượng xe cẩu cần thuê
  @Column({ type: "int", nullable: true })
  craneCount!: number | null;

  // ============================= DỊCH VỤ 6: DỊCH VỤ VẬN TẢI ========================//
  //? (Áp dụng cho ServiceOrderTypeEnum.DICH_VU_VAN_TAI)
  //? loại xe vận tải (xe tải nhỏ, xe tải lớn, xe container, ...) sẽ lấy từ bảng attribute để dễ dàng thêm sửa sau này
  @Column({ type: "varchar", length: 255, nullable: true })
  carType!: string | null;

  //============================= DỊCH VỤ 7: Xe nâng , xe cẩu ========================//
  // ? (Áp dụng cho ServiceOrderTypeEnum.XE_NANG_XE_CAU, ServiceOrderTypeEnum.DICH_VU_VAN_TAI, BOC_XEP_THEO_CA)
  //# Áp dụng chung cho tất cả các dịch vụ báo giá sẵn
  @Column({ type: "jsonb", nullable: true })
  servicePrices!: IServicePrice[] | null;

  @OneToOne(() => Order, (order) => order.serviceOrder, { onDelete: "CASCADE" })
  order!: Order | null;

  @OneToMany(() => Ticket, (ticket) => ticket.serviceOrder, { onDelete: "CASCADE" })
  tickets?: Ticket[];
}
