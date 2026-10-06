import { Router } from "express";
import { container } from "@/modules/container";
import { authenticate } from "../shared/middleware/auth.middleware";
import { adminMiddleware } from "../shared/middleware/admin.middleware";
import { UploadGlobalMiddleware } from "../shared/middleware/uploadGlobal.middleware";

import { USER_TYPES } from "../modules/user/user.types";
import { EXCELS_TYPES } from "../modules/excels/excels.type";
import { COMMON_TYPES } from "../modules/common/common.types";
import { ATTRIBUTE_TYPES } from "../modules/attribute/attribute.types";
import { PERMISSION_GROUP_TYPES } from "../modules/permissionGroup/permissionGroup.types";
import { AUTH_TYPES } from "@/modules/auth/auth.types";
import { FILE_TYPES } from "../modules/file";
import { NOTIFICATION_TYPES } from "../modules/notification/notification.types";

import { BRANCH_TYPES } from "../modules/branch/branch.types";
import { CUSTOMER_TYPES } from "../modules/customer/customer.types";
import { EMPLOYEE_TYPES } from "../modules/employee/employee.types";
import { ORDER_TYPES } from "../modules/order/order.types";
import { TIME_KEEPING_TYPES } from "../modules/timeKeeping/timeKeeping.types";
import { ACCOUNTANT_TYPES } from "../modules/accountant/accountant.types";
import { FUND_TYPES } from "../modules/fund/fund.types";
import { INVOICE_TYPES } from "../modules/invoice/invoice.types";
import { SERVICE_TYPES } from "../modules/service/service.types";
import { SERVICE_ORDER_TYPES } from "../modules/serviceOrder/serviceOrder.types";
import { ANNOUNCEMENT_TYPES } from "../modules/announcement/announcement.types";
import { CALL_HISTORY_TYPES } from "../modules/callHistory/callHistory.types";
import { ZALO_TYPES } from "../modules/zalo/zalo.types";
import { ZALO_MESSAGE_HISTORY_TYPES } from "../modules/zalo/zaloMessageHistory/zaloMessageHistory.types";
import { ZALO_TEMPLATE_TYPES } from "../modules/zalo/zaloTemplate/zaloTemplate.types";

import { ExcelRouter } from "../modules/excels/excels.route";
import { AdminUserRouter } from "../modules/user/admin.user.route";
import { FirebaseRouter } from "../shared/utils/firebase/firebase.route";
import { AdminAttributeRouter } from "../modules/attribute/admin.attribute.route";
import { PermissionGroupRouter } from "../modules/permissionGroup/permissionGroup.route";
import { AuthRouter } from "@/modules/auth/auth.route";
import { FileRouter } from "../modules/file";
import { CommonRouter } from "../modules/common/common.route";
import { NotificationRouter } from "../modules/notification/notification.route";

