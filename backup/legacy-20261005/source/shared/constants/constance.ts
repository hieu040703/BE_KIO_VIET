export enum StatusEnum {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum UserRoleEnum {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SUPPORT = "SUPPORT",
  EMPLOYEE = "EMPLOYEE",
  USER = "USER",
}

export enum AuthSessionTypeEnum {
  WEB = "web",
  MOBILE = "mobile",
}

export enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum FileStatusEnum {
  PENDING = "pending",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum FileTypeEnum {
  PICTURE = "PICTURE",
  VIDEO = "VIDEO",
  FILE = "FILE",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER",
}

export enum PaymentMethodEnum {
  CASH = "CASH",
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum PartnerTypeEnum {
  CUSTOMER = "CUSTOMER",
  SUPPLIER = "SUPPLIER",
}

export enum FinanceTypeEnum {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  SALARY = "SALARY",
  ADVANCE_SALARY = "ADVANCE_SALARY", // tạm ứng lương
  ADVANCE_EMPLOYEE = "ADVANCE_EMPLOYEE", // tạm ứng nhân viên
  SETTLEMENT = "SETTLEMENT", // quyết toán
  REIMBURSE = "REIMBURSE", // hoàn ứng
  MARGIN = "MARGIN", // ký quỹ (FE dùng cho phiếu chi ký quỹ — xem migration 1777100000000)
}

export enum TransactionTypeEnum {
  IN = "IN",
  OUT = "OUT",
}

export enum DebtTypeEnum {
  RECEIVABLE = "RECEIVABLE", // công nợ phải thu
  PAYABLE = "PAYABLE", // công nợ phải trả
}

export enum NotificationTypeEnum {
  SYSTEM = "SYSTEM",
  USER = "USER",
  ALERT = "ALERT",
  INFO = "INFO",
  REMINDER = "REMINDER",
  CHAT = "CHAT",
  MENTION = "MENTION",
  CALL = "CALL",
}

export enum TripTypeEnum {
  FARE_WELL = "FARE_WELL", // tiễn khách
  PICK_UP = "PICK_UP", // đón khách
}

export enum TripStatusEnum {
  PENDING = "PENDING", // chờ tài xế nhận chuyến
  PURCHASED = "PURCHASED", // đã thanh toán
  CANCELLED = "CANCELLED", // hủy chuyến
}

export enum DepositStatusEnum {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum StationTypeEnum {
  INTERNAL = "INTERNAL",
  INTERNATIONAL = "INTERNATIONAL",
}

export const SettingDefault = {
  region: {
    country: "Vietnam",
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
  },
  dateFormat: {
    date: "DD/MM/YYYY",
    time: "HH:mm:ss",
    displayTime: "24h",
  },
  numberFormat: {
    decimal: ".",
    thousand: ",",
    fraction: "2",
  },
  currencyFormat: {
    symbol: "₫",
    fraction: "0",
    position: "after",
  },
};

export type CodeType =
  | "User"
  | "Branch"
  | "Contract"
  | "Customer"
  | "Employee"
  | "Order"
  | "ServiceOrder"
  | "Transaction"
  | "Finance"
  | "Income"
  | "Expense"
  | "AdvanceSalary"
  | "AdvanceEmployee"
  | "Margin"
  | "Debt"
  | "FundTransaction";

export const randomImage = "https://picsum.photos/100/100?random=";

export type AttributeType =
  | "UNIT"
  | "CATEGORY"
  | "FINANCE"
  | "ADVANCE_SALARY"
  | "ADVANCE_EMPLOYEE"
  | "POSITION"
  | "REFERRAL_BONUS";

export enum AttributeTypeEnum {
  UNIT = "UNIT",
  CATEGORY = "CATEGORY",
  FINANCE = "FINANCE",
  // mục tạm ứng lương
  ADVANCE_SALARY = "ADVANCE_SALARY",
  // mục tạm ứng nhân viên
  ADVANCE_EMPLOYEE = "ADVANCE_EMPLOYEE",
  // vị trí công việc
  POSITION = "POSITION",
  // loại hình thưởng phạt (thưởng giới thiệu, thưởng KPI, phạt vi phạm...)
  REFERRAL_BONUS = "REFERRAL_BONUS",
  // Chuyên môn yêu cầu
  SPECIAL_REQUIREMENT = "SPECIAL_REQUIREMENT",
  // Loại xe
  VEHICLE_TYPE = "VEHICLE_TYPE",
  // Tải trọng
  VEHICLE_TONNAGE = "VEHICLE_TONNAGE",
  // Loại mặt bằng (văn phòng, nhà xưởng, cửa hàng, ...)
  SITE_TYPE = "SITE_TYPE",
  // Đơn vị hàng hóa (thùng, kiện, bộ, ...)
  CARGO_UNIT = "CARGO_UNIT",
  // Yêu cầu đặc biệt khi nâng hạ cont (nâng hạ hàng lạnh, hàng dễ vỡ, cây cảnh, ...)
  CONT_SPECIAL_REQUIREMENT = "CONT_SPECIAL_REQUIREMENT",
  // Loại xe tải
  TRUCK_TYPE = "TRUCK_TYPE",
  // Loại container
  CONTAINER_TYPE = "CONTAINER_TYPE",
  // Loại tài liệu cần mang theo
  DOCUMENT_REQUIREMENT = "DOCUMENT_REQUIREMENT",
  // employee expertise
  EMPLOYEE_EXPERTISE = "EMPLOYEE_EXPERTISE",
}

export enum ReferralTypeEnum {
  BONUS = "BONUS", // thưởng
  PENALTY = "PENALTY", // phạt
}

export enum BranchManagerConfirmStatusEnum {
  // chwof xác nhận
  PENDING = "PENDING",
  // nhận đơn
  CONFIRMED = "CONFIRMED",
  // từ chối nhận đơn
  REJECTED = "REJECTED",
}

export enum OrderStatusEnum {
  // đơn hàng mới tạo, chờ xử lý
  PENDING = "PENDING",
  // đơn hàng đang được thực hiện
  PROCESSING = "PROCESSING",
  // nhân viên xác nhận hoàn thành
  COMPLETED = "COMPLETED",
  // đơn hàng bị hủy
  CANCELED = "CANCELED",
}

export enum OrderEmployeeStatusEnum {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
}

export enum ServiceOrderStatusEnum {
  // đơn hàng chờ khách hàng xác nhận để gửi cho nhân nhân viên xác nhận
  WAITING_FOR_CUSTOMER_CONFIRMATION = "WAITING_FOR_CUSTOMER_CONFIRMATION",
  // chờ báo giá từ nhân viên hoặc tư vấn viên
  WAITING_FOR_QUOTE = "WAITING_FOR_QUOTE",
  // khách hàng đã đồng ý báo giá, chờ xác nhận từ nhân viên
  WAITING_FOR_EMPLOYEE_CONFIRMATION = "WAITING_FOR_EMPLOYEE_CONFIRMATION",
  // đã xác nhận từ nhân viên, chờ ngày thực hiện hoặc đang thực hiện
  CONFIRMED = "CONFIRMED",
  // đơn hàng đang được thực hiện
  PROCESSING = "PROCESSING",
  // nhân viên xác nhận hoàn thành
  COMPLETED_BY_EMPLOYEE = "COMPLETED_BY_EMPLOYEE",
  // khách hàng xác nhận hoàn thành
  COMPLETED_BY_CUSTOMER = "COMPLETED_BY_CUSTOMER",
  // đơn hàng bị hủy
  CANCELED = "CANCELED",
}

export enum ServiceOrderChatMessageTypeEnum {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  SYSTEM = "SYSTEM",
}

// hình thức thanh toán
export enum PaymentMethodShopEnum {
  PREPAID = "PREPAID", // trả trước
  POSTPAID = "POSTPAID", // trả sau
}

export enum EmployeeStatusType {
  // đang làm việc
  ACTIVE = "active",
  // nghỉ việc
  INACTIVE = "inactive",
  // nghỉ phép
  ON_LEAVE = "on_leave",
}

export const BIN_BANK = {
  MBBANK: "970422",
  VIETCOMBANK: "970436",
  VIETTINBANK: "970415",
  BIDV: "970418",
  AGRIBANK: "970405",
  TECHCOMBANK: "970407",
  ACB: "970416",
  VPBANK: "970432",
  TPBANK: "970423",
  SACOMBANK: "970403",
};

export enum EntityTypeEnum {
  AUTH = "auth",
  USER = "user",
  PARTNER = "partner",
  TRANSACTION = "transaction",
  CATEGORY = "category",
  CATEGORY_GROUP = "categoryGroup",
  FUND = "fund",
  LOCATION = "location",
  REPORT = "report",
  SETTINGS = "settings",
  NOTIFICATION = "notification",
  TENANT = "tenant",
  EMPLOYEE = "employee",
  ROLE = "role",
  PERMISSION = "permission",
  PRODUCT = "product",
  PRODUCT_ATTRIBUTE = "productAttribute",
  PRODUCT_ATTRIBUTE_VALUE = "productAttributeValue",
  PRODUCT_VARIANT = "productVariant",
  PRODUCT_OPTION = "productOption",
  PRODUCT_UNIT = "productUnit",
  OPENING_STOCK = "openingStock",
  INVENTORY_TRANSACTION = "inventoryTransaction",
  INVENTORY = "inventory",
  ATTRIBUTE = "attribute",
  CUSTOMER = "customer",
  SUPPLIER = "supplier",
  SHIPPER = "shipper",
  MANUFACTURER = "manufacturer",
  DISTRIBUTOR = "distributor",
  STORE = "store",
  ORDER_COMMENT = "orderComment",
  ORDER_LEADER_CHAT = "orderLeaderChat",
  ORDER = "order",
  FINANCE = "finance",
  ADVANCE_SALARY = "advanceSalary",
  ADVANCE_EMPLOYEE = "advanceEmployee",
  DEBT = "debt",
  MARGIN = "margin",
  INVOICE = "invoice",
  TIME_KEEPING = "timeKeeping",
  SERVICE = "service",
  SERVICE_ORDER = "serviceOrder",
  RAG = "rag",
  GOOGLE_MAP = "googleMap",
  TICKET = "ticket",
  TICKET_REPLY = "ticketReply",
  SUPPORT_ROOM = "supportRoom",
  EMPLOYEE_TICKET = "employeeTicket",
}

export enum FileCategoryEnum {
  AVATAR = "avatar",
  RECEIPT = "receipt",
  ATTACHMENT = "attachment",
  DOCUMENT = "document",
  LOGO = "logo",
  IMAGE = "image",
  VIDEO = "video",
  ALBUM = "album",
  MEDIA = "media",
}

export enum AdsEnum {
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  YOUTUBE = "YOUTUBE",
  INSTAGRAM = "INSTAGRAM",
  TIKTOK = "TIKTOK",
  ZALO = "ZALO",
  OTHER = "OTHER",
}

export enum OtherAmountTypeEnum {
  BONUS = "BONUS", // thưởng
  PENALTY = "PENALTY", // phạt
  MARGIN = "MARGIN", // ký quỹ
  ADVANCE_SALARY = "ADVANCE_SALARY", // tạm ứng
  UNIFORM = "UNIFORM", // đồng phục
  REFERRER_ORDER = "REFERRER_ORDER", // thưởng giới thiệu đơn hàng
  CREATE_ORDER = "CREATE_ORDER", // thưởng tạo đơn  hàng
  ALLOCATED_REVENUE_ORDER = "ALLOCATED_REVENUE_ORDER", // phân bổ doanh thu đơn hàng
}

export enum TimeKeepingTypeEnum {
  IN = "IN", // vào
  OUT = "OUT", // ra
}

// gồm hóa đơn mua hàng và hóa đơn bán hàng
export enum InvoiceTypeEnum {
  PURCHASE = "PURCHASE", // hóa đơn mua hàng
  SALES = "SALES", // hóa đơn bán hàng
}

export enum MarginStatusEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum MarginTypeEnum {
  MARGIN = "MARGIN",
  UNIFORM = "UNIFORM",
}

export enum ExpenseApprovalStatusEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum PositionDefaultEnum {
  LEADER = "Quản lý nhân viên",
  ACCOUNTANT = "Kế toán",
  SALE = "Sale khảo sát báo giá",
  HR = "Tuyển dụng",
  BRANCH_MANAGER = "Quản lý chi nhánh",
  WAREHOUSE_MANAGER = "Quản lý kho",
  DRIVER = "Tài xế",
  COLLABORATORS = "Cộng tác viên",
}

// Loại dịch vụ đơn hàng
export enum ServiceOrderTypeEnum {
  BOC_XEP_THEO_CA = "BOC_XEP_THEO_CA", // 1. Thuê bốc xếp theo ca
  CHUYEN_NHA_VAN_PHONG = "CHUYEN_NHA_VAN_PHONG", // 2. Chuyển nhà + văn phòng trọn gói
  PHA_DO_HOAN_TRA = "PHA_DO_HOAN_TRA", // 3. Phá dỡ hoàn trả mặt bằng
  VAN_CHUYEN_VAT_TU = "VAN_CHUYEN_VAT_TU", // 4. Vận chuyển vật tư
  NANG_HA_CONT = "NANG_HA_CONT", // 5. Nâng hạ cont hàng
  DICH_VU_VAN_TAI = "DICH_VU_VAN_TAI", // 6. Dịch vụ vận tải
  XE_NANG_XE_CAU = "XE_NANG_XE_CAU", // 7. Xe nâng, xe cẩu
}

// Tài liệu cần mang theo (hợp đồng hoặc biên bản nghiệm thu)
export enum DocumentRequirementEnum {
  HOP_DONG = "HOP_DONG", // hợp đồng
  BB_NGHIEM_THU = "BB_NGHIEM_THU", // biên bản nghiệm thu
  BOTH = "BOTH", // cả hai
}

// Loại xe chuyển đồ (dịch vụ chuyển nhà/VP)
export enum MovingVehicleTypeEnum {
  CAT_NOC = "CAT_NOC", // xe cắt nóc
  THUNG_BAT = "THUNG_BAT", // xe thùng bạt
}

// Đơn vị hàng trong cont (dịch vụ nâng hạ cont)
export enum ContainerUnitEnum {
  THUNG = "THUNG", // thùng
  KIEN = "KIEN", // kiện
  PALET = "PALET", // palet
  TAN = "TAN", // tấn
}

// Vị trí hạ cont (dịch vụ nâng hạ cont)
export enum ContainerLocationTypeEnum {
  TRUNG_CHUYEN = "TRUNG_CHUYEN", // cont trung chuyển
  HA_TAI_KHO = "HA_TAI_KHO", // hạ tại kho
}

export enum TicketTypeEnum {
  // nhân sự đến trễ
  LATE_ARRIVAL = "LATE_ARRIVAL",
  // thiếu nhân lực
  STAFF_SHORTAGE = "STAFF_SHORTAGE",
  // hư hỏng tài sản
  ASSET_DAMAGE = "ASSET_DAMAGE",
  // thái độ phục vụ
  SERVICE_ATTITUDE = "SERVICE_ATTITUDE",
  // yêu cầu khác
  OTHER = "OTHER",
}

export enum TicketStatusEnum {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum TicketReplyTypeEnum {
  ADMIN = "ADMIN",
  SUPPORT = "SUPPORT",
  CUSTOMER = "CUSTOMER",
  SYSTEM = "SYSTEM",
}

export enum EmployeeTicketTypeEnum {
  PAYROLL_BENEFITS = "PAYROLL_BENEFITS",
  ATTENDANCE_LEAVE = "ATTENDANCE_LEAVE",
  CONTRACT_PROFILE = "CONTRACT_PROFILE",
  WORK_ASSIGNMENT = "WORK_ASSIGNMENT",
  EQUIPMENT_IT = "EQUIPMENT_IT",
  OPERATION_INCIDENT = "OPERATION_INCIDENT",
  FEEDBACK_REQUEST = "FEEDBACK_REQUEST",
  OTHER = "OTHER",
}

export enum EmployeeTicketStatusEnum {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum EmployeeTicketReplyTypeEnum {
  ADMIN = "ADMIN",
  AUTHORIZED_USER = "AUTHORIZED_USER",
  EMPLOYEE = "EMPLOYEE",
  SYSTEM = "SYSTEM",
}

export enum RewardPointTypeEnum {
  EARNED = "EARNED", // điểm tích lũy
  REDEEMED = "REDEEMED", // điểm đã sử dụng
}

export enum VouchersTemplateStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum CustomerTypeEnum {
  // cá nhân
  INDIVIDUAL = "INDIVIDUAL",
  // doanh nghiệp
  BUSINESS = "BUSINESS",
}

export enum AnnouncementStatusEnum {
  DRAFT = "DRAFT",
  SENT = "SENT",
}

export enum CallHistoryTypeEnum {
  ATA = "ATA", // cuộc gọi nội bộ app-to-app
  PTP = "PTP", // cuộc gọi giữa app và số điện thoại
}

export enum OrderFeeCategoryCodeEnum {
  // phí đặt gấp
  URGENT = "URGENT",
  // phí hàng dễ vỡ
  FRAGILE_ITEM = "FRAGILE_ITEM",
  // giảm giá voucher
  VOUCHER_DISCOUNT = "VOUCHER_DISCOUNT",
  // giảm giá điểm tích lũy
  POINTS_DISCOUNT = "POINTS_DISCOUNT",
  // phí cao tốc
  EXPRESS_FEE = "EXPRESS_FEE",
}
