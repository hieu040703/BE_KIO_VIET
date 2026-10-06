import { Router } from "express";
import { injectable, inject } from "inversify";
import { OrderController } from "./order.controller";
import {
  CreateOrderSchema,
  UpdateOrderSchema,
  OrderQuerySchema,
  OrderParamsSchema,
  OrderIdParamSchema,
  AdminOrderCheckInSchema,
} from "./order.validator";
import { ORDER_TYPES } from "./order.types";
import { OrderDetailRouter } from "./orderDetail/orderDetail.route";
import { ORDER_DETAIL_TYPES } from "./orderDetail/orderDetail.types";
import { OrderCommentRouter } from "./orderComment/orderComment.route";
import { ORDER_COMMENT_TYPES } from "./orderComment/orderComment.types";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { OrderEmployeeRouter } from "./orderEmployee/orderEmployee.route";
import { OrderEmployeeController } from "./orderEmployee/orderEmployee.controller";
import { ORDER_EMPLOYEE_TYPES } from "./orderEmployee/orderEmployee.types";
import {
  OrderEmployeeActionParamsSchema,
  OrderEmployeeCheckoutSchema,
  UpdateOrderEmployeeStatusSchema,
} from "./orderEmployee/orderEmployee.validator";
import { strictActionLimiter } from "@/shared/middleware/rateLimit.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { ORDER_LEADER_CHAT_TYPES } from "./orderLeaderChat/orderLeaderChat.types";
import { OrderLeaderChatRouter } from "./orderLeaderChat/orderLeaderChat.route";
import { ORDER_LEADER_TYPES } from "./orderLeader/orderLeader.types";
import { OrderLeaderRouter } from "./orderLeader/orderLeader.route";

@injectable()
export class OrderRouter {
  private router: Router;

