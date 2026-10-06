import { Router } from "express";
import { authenticate } from "../shared/middleware/auth.middleware";
import { UploadGlobalMiddleware } from "../shared/middleware/uploadGlobal.middleware";
import { clientMiddleware } from "@/shared/middleware/client.middleware";

import { container } from "../modules/container";

import { RAG_TYPES } from "@/modules/rag/rag.types";
import { SSE_TYPES } from "../modules/sse/sse.types";
import { AUTH_TYPES } from "@/modules/auth/auth.types";
import { ORDER_TYPES } from "@/modules/order/order.types";
import { TICKET_TYPES } from "@/modules/ticket/ticket.types";
import { SERVICE_TYPES } from "@/modules/service/service.types";
import { DEBT_TYPES } from "@/modules/accountant/debt/debt.types";
import { CUSTOMER_TYPES } from "@/modules/customer/customer.types";
import { GOOGLE_MAP_TYPES } from "@/modules/googleMap/googleMap.types";
import { GOONG_MAP_TYPES } from "@/modules/goongMap/goongMap.types";
import { SUPPORT_ROOM_TYPES } from "@/modules/supportRoom/supportRoom.types";
import { SERVICE_ORDER_TYPES } from "@/modules/serviceOrder/serviceOrder.types";
import { REWARD_POINT_TYPES } from "@/modules/rewardPoint/rewardPoint.types";
import { APP_SETTING_TYPES } from "@/modules/appSetting/appSetting.types";
import { VOUCHERS_TEMPLATE_TYPES } from "@/modules/vouchersTemplate/vouchersTemplate.types";
import { VOUCHERS_TYPES } from "@/modules/vouchers/vouchers.types";

import { RagRouter } from "@/modules/rag/rag.route";
import { AuthRouter } from "@/modules/auth/auth.route";
import { ClientSSERouter } from "../modules/sse/client.sse.route";
import { ClientOrderRouter } from "@/modules/order/client.order.route";
import { ClientTicketRouter } from "@/modules/ticket/client.ticket.route";
import { ClientServiceRouter } from "@/modules/service/client.service.route";
import { ClientDebtRouter } from "@/modules/accountant/debt/client.debt.route";
import { ClientCustomerRouter } from "@/modules/customer/client.customer.route";
import { ClientGoogleMapRouter } from "@/modules/googleMap/client.googleMap.route";
import { ClientGoongMapRouter } from "@/modules/goongMap/client.goongMap.route";
import { ClientSupportRoomRouter } from "@/modules/supportRoom/client.supportRoom.route";
import { ClientServiceOrderRouter } from "@/modules/serviceOrder/client.serviceOrder.route";
import { ClientRewardPointRouter } from "@/modules/rewardPoint/client.rewardPoint.route";
import { AppSettingRouter } from "@/modules/appSetting/appSetting.route";
import { ClientVouchersTemplateRouter } from "@/modules/vouchersTemplate/client.vouchersTemplate.route";
import { ClientVouchersRouter } from "@/modules/vouchers/client.vouchers.route";

const clientRouter = Router();

const ragRouter = container.get<RagRouter>(RAG_TYPES.RagRouter);
const authRouter = container.get<AuthRouter>(AUTH_TYPES.AuthRouter);
const clientSSERouter = container.get<ClientSSERouter>(SSE_TYPES.ClientSSERouter);
const clientDebtRouter = container.get<ClientDebtRouter>(DEBT_TYPES.ClientDebtRouter);
const clientOrderRouter = container.get<ClientOrderRouter>(ORDER_TYPES.ClientOrderRouter);
const appSettingRouter = container.get<AppSettingRouter>(APP_SETTING_TYPES.AppSettingRouter);
const clientTicketRouter = container.get<ClientTicketRouter>(TICKET_TYPES.ClientTicketRouter);
const clientServiceRouter = container.get<ClientServiceRouter>(SERVICE_TYPES.ClientServiceRouter);
const clientCustomerRouter = container.get<ClientCustomerRouter>(CUSTOMER_TYPES.ClientCustomerRouter);
const clientGoogleMapRouter = container.get<ClientGoogleMapRouter>(GOOGLE_MAP_TYPES.ClientGoogleMapRouter);
const clientGoongMapRouter = container.get<ClientGoongMapRouter>(GOONG_MAP_TYPES.ClientGoongMapRouter);
const clientSupportRoomRouter = container.get<ClientSupportRoomRouter>(SUPPORT_ROOM_TYPES.ClientSupportRoomRouter);
const clientServiceOrderRouter = container.get<ClientServiceOrderRouter>(SERVICE_ORDER_TYPES.ClientServiceOrderRouter);
const clientRewardPointRouter = container.get<ClientRewardPointRouter>(REWARD_POINT_TYPES.ClientRewardPointRouter);
const clientVouchersTemplateRouter = container.get<ClientVouchersTemplateRouter>(
  VOUCHERS_TEMPLATE_TYPES.ClientVouchersTemplateRouter,
);
const clientVouchersRouter = container.get<ClientVouchersRouter>(VOUCHERS_TYPES.ClientVouchersRouter);

clientRouter.use("/auth", authRouter.getRouter());
clientRouter.use("/sse", clientSSERouter.getRouter());
clientRouter.use("/services", clientServiceRouter.getRouter());
clientRouter.use("/rag", ragRouter.getRouter());
clientRouter.use("/orders", clientOrderRouter.getRouter());
clientRouter.use("/customers", clientCustomerRouter.getRouter());

clientRouter.post("/uploads", UploadGlobalMiddleware.uploadFiles(), (req, res) => {
  res.status(200).json(res.locals.uploadedUrls);
});

clientRouter.use(authenticate); // Apply authentication middleware to all routes below
clientRouter.use(clientMiddleware); // Apply client role middleware to all routes below

clientRouter.use("/service-orders", clientServiceOrderRouter.getRouter());
clientRouter.use("/google-maps", clientGoogleMapRouter.getRouter());
clientRouter.use("/goong-maps", clientGoongMapRouter.getRouter());
clientRouter.use("/tickets", clientTicketRouter.getRouter());
clientRouter.use("/support-rooms", clientSupportRoomRouter.getRouter());
clientRouter.use("/debts", clientDebtRouter.getRouter());
clientRouter.use("/reward-points", clientRewardPointRouter.getRouter());
clientRouter.use("/vouchers-templates", clientVouchersTemplateRouter.getRouter());
clientRouter.use("/vouchers", clientVouchersRouter.getRouter());
clientRouter.use("/app-settings", appSettingRouter.getRouter());

export default clientRouter;