import { BranchRouter } from "../modules/branch/branch.route";
import { CustomerRouter } from "../modules/customer/customer.route";
import { EmployeeRouter } from "../modules/employee/employee.route";
import { OrderRouter } from "../modules/order/order.route";
import { TimeKeepingRouter } from "../modules/timeKeeping/timeKeeping.route";
import { AccountantRouter } from "../modules/accountant/accountant.route";
import { FundRouter } from "@/modules/fund/fund.route";
import { InvoiceRouter } from "../modules/invoice/invoice.route";
import { AdminServiceRouter } from "../modules/service/admin.service.route";
import { AdminServiceOrderRouter } from "../modules/serviceOrder/admin.serviceOrder.route";
import { AnnouncementRouter } from "../modules/announcement/announcement.route";
import { AdminCallHistoryRouter } from "../modules/callHistory/admin.callHistory.route";
import { RagRouter } from "../modules/rag/rag.route";
import { RAG_TYPES } from "../modules/rag/rag.types";
import { GOOGLE_MAP_TYPES } from "../modules/googleMap/googleMap.types";
import { GoogleMapRouter } from "../modules/googleMap/googleMap.route";
import { GOONG_MAP_TYPES } from "../modules/goongMap/goongMap.types";
import { AdminGoongMapRouter } from "../modules/goongMap/admin.goongMap.route";
import { TICKET_TYPES } from "../modules/ticket/ticket.types";
import { AdminTicketRouter } from "../modules/ticket/admin.ticket.route";
import { SUPPORT_ROOM_TYPES } from "../modules/supportRoom/supportRoom.types";
import { VOUCHERS_TEMPLATE_TYPES } from "../modules/vouchersTemplate/vouchersTemplate.types";
import { VOUCHERS_TYPES } from "../modules/vouchers/vouchers.types";
import { AdminSupportRoomRouter } from "../modules/supportRoom/admin.supportRoom.route";
import { AdminVouchersTemplateRouter } from "../modules/vouchersTemplate/admin.vouchersTemplate.route";
import { AdminVouchersRouter } from "../modules/vouchers/admin.vouchers.route";
import { APP_SETTING_TYPES } from "@/modules/appSetting/appSetting.types";
import { AppSettingRouter } from "@/modules/appSetting/appSetting.route";
import { ALLOCATE_REVENUE_TYPES } from "@/modules/allocateRevenue/allocateRevenue.types";
import { AllocateRevenueRouter } from "@/modules/allocateRevenue/allocateRevenue.route";
import { CUSTOMER_CARE_TYPES } from "@/modules/customerCare/customerCare.types";
import { AdminCustomerCareRouter } from "@/modules/customerCare/admin.customerCare.route";
import { EMPLOYEE_TICKET_TYPES } from "@/modules/employeeTicket/employeeTicket.types";
import { EmployeeTicketRouter } from "@/modules/employeeTicket/employeeTicket.route";
import { ZaloRouter } from "@/modules/zalo/zalo.route";
import { AdminZaloMessageHistoryRouter } from "../modules/zalo/zaloMessageHistory/zaloMessageHistory.route";
import { AdminZaloTemplateRouter } from "../modules/zalo/zaloTemplate/zaloTemplate.route";

const router = Router();

const adminUserRouter = container.get<AdminUserRouter>(USER_TYPES.AdminUserRouter);
const permissionGroupRouter = container.get<PermissionGroupRouter>(PERMISSION_GROUP_TYPES.PermissionGroupRouter);
const firebaseRouter = container.get<FirebaseRouter>(COMMON_TYPES.FirebaseRouter);
const attributeRouter = container.get<AdminAttributeRouter>(ATTRIBUTE_TYPES.AdminAttributeRouter);
const excelRouter = container.get<ExcelRouter>(EXCELS_TYPES.ExcelRouter);
const authRouter = container.get<AuthRouter>(AUTH_TYPES.AuthRouter);
const fileRouter = container.get<FileRouter>(FILE_TYPES.FileRouter);
const commonRouter = container.get<CommonRouter>(COMMON_TYPES.CommonRouter);
const notificationRouter = container.get<NotificationRouter>(NOTIFICATION_TYPES.NotificationRouter);