  constructor(
    @inject(ORDER_TYPES.OrderController)
    private orderController: OrderController,
    @inject(ORDER_DETAIL_TYPES.OrderDetailRouter)
    private orderDetailRouter: OrderDetailRouter,
    @inject(ORDER_COMMENT_TYPES.OrderCommentRouter)
    private orderCommentRouter: OrderCommentRouter,
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeRouter)
    private orderEmployeeRouter: OrderEmployeeRouter,
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeController)
    private orderEmployeeController: OrderEmployeeController,
    @inject(ORDER_LEADER_TYPES.OrderLeaderRouter)
    private orderLeaderRouter: OrderLeaderRouter,
    @inject(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatRouter)
    private orderLeaderChatRouter: OrderLeaderChatRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    //$ =========================================================$//
    // All order routes require authentication
    // Nhân viên tự phản hồi việc nhận hợp đồng và quản lý cập nhật trạng thái.
    // Các route này kiểm tra quyền theo assignment trong service, không phụ thuộc quyền màn hình.
    this.router.post(
      "/:orderId/employees/:id/confirm",
      strictActionLimiter,
      zodValidate(OrderEmployeeActionParamsSchema, "params"),
      this.orderEmployeeController.confirmAssignment,
    );

    this.router.post(
      "/:orderId/employees/:id/reject",
      strictActionLimiter,
      zodValidate(OrderEmployeeActionParamsSchema, "params"),
      this.orderEmployeeController.rejectAssignment,
    );

    this.router.post(
      "/:orderId/employees/:id/check-out",
      strictActionLimiter,
      zodValidate(OrderEmployeeActionParamsSchema, "params"),
      zodValidate(OrderEmployeeCheckoutSchema, "body"),
      this.orderEmployeeController.checkOut,
    );

    this.router.put(
      "/:orderId/employees/:id/status",
      strictActionLimiter,
      zodValidate(OrderEmployeeActionParamsSchema, "params"),
      zodValidate(UpdateOrderEmployeeStatusSchema, "body"),
      this.orderEmployeeController.updateAssignmentStatus,
    );

    // Quản lý chi nhánh tự phản hồi việc tiếp nhận hợp đồng; service kiểm tra đúng người được gán.
    this.router.post(
      "/:id/branch-manager/confirm",
      strictActionLimiter,
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.confirmBranchManager.bind(this.orderController),
    );

    this.router.post(
      "/:id/branch-manager/reject",
      strictActionLimiter,
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.rejectBranchManager.bind(this.orderController),
    );

    this.router.use(
      "/:orderId/details",
      permissionMiddleware({ order: ["read", "update"] }),
      zodValidate(OrderIdParamSchema, "params"),
      this.orderDetailRouter.getRouter(),
    );

    this.router.use(
      "/:orderId/comments",
      permissionMiddleware({ order: ["read", "update"] }),
      zodValidate(OrderIdParamSchema, "params"),
      this.orderCommentRouter.getRouter(),
    );

    this.router.use(
      "/:orderId/employees",
      permissionMiddleware({ order: ["read", "update"] }),
      zodValidate(OrderIdParamSchema, "params"),
      this.orderEmployeeRouter.getRouter(),
    );

    this.router.use(
      "/:orderId/leaders",
      permissionMiddleware({ order: ["read", "update"] }),
      zodValidate(OrderIdParamSchema, "params"),
      this.orderLeaderRouter.getRouter(),
    );

    this.router.use(
      "/:orderId/leader-chat",
      permissionMiddleware({ order: ["read", "update"] }),
      zodValidate(OrderIdParamSchema, "params"),
      this.orderLeaderChatRouter.getRouter(),
    );

    // GET /orders/customer/:customerId/unpaid - Get all unpaid orders for a customer
    this.router.get(
      "/customer/:customerId/unpaid",
      this.orderController.getAllUnpaidOrdersByCustomer.bind(
        this.orderController,
      ),
    );

    // GET /orders - Get all orders with filters
    this.router.get(
      "/",
      permissionMiddleware({ order: ["read"] }),
      zodValidate(OrderQuerySchema, "query"),
      this.orderController.getAllWithPagination.bind(this.orderController),
    );

    // POST /orders/:id/start - Start an order
    this.router.post(
      "/:id/start",
      strictActionLimiter,
      permissionMiddleware({ order: ["create"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.startOrder.bind(this.orderController),
    );

    // POST /orders/:id/make-call-to-customer - Make a call to the order customer
    this.router.post(
      "/:id/make-call-to-customer",
      strictActionLimiter,
      permissionMiddleware({ order: ["read"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.makeCallToCustomer.bind(this.orderController),
    );

    // POST /orders/:id/confirm-completion - Nhân viên đầu cánh xác nhận hoàn tất đơn hàng
    this.router.post(
      "/:id/confirm-completion",
      strictActionLimiter,
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.confirmOrderCompletion,
    );

    // POST /orders/:id/complete - Quản lý hoàn tất đơn hàng
    this.router.post(
      "/:id/complete",
      strictActionLimiter,
      permissionMiddleware({ order: ["confirm"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.completeOrder.bind(this.orderController),
    );

    // POST /orders/:id/cancel - Cancel an order
    this.router.post(
      "/:id/cancel",
      strictActionLimiter,
      permissionMiddleware({ order: ["confirm"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.cancelOrder.bind(this.orderController),
    );

    // POST /orders/:id/export-bill - Export bill for an order
    this.router.post(
      "/:id/export-bill",
      permissionMiddleware({ order: ["export"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.exportBill.bind(this.orderController),
    );

    // POST /orders/:id/confirm-payment-all - Confirm payment for all orders
    this.router.post(
      "/:id/confirm-payment-all",
      strictActionLimiter,
      permissionMiddleware({ order: ["confirm"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.confirmOrderPaymentAll.bind(this.orderController),
    );

    // POST /orders - Create new order
    this.router.post(
      "/",
      permissionMiddleware({ order: ["create"] }),
      zodValidate(CreateOrderSchema, "body"),
      this.orderController.create.bind(this.orderController),
    );

    // GET /orders/:id/qrcode-bank-transfer - Create QR code for bank transfer
    this.router.get(
      "/:id/qrcode-bank-transfer",
      permissionMiddleware({ order: ["read"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.getQrCodeBankTransfer.bind(this.orderController),
    );

    // GET /orders/:id/unread-comments - Get unread comment count for an order
    this.router.get(
      "/:id/unread-comments",
      permissionMiddleware({ order: ["read"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.getUnreadCommentCount.bind(this.orderController),
    );

    // GET /orders/:id - Get order by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ order: ["read"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.getById.bind(this.orderController),
    );

    // PUT /orders/:id - Update order
    this.router.put(
      "/:id",
      permissionMiddleware({ order: ["update"] }),
      zodValidate(OrderParamsSchema, "params"),
      zodValidate(UpdateOrderSchema, "body"),
      this.orderController.update.bind(this.orderController),
    );

    // DELETE /orders/:id - Delete order
    this.router.delete(
      "/:id",
      permissionMiddleware({ order: ["delete"] }),
      zodValidate(OrderParamsSchema, "params"),
      this.orderController.delete.bind(this.orderController),
    );

    // POST /orders/:id/check-in
    this.router.post(
      "/:id/check-in",
      zodValidate(OrderParamsSchema, "params"),
      zodValidate(AdminOrderCheckInSchema, "body"),
      this.orderController.checkIn,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