const branchRouter = container.get<BranchRouter>(BRANCH_TYPES.BranchRouter);
const customerRouter = container.get<CustomerRouter>(CUSTOMER_TYPES.CustomerRouter);
const employeeRouter = container.get<EmployeeRouter>(EMPLOYEE_TYPES.EmployeeRouter);
const orderRouter = container.get<OrderRouter>(ORDER_TYPES.OrderRouter);
const timeKeepingRouter = container.get<TimeKeepingRouter>(TIME_KEEPING_TYPES.TimeKeepingRouter);
const accountantRouter = container.get<AccountantRouter>(ACCOUNTANT_TYPES.AccountantRouter);
const fundRouter = container.get<FundRouter>(FUND_TYPES.FundRouter);
const invoiceRouter = container.get<InvoiceRouter>(INVOICE_TYPES.InvoiceRouter);
const adminServiceRouter = container.get<AdminServiceRouter>(SERVICE_TYPES.AdminServiceRouter);
const adminServiceOrderRouter = container.get<AdminServiceOrderRouter>(SERVICE_ORDER_TYPES.AdminServiceOrderRouter);
const announcementRouter = container.get<AnnouncementRouter>(ANNOUNCEMENT_TYPES.AnnouncementRouter);
const adminCallHistoryRouter = container.get<AdminCallHistoryRouter>(CALL_HISTORY_TYPES.AdminCallHistoryRouter);
const ragRouter = container.get<RagRouter>(RAG_TYPES.RagRouter);
const googleMapRouter = container.get<GoogleMapRouter>(GOOGLE_MAP_TYPES.GoogleMapRouter);
const adminGoongMapRouter = container.get<AdminGoongMapRouter>(GOONG_MAP_TYPES.AdminGoongMapRouter);
const adminTicketRouter = container.get<AdminTicketRouter>(TICKET_TYPES.AdminTicketRouter);
const adminSupportRoomRouter = container.get<AdminSupportRoomRouter>(SUPPORT_ROOM_TYPES.AdminSupportRoomRouter);
const adminVouchersTemplateRouter = container.get<AdminVouchersTemplateRouter>(
  VOUCHERS_TEMPLATE_TYPES.AdminVouchersTemplateRouter,
);
const adminVouchersRouter = container.get<AdminVouchersRouter>(VOUCHERS_TYPES.AdminVouchersRouter);
const appSettingRouter = container.get<AppSettingRouter>(APP_SETTING_TYPES.AppSettingRouter);
const allocateRevenueRouter = container.get<AllocateRevenueRouter>(ALLOCATE_REVENUE_TYPES.AllocateRevenueRouter);
const adminCustomerCareRouter = container.get<AdminCustomerCareRouter>(CUSTOMER_CARE_TYPES.AdminCustomerCareRouter);
const employeeTicketRouter = container.get<EmployeeTicketRouter>(EMPLOYEE_TICKET_TYPES.EmployeeTicketRouter);
const zaloRouter = container.get<ZaloRouter>(ZALO_TYPES.ZaloRouter);
const adminZaloMessageHistoryRouter = container.get<AdminZaloMessageHistoryRouter>(
  ZALO_MESSAGE_HISTORY_TYPES.AdminZaloMessageHistoryRouter,
);
const adminZaloTemplateRouter = container.get<AdminZaloTemplateRouter>(
  ZALO_TEMPLATE_TYPES.AdminZaloTemplateRouter,
);

router.post("/uploads", UploadGlobalMiddleware.uploadFiles(), (req, res) => {
  res.status(200).json(res.locals.uploadedUrls);
});
router.use("/auth", authRouter.getRouter());
// Sepay webhook trong FundRouter là public; các route funds còn lại tự bảo vệ bằng authenticate + adminMiddleware.
router.use("/funds", fundRouter.getRouter());

router.use(authenticate); // Apply authentication middleware to all routes below
router.use(adminMiddleware); // Chỉ ADMIN/MANAGER được truy cập admin routes

router.use("/firebase", firebaseRouter.getRouter()); // Firebase routes
router.use("/files", fileRouter.getRouter());
router.use("/commons", commonRouter.getRouter());
router.use("/notifications", notificationRouter.getRouter());
router.use("/users", adminUserRouter.getRouter());
router.use("/permission-groups", permissionGroupRouter.getRouter());
router.use("/attributes", attributeRouter.getRouter());
router.use("/excels", excelRouter.getRouter());
router.use("/branches", branchRouter.getRouter());
router.use("/customers", customerRouter.getRouter());
router.use("/customer-services", adminCustomerCareRouter.getRouter());
router.use("/employees", employeeRouter.getRouter());
router.use("/orders", orderRouter.getRouter());
router.use("/time-keepings", timeKeepingRouter.getRouter());
router.use("/accountants", accountantRouter.getRouter());
router.use("/invoices", invoiceRouter.getRouter());
router.use("/services", adminServiceRouter.getRouter());
router.use("/service-orders", adminServiceOrderRouter.getRouter());
router.use("/announcements", announcementRouter.getRouter());
router.use("/call-histories", adminCallHistoryRouter.getRouter());
router.use("/rag", ragRouter.getRouter());
router.use("/google-maps", googleMapRouter.getRouter());
router.use("/goong-maps", adminGoongMapRouter.getRouter());
router.use("/tickets", adminTicketRouter.getRouter());
router.use("/support-rooms", adminSupportRoomRouter.getRouter());
router.use("/vouchers-templates", adminVouchersTemplateRouter.getRouter());
router.use("/vouchers", adminVouchersRouter.getRouter());
router.use("/app-settings", appSettingRouter.getRouter());
router.use("/allocate-revenues", allocateRevenueRouter.getRouter());
router.use("/employee-tickets", employeeTicketRouter.getRouter());
router.use("/zalo", zaloRouter.getRouter());
router.use("/zalo-message-histories", adminZaloMessageHistoryRouter.getRouter());
router.use("/zalo-templates", adminZaloTemplateRouter.getRouter());

export default router;
