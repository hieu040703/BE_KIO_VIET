import { In, IsNull } from "typeorm";
import { Request } from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ORDER_TYPES } from "./order.types";
import { injectable, inject } from "inversify";
import { Order } from "@/database/models/Order";
import { OrderRepository } from "./order.repository";
import { BaseService } from "@/shared/base/BaseService";
import { OrderLeader } from "@/database/models/OrderLeader";
import { OrderRelations, OrderSelectFull } from "./order.select";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/shared/types/errors";
import { ApiResponse, IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { AdminOrderCheckInDto, CreateOrderDto, UpdateOrderDto } from "./order.validator";
import { EMPLOYEE_TYPES } from "../employee/employee.types";
import { EmployeeRepository } from "../employee/employee.repository";
import { ORDER_EMPLOYEE_TYPES } from "./orderEmployee/orderEmployee.types";
import { OrderEmployeeRepository } from "./orderEmployee/orderEmployee.repository";
import { BRANCH_TYPES } from "../branch/branch.types";
import { BranchRepository } from "../branch/branch.repository";
import { ORDER_COMMENT_TYPES } from "./orderComment/orderComment.types";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { FINANCE_TYPES, FinanceCreationSourceEnum } from "../accountant/finance/finance.types";
import { FinanceService } from "../accountant/finance/finance.service";
import { CreateFinanceDto } from "../accountant/finance/finance.validator";
import {
  BranchManagerConfirmStatusEnum,
  DebtTypeEnum,
  FinanceTypeEnum,
  NotificationTypeEnum,
  OrderEmployeeStatusEnum,
  OrderStatusEnum,
  PositionDefaultEnum,
  RewardPointTypeEnum,
  ServiceOrderStatusEnum,
  TripStatusEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { DEBT_TYPES } from "../accountant/debt/debt.types";
import { DebtService } from "../accountant/debt/debt.service";
import { CreateDebtDto } from "../accountant/debt/debt.validator";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { exportBillHandle } from "./handles/exportBill";
import { config } from "@/shared/config/env";
import { OrderCommentService } from "./orderComment/orderComment.service";
import { TIME_KEEPING_TYPES } from "../timeKeeping/timeKeeping.types";
import { TimeKeepingRepository } from "../timeKeeping/timeKeeping.repository";
import { CUSTOMER_TYPES } from "../customer/customer.types";
import { CustomerRepository } from "../customer/customer.repository";
import { DebtRepository } from "../accountant/debt/debt.repository";
import { FUND_TYPES } from "../fund/fund.types";
import { FundRepository } from "../fund/fund.repository";
import { QrPay, VietQRService } from "@/shared/utils/tsQrcodeVer2";
import { OrderEmployeeService } from "./orderEmployee/orderEmployee.service";
import { COMMON_TYPES } from "../common/common.types";
import { CodeService } from "../common/code.service";
import { FinanceRepository } from "../accountant/finance/finance.repository";
import { CalculateOrderData } from "./handles/calculate.order";
import { ORDER_LEADER_TYPES } from "./orderLeader/orderLeader.types";
import { CreateOrderLeaderDto } from "./orderLeader/orderLeader.validator";
import { OrderLeaderRepository } from "./orderLeader/orderLeader.repository";
import { ORDER_DETAIL_TYPES } from "./orderDetail/orderDetail.types";
import { OrderDetailService } from "./orderDetail/orderDetail.service";
import { REWARD_POINT_TYPES } from "../rewardPoint/rewardPoint.types";
import { AdminRewardPointRepository } from "../rewardPoint/admin.rewardPoint.repository";
import { SERVICE_ORDER_TYPES } from "../serviceOrder/serviceOrder.types";
import { SERVICE_ORDER_CHAT_TYPES } from "../serviceOrder/chat/serviceOrderChat.types";
import { ServiceOrderChatParticipantRepository } from "../serviceOrder/chat/serviceOrderChatParticipant.repository";
import { NotificationService } from "../notification/notification.service";
import { NOTIFICATION_TYPES } from "../notification/notification.types";
import { UserRepository } from "../user/user.repository";
import { USER_TYPES } from "../user/user.types";
import { AdminServiceOrderRepository } from "../serviceOrder/admin.serviceOrder.repository";
import { ORDER_LEADER_CHAT_TYPES } from "./orderLeaderChat/orderLeaderChat.types";
import { OrderLeaderChatService } from "./orderLeaderChat/orderLeaderChat.service";
import { APP_SETTING_TYPES } from "../appSetting/appSetting.types";
import { AppSettingRepository } from "../appSetting/appSetting.repository";
import { resolveAllocateRevenuePercent, resolveCreatedByEmployeeFields } from "./order.creation";
import { ZALO_TYPES } from "../zalo/zalo.types";
import type { ZaloMessageHistoryContext, ZaloService } from "../zalo/zalo.service";
import { ZaloTemplateTypeEnum } from "../zalo/zalo.constance";
import { Utils } from "@/shared/utils/utils";
import { CALL_NAVIGATION_TYPES } from "../callNavigation/callNavigation.types";
import { CallNavigationRepository } from "../callNavigation/callNavigation.repository";
import { CallNavigationService } from "../callNavigation/callNavigation.service";
import { evaluateServiceOrderCheckIn } from "./order.checkin";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { UserSelectBasic } from "../user/user.select";
import logger from "@/shared/utils/logger";

dayjs.extend(utc);
dayjs.extend(timezone);

@injectable()
export class OrderService extends BaseService<Order> {
  protected relations = OrderRelations;
  protected selectedFields = OrderSelectFull;
  constructor(
    @inject(COMMON_TYPES.CodeService) private codeService: CodeService,
    @inject(APP_SETTING_TYPES.AppSettingRepository)
    private appSettingRepository: AppSettingRepository,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeRepository)
    private orderEmployeeRepository: OrderEmployeeRepository,
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeService) private orderEmployeeService: OrderEmployeeService,
    @inject(BRANCH_TYPES.BranchRepository) private branchRepository: BranchRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentService) private orderCommentService: OrderCommentService,
    @inject(FINANCE_TYPES.FinanceService) private financeService: FinanceService,
    @inject(FINANCE_TYPES.FinanceRepository) private financeRepository: FinanceRepository,
    @inject(DEBT_TYPES.DebtService) private debtService: DebtService,
    @inject(DEBT_TYPES.DebtRepository) private debtRepository: DebtRepository,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
    @inject(FUND_TYPES.FundRepository) private fundRepository: FundRepository,
    @inject(ORDER_TYPES.CalculateOrderData) private calculateOrderData: CalculateOrderData,
    @inject(ORDER_LEADER_TYPES.OrderLeaderRepository) private orderLeaderRepository: OrderLeaderRepository,
    @inject(ORDER_DETAIL_TYPES.OrderDetailService) private orderDetailService: OrderDetailService,
    @inject(REWARD_POINT_TYPES.AdminRewardPointRepository) private rewardPointRepository: AdminRewardPointRepository,
    @inject(SERVICE_ORDER_TYPES.AdminServiceOrderRepository)
    private serviceOrderRepository: AdminServiceOrderRepository,
    @inject(NOTIFICATION_TYPES.NotificationService) private notificationService: NotificationService,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatParticipantRepository)
    private chatParticipantRepository: ServiceOrderChatParticipantRepository,
    @inject(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatService)
    private orderLeaderChatService: OrderLeaderChatService,
    @inject(ZALO_TYPES.ZaloService) private zaloService: ZaloService,
    @inject(CALL_NAVIGATION_TYPES.CallNavigationRepository) private callNavigationRepository: CallNavigationRepository,
    @inject(CALL_NAVIGATION_TYPES.CallNavigationService) private callNavigationService: CallNavigationService,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(orderRepository);
  }

  async findById(
    id: string,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<Order & { needCheckin: boolean }>> {
    const response = await super.findById(id, req, manager);
    const order = response.data;
    const employeeId = req?.user?.employeeId;
    const role = req?.user?.role;

    let needCheckin = false;
    let needCheckout = false;
    let canCompleteOrder = false;
    let isLeader = false;

    if (employeeId && role === UserRoleEnum.EMPLOYEE) {
      const orderEmployees = await this.orderEmployeeRepository.findByOptions(
        {
          where: {
            orderId: id,
            employeeId,
          },
        },
        manager,
      );

      const orderEmployee = orderEmployees.find((oe) => oe.employeeId === employeeId);

      if (
        orderEmployee?.status === OrderEmployeeStatusEnum.CONFIRMED &&
        order.branchManagerConfirmedStatus === BranchManagerConfirmStatusEnum.CONFIRMED &&
        orderEmployee?.checkInAt === null &&
        order.status !== OrderStatusEnum.COMPLETED &&
        order.status !== OrderStatusEnum.CANCELED
      ) {
        needCheckin = true;
      }

      if (
        orderEmployee?.status === OrderEmployeeStatusEnum.CONFIRMED &&
        order.branchManagerConfirmedStatus === BranchManagerConfirmStatusEnum.CONFIRMED &&
        orderEmployee?.checkInAt !== null &&
        orderEmployee?.checkOutAt === null &&
        order.status !== OrderStatusEnum.COMPLETED &&
        order.status !== OrderStatusEnum.CANCELED
      ) {
        needCheckout = true;
      }

      isLeader = orderEmployee?.isLeader === true;

      if (isLeader) {
        // check xem tat ca nhan vien trong don da checkout het chua
        const numberOfEmpCheckout = orderEmployees.filter((oe) => oe.checkOutAt !== null).length;
        const numberOfEmp = orderEmployees.filter((oe) => (oe.status = OrderEmployeeStatusEnum.CONFIRMED)).length;
        if (numberOfEmpCheckout >= numberOfEmp && order.completedByEmployeeId === null) {
          canCompleteOrder = true;
        }
      }
    }

    Object.assign(order, { needCheckin, needCheckout, isLeader, canCompleteOrder });

    return ApiResponseHandler.getSuccess("OK", { ...order });
  }

  private async updateBranchManagerConfirmation(
    orderId: string,
    status: BranchManagerConfirmStatusEnum.CONFIRMED | BranchManagerConfirmStatusEnum.REJECTED,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<
    ApiResponse<{
      isNewlyUpdated: boolean;
      orderId: string;
      branchManagerConfirmedStatus: BranchManagerConfirmStatusEnum;
      branchManagerConfirmedAt: Date | null;
    }>
  > {
    const orderRepository = this.orderRepository.getRepository(manager);
    const order = await orderRepository
      .createQueryBuilder("order")
      .select([
        "order.id",
        "order.branchManagerId",
        "order.branchManagerConfirmedStatus",
        "order.branchManagerConfirmedAt",
      ])
      .where("order.id = :orderId", { orderId })
      .setLock("pessimistic_write")
      .getOne();

    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    const isAdmin = req?.user?.role === UserRoleEnum.ADMIN;
    if (!isAdmin && req?.user?.employeeId !== order.branchManagerId) {
      throw new ForbiddenError("Chỉ quản lý chi nhánh của hợp đồng mới có thể phản hồi nhận đơn");
    }

    const currentStatus = order.branchManagerConfirmedStatus ?? BranchManagerConfirmStatusEnum.PENDING;
    if (currentStatus === status) {
      return ApiResponseHandler.updateSuccess("OK", {
        isNewlyUpdated: false,
        orderId,
        branchManagerConfirmedStatus: currentStatus,
        branchManagerConfirmedAt: order.branchManagerConfirmedAt ?? null,
      });
    }

    const branchManagerConfirmedAt = new Date();
    await orderRepository.update(orderId, {
      branchManagerConfirmedStatus: status,
      branchManagerConfirmedAt,
    });

    const branchManager = await this.employeeRepository.findById(order.branchManagerId);

    //$ create comment if update
    await this.orderCommentService.create(
      {
        orderId,
        userId: null,
        content: `Quản lý ${branchManager?.zaloName || branchManager?.name || "chi nhánh"} đã ${status === BranchManagerConfirmStatusEnum.CONFIRMED ? "đồng ý" : "từ chối"} phụ trách hợp đồng`,
      },
      undefined,
      manager,
    );

    return ApiResponseHandler.updateSuccess("OK", {
      isNewlyUpdated: true,
      orderId,
      branchManagerConfirmedStatus: status,
      branchManagerConfirmedAt,
    });
  }

  async confirmBranchManager(orderId: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse> {
    return this.updateBranchManagerConfirmation(orderId, BranchManagerConfirmStatusEnum.CONFIRMED, req, manager);
  }

  async rejectBranchManager(orderId: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse> {
    return this.updateBranchManagerConfirmation(orderId, BranchManagerConfirmStatusEnum.REJECTED, req, manager);
  }

  async notifyBranchManagerConfirmationStatus(
    orderId: string,
    status: BranchManagerConfirmStatusEnum.CONFIRMED | BranchManagerConfirmStatusEnum.REJECTED,
  ): Promise<void> {
    const order = await this.orderRepository.findByOption({
      where: { id: orderId },
      select: {
        id: true,
        code: true,
        createdByEmployeeId: true,
      },
    });
    if (!order) {
      return;
    }

    const [adminUsers, creatorUserIds] = await Promise.all([
      this.userRepository.getRepository().find({
        where: { role: UserRoleEnum.ADMIN },
        select: { id: true },
      }),
      order.createdByEmployeeId
        ? this.userRepository.findUserIdsByEmployeeIds([order.createdByEmployeeId])
        : Promise.resolve([]),
    ]);
    const userIds = [...new Set([...adminUsers.map((user) => user.id), ...creatorUserIds])];
    if (userIds.length === 0) {
      return;
    }

    const isConfirmed = status === BranchManagerConfirmStatusEnum.CONFIRMED;
    await this.notificationService.createNotificationForMultipleUsers(
      userIds,
      {
        title: isConfirmed ? "Quản lý chi nhánh đồng ý nhận đơn" : "Quản lý chi nhánh từ chối nhận đơn",
        content: isConfirmed
          ? `Quản lý chi nhánh đã đồng ý nhận đơn ${order.code}.`
          : `Quản lý chi nhánh đã từ chối nhận đơn ${order.code}.`,
        type: NotificationTypeEnum.ALERT,
        objectId: orderId,
        metadata: {
          orderId,
          orderCode: order.code,
          event: "ORDER_BRANCH_MANAGER_CONFIRMATION_UPDATED",
          status,
        },
      },
      undefined,
      { orderCode: order.code },
    );
  }

  /**
   * Tự động gắn user (qua employeeId) vào ServiceOrderChatParticipant nếu chưa có.
   * Dùng cho: xác nhận đơn (gắn branch manager + manager đơn) và cập nhật manager đơn.
   */
  private async addEmployeeUserToChatIfNeeded(
    serviceOrderId: string,
    employeeId: string | null | undefined,
    manager?: IEntityManager,
  ): Promise<void> {
    if (!employeeId) return;

    // Tìm user liên kết với nhân viên
    const userList = await this.userRepository.findByOptions({ where: { employeeId } } as any, manager);
    const user = Array.isArray(userList) ? userList[0] : (userList as any)?.data?.[0];
    if (!user?.id) return;

    // Kiểm tra đã là participant chưa
    const existing = await this.chatParticipantRepository.findActiveByServiceOrderAndUser(
      serviceOrderId,
      user.id,
      manager,
    );
    if (existing) return;

    await this.chatParticipantRepository.create({ serviceOrderId, userId: user.id, addedByUserId: null }, manager);
  }

  private async sendNotificationToCustomer(
    customerId: string | null | undefined,
    orderId: string,
    title: string,
    content: string,
    event: string,
    orderCode: string,
  ): Promise<void> {
    if (!customerId) return;
    const userId = await this.userRepository.findUserIdByCustomerId(customerId);
    if (!userId) return;
    await this.notificationService.createNotificationForMultipleUsers(
      [userId],
      {
        title,
        content,
        type: NotificationTypeEnum.SYSTEM,
        objectId: orderId,
        metadata: { orderId, orderCode, event },
      },
      undefined,
      { orderCode },
    );
  }

  private async findOrderForZalo(orderId: string, status?: OrderStatusEnum): Promise<Order | null> {
    return this.orderRepository.getRepository().findOne({
      where: {
        id: orderId,
        ...(status ? { status } : {}),
      },
      relations: { customer: true },
    });
  }

  private async sendZaloOrderMessage(order: Order, templateType: ZaloTemplateTypeEnum): Promise<void> {
    const customer = order.customer;
    const phone = order.customerPhone || customer?.phone;
    if (!phone) return;

    const phoneNormalize = Utils.normalizeStringeePhoneNumber(phone);

    console.log("phoneNormalize", phoneNormalize);

    const historyContext: ZaloMessageHistoryContext = {
      orderId: order.id,
      customerId: order.customerId,
    };

    if (templateType === ZaloTemplateTypeEnum.CREATE) {
      const callNavigation = await this.callNavigationRepository.findByOption({
        where: {
          orderId: order.id,
          expiresAt: IsNull(), // chỉ lấy những cuộc gọi vẫn còn hiệu lực
        },
      });

      await this.zaloService.sendMessage(
        {
          phone: phoneNormalize,
          templateType,
          template_id: "",
          template_data: {
            name: Utils.formatZaloValue(customer.name, 30),
            phone,
            code: Utils.formatZaloValue(order.code, 30),
            address: Utils.formatZaloAddress(order.address),
            date: Utils.formatZaloDate(order.timeAt),
            status: order.status,
            price: order.amount || 0,
            employee_count: order.employeeCount || 0,
            note:
              Utils.formatZaloValue(order.description ?? order.note, 200) ||
              "Chúng tôi rất vui lòng được phục vụ quý khách hàng",
            stringee: config.HOTLINE_NUMBER,
          },
        },
        historyContext,
      );
      return;
    }

    await this.zaloService.sendMessage(
      {
        phone: phoneNormalize,
        templateType,
        template_id: "",
        template_data: {
          customer_name: Utils.formatZaloValue(customer.name, 30),
          order_code: Utils.formatZaloValue(order.code, 30),
          order_date: Utils.formatZaloDate(order.timeAt),
        },
      },
      historyContext,
    );
  }

  async notifyOrderCreatedViaZalo(orderId: string): Promise<void> {
    const order = await this.findOrderForZalo(orderId);
    if (!order) return;

    await this.sendZaloOrderMessage(order, ZaloTemplateTypeEnum.CREATE);
  }

  async notifyOrderCompletedViaZalo(orderId: string): Promise<void> {
    const order = await this.findOrderForZalo(orderId, OrderStatusEnum.COMPLETED);
    if (!order) return;

    await this.sendZaloOrderMessage(order, ZaloTemplateTypeEnum.COMPLETE_AND_VOTE);
  }

  async notifyOrderCompleted(orderId: string): Promise<void> {
    const order = await this.orderRepository.getRepository().findOne({
      where: {
        id: orderId,
        status: OrderStatusEnum.COMPLETED,
      },
      select: {
        id: true,
        code: true,
        customerId: true,
      },
    });

    if (!order) {
      return;
    }

    await this.sendNotificationToCustomer(
      order.customerId,
      order.id,
      "Đơn hàng hoàn thành",
      `Đơn hàng ${order.code} đã hoàn thành, cảm ơn bạn đã sử dụng dịch vụ.`,
      "ORDER_COMPLETED",
      order.code,
    );
  }

  async notifyUrgentOrderCreated(orderId: string): Promise<void> {
    const order = await this.orderRepository.findByOption({
      where: { id: orderId, isUrgent: true },
      select: {
        id: true,
        code: true,
        branchManagerId: true,
      },
    });

    if (!order?.branchManagerId) {
      return;
    }

    const userIds = await this.userRepository.findUserIdsByEmployeeIds([order.branchManagerId]);
    if (userIds.length === 0) {
      return;
    }

    await this.notificationService.createNotificationForMultipleUsers(
      userIds,
      {
        title: "Yêu cầu xác nhận nhận đơn hàng",
        content: "Vui lòng vào xác nhận đồng ý hoặc từ chối nhận đơn hàng.",
        type: NotificationTypeEnum.ALERT,
        objectId: order.id,
        metadata: {
          orderId: order.id,
          orderCode: order.code,
          event: "URGENT_ORDER_CREATED",
        },
      },
      undefined,
      { orderCode: order.code },
    );
  }

  async notifyOrderTimeAtChanged(orderId: string): Promise<void> {
    const order = await this.orderRepository.getRepository().findOne({
      where: { id: orderId },
      select: {
        id: true,
        code: true,
        timeAt: true,
        branchManagerId: true,
      },
    });
    if (!order) {
      return;
    }

    const [usersInOrder, branchManagerUserIds] = await Promise.all([
      this.orderEmployeeRepository.getAllUsersByOrderId(orderId),
      order.branchManagerId
        ? this.userRepository.findUserIdsByEmployeeIds([order.branchManagerId])
        : Promise.resolve([]),
    ]);
    const userIds = [...new Set([...usersInOrder.map((user) => user.id), ...branchManagerUserIds].filter(Boolean))];
    if (userIds.length === 0) {
      return;
    }

    const timeAt = dayjs(order.timeAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm");
    await this.notificationService.createNotificationForMultipleUsers(
      userIds,
      {
        title: "Thời gian bắt đầu hợp đồng thay đổi",
        content: `Thời gian bắt đầu hợp đồng ${order.code} đã được cập nhật thành ${timeAt}. Vui lòng vào xác nhận lại đơn hàng.`,
        type: NotificationTypeEnum.ALERT,
        objectId: order.id,
        metadata: {
          orderId: order.id,
          orderCode: order.code,
          event: "ORDER_TIME_AT_UPDATED",
          timeAt: new Date(order.timeAt).toISOString(),
        },
      },
      undefined,
      { orderCode: order.code },
    );
  }

  private hasTimeAtChanged(data: Order, dataOld: Order | undefined, req?: Request): boolean {
    if (!req?.body || req.body.timeAt === undefined || !dataOld?.timeAt || !data?.timeAt) {
      return false;
    }

    const previousTimeAt = new Date(dataOld.timeAt).getTime();
    const updatedTimeAt = new Date(data.timeAt).getTime();
    return Number.isFinite(previousTimeAt) && Number.isFinite(updatedTimeAt) && previousTimeAt !== updatedTimeAt;
  }

  private async resetConfirmationStatusesAfterTimeChange(orderId: string, manager?: IEntityManager): Promise<void> {
    await this.orderRepository.getRepository(manager).update(orderId, {
      branchManagerConfirmedStatus: BranchManagerConfirmStatusEnum.PENDING,
      branchManagerConfirmedAt: null,
    });

    await this.orderEmployeeRepository.getRepository(manager).update(
      {
        orderId,
        deletedAt: IsNull(),
      },
      { status: OrderEmployeeStatusEnum.PENDING },
    );
  }

  /**
   * Khi người dùng vào chi tiết 1 hợp đồng thì khởi tạo room chat cho hợp đồng đó
   * @param entity
   * @param manager
   */
  protected async actionAfterFindById(entity: Order, req?: Request, manager?: IEntityManager): Promise<void> {
    const userId = req?.user?.userId;
    if (!userId) return;

    const socketIds = SocketUtils.getUserSocket(userId);
    if (socketIds.length === 0) return;

    const roomId = entity.id;
    // SocketUtils.addUsersToRoom(roomId, [userId]);

    // log số lọng socket của user trong room
    const roomMembers = await SocketUtils.getRoomMembers(roomId);
    // console.log("Có tổng cộng ", roomMembers.length, " thành viên trong room ", roomId);
  }

  async validateBeforeCreate(data: CreateOrderDto, req?: Request, manager?: IEntityManager): Promise<void> {
    const [defaultCreatedByEmployeePercent, defaultAllocateRevenuePercent] = await Promise.all([
      this.appSettingRepository.getCreatedByEmployeePercent(),
      this.appSettingRepository.getBranchManagerRevenueShare(),
    ]);
    Object.assign(data, {
      ...resolveCreatedByEmployeeFields(data.createdByEmployeePercent, req, defaultCreatedByEmployeePercent),
      allocateRevenuePercent: resolveAllocateRevenuePercent(data.allocateRevenuePercent, defaultAllocateRevenuePercent),
    });

    const branch = await this.branchRepository.findById(data.branchId, manager);
    if (!branch) {
      throw new BadRequestError("Chi nhánh không tồn tại");
    }

    if (data.branchManagerId) {
      const branchManager = await this.employeeRepository.findById(data.branchManagerId, manager);
      if (!branchManager) {
        throw new BadRequestError("Quản lý chi nhánh không tồn tại");
      }
    }

    if (data.estimatedCompletionAt && data.estimatedCompletionAt <= data.timeAt) {
      throw new BadRequestError("Thời gian hoàn thành phải sau thời gian bắt đầu");
    }

    if (req && req.user) {
      if (req.user.role !== UserRoleEnum.ADMIN) {
        const createdByEmployeeId = req.user.employeeId;
        if (createdByEmployeeId) {
          const createdByEmployee = await this.employeeRepository.findById(createdByEmployeeId, manager);
          if (!createdByEmployee) {
            throw new BadRequestError("Nhân viên tạo đơn không tồn tại");
          }

          Object.assign(data, { createdByEmployeeId });
        }
      }
    } else {
      throw new ForbiddenError("Tài nguyên không tồn tại");
    }

    // Add your validation logic here
    if (!data.code) {
      const code = await this.codeService.getCode("Order", manager);
      data.code = code.data.code || "";
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.orderRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã hợp đồng đã tồn tại");
      }
    }

    if (data.details && data.details.length > 0) {
      data.preVatAmount = data.details.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (data.discountPercent) {
        data.discountAmount = (data.preVatAmount * data.discountPercent) / 100;
      }

      if (data.vat) {
        data.vatAmount = ((data.preVatAmount - (data.discountAmount || 0)) * data.vat) / 100;
      }

      data.amount = data.preVatAmount - (data.discountAmount || 0) + (data.vatAmount || 0);
    }

    if (data.isInvoiced) {
      if (!data.invoiceNumber) {
        throw new BadRequestError("Số hóa đơn không được để trống khi đánh dấu đã xuất hóa đơn");
      }
      if (!data.invoiceDate) {
        data.invoiceDate = data.timeAt;
      }
    }

    // if (branch.employeeId) {
    //   Object.assign(data, { employeeId: branch.employeeId });
    // }
  }

  async actionAfterCreate(data: Order, req?: Request, manager?: IEntityManager): Promise<void> {
    console.log("data actionAfterCreate:", data);

    if (data.branchManagerId) {
      const branchManager = await this.employeeRepository.findByOption(
        {
          where: {
            id: data.branchManagerId,
          },
          select: {
            id: true,
            name: true,
            zaloName: true,
            user: UserSelectBasic,
          },
          relations: {
            user: true,
          },
        },
        manager,
      );

      if (!branchManager || !branchManager.user) {
        throw new BadRequestError("Quản lý chi nhánh không tồn tại hoặc chưa có tài khoản người dùng");
      }

      const dataCreateOrderLeader: CreateOrderLeaderDto = {
        position: PositionDefaultEnum.BRANCH_MANAGER,
        orderId: data.id,
        employeeId: data.branchManagerId,
        revenueShare: data.amount || 0,
      };

      await this.orderLeaderRepository.create(dataCreateOrderLeader, manager);

      //$ create comment if update
      await this.orderCommentService.create(
        {
          orderId: data.id,
          userId: null,
          content: `Quản lý ${branchManager.zaloName || branchManager.name} được phân công phụ trách hợp đồng`,
        },
        undefined,
        manager,
      );

      await this.makeCallToCustomer(data, branchManager.user.id, manager);

      // Gắn quản lý chi nhánh đã chọn vào chat nếu đơn tạo từ service order
      // if (data.serviceOrderId) {
      //   await this.addEmployeeUserToChatIfNeeded(data.serviceOrderId, data.branchManagerId, manager);
      // }
    }

    if (data.deposit && data.deposit > 0) {
      //? create finance income
      const dataCreateFinance: CreateFinanceDto = {
        branchId: data.branchId,
        customerId: data.customerId,
        type: FinanceTypeEnum.INCOME,
        category: "Tiền tạm ứng hợp đồng",
        amount: data.deposit,
        timeAt: new Date(),
        orderPayments: [
          {
            orderId: data.id,
            amount: data.deposit,
          },
        ],
        isDeposit: true,
        note: `Tiền tạm ứng hợp đồng ${data.code}`,
      };
      await this.financeService.create(dataCreateFinance, req, manager, FinanceCreationSourceEnum.SYSTEM);
    }
  }

  // Ủy quyền sang CallNavigationService để tránh vòng lặp inject (OrderService ⇄ OrderEmployeeService)
  // Business logic gốc đã được chuyển sang CallNavigationService.makeCallToCustomer
  async makeCallToCustomer(
    order: Order,
    userId: string,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ phone: string }>> {
    return this.callNavigationService.makeCallToCustomer(order, userId, manager);
  }

  async update(id: string, data: Partial<Order>, req?: Request, manager?: IEntityManager): Promise<ApiResponse<Order>> {
    const sanitizedData = { ...data };
    return super.update(id, sanitizedData, req, manager);
  }

  async validateBeforeUpdate(
    id: string | number,
    data: Partial<Order>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const updateData = data as UpdateOrderDto;
    const existingOrder = await this.orderRepository.findById(id, manager);
    if (!existingOrder) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    const startTime = updateData.timeAt ?? existingOrder.timeAt;
    const estimatedCompletionTime =
      updateData.estimatedCompletionAt !== undefined
        ? updateData.estimatedCompletionAt
        : existingOrder.estimatedCompletionAt;
    if (estimatedCompletionTime && estimatedCompletionTime <= startTime) {
      throw new BadRequestError("Thời gian hoàn thành phải sau thời gian bắt đầu");
    }

    if (
      updateData.allocateRevenuePercent !== undefined &&
      (updateData.allocateRevenuePercent < 0 || updateData.allocateRevenuePercent > 100)
    ) {
      throw new BadRequestError("Phần trăm phân bổ doanh thu phải từ 0 đến 100");
    }

    if (updateData.branchManagerId !== undefined && updateData.branchManagerId !== existingOrder.branchManagerId) {
      if (updateData.branchManagerId) {
        const branchManager = await this.employeeRepository.findById(updateData.branchManagerId, manager);
        if (!branchManager) {
          throw new BadRequestError("Quản lý chi nhánh không tồn tại");
        }
      }
    }

    if (updateData.code && updateData.code !== existingOrder.code) {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.orderRepository.fieldExistsExcludingId("code", updateData.code, id as string);
      if (codeExists) {
        throw new BadRequestError("Mã hợp đồng đã được sử dụng");
      }
    }

    if (updateData.branchId && updateData.branchId !== existingOrder.branchId) {
      const branch = await this.branchRepository.findById(updateData.branchId, manager);
      if (!branch) {
        throw new BadRequestError("Chi nhánh không tồn tại");
      }
      //? branchManagerId sẽ được re-sync trong actionAfterUpdate dựa trên branch.manager
    }

    if (existingOrder.isPaid) {
      if (updateData.discountPercent && updateData.discountPercent !== existingOrder.discountPercent) {
        throw new BadRequestError(
          "Không thể thay đổi phần trăm giảm giá của hợp đồng đã được thanh toán đầy đủ, vui lòng xóa hết các phiếu thu liên quan đến hợp đồng này trước khi thay đổi phần trăm giảm giá",
        );
      }

      if (updateData.vat && updateData.vat !== existingOrder.vat) {
        throw new BadRequestError(
          "Không thể thay đổi thuế VAT của hợp đồng đã được thanh toán đầy đủ, vui lòng xóa hết các phiếu thu liên quan đến hợp đồng này trước khi thay đổi thuế VAT",
        );
      }
    }

    // gắn existingOrder vào request để sau này có thể dùng trong actionAfterUpdate
    Object.assign(req || {}, { existingOrder });
  }

  async actionAfterUpdate(data: Order, req?: Request, manager?: IEntityManager): Promise<void> {
    let content = "Hợp đồng đã có thay đổi";
    const dataOld = (req as any)?.existingOrder as Order;
    const requestedOrderLeaders = ((req as any)?.requestedOrderLeaders ||
      req?.body?.orderLeaders) as UpdateOrderDto["orderLeaders"];

    if (this.hasTimeAtChanged(data, dataOld, req)) {
      await this.resetConfirmationStatusesAfterTimeChange(data.id, manager);
    }

    if (req && req.body && dataOld) {
      const changedFields = Object.keys(req.body).filter((key) => {
        return req.body[key] !== dataOld[key as keyof Order];
      });
      if (changedFields.length > 0) {
        let changedContent = "";

        if (dataOld) {
          for (const field of changedFields) {
            switch (field) {
              case "timeAt":
                changedContent += `Thời gian: ${new Date(dataOld.timeAt).toLocaleString("vi-VN")} -> ${new Date(data.timeAt).toLocaleString("vi-VN")} \n`;
                break;
              case "estimatedCompletionAt":
                const oldEstimatedCompletionAt = dataOld.estimatedCompletionAt
                  ? new Date(dataOld.estimatedCompletionAt).toLocaleString("vi-VN")
                  : "----";
                const newEstimatedCompletionAt = data.estimatedCompletionAt
                  ? new Date(data.estimatedCompletionAt).toLocaleString("vi-VN")
                  : "----";

                changedContent += `Thời gian dự kiến hoàn thành: ${oldEstimatedCompletionAt} -> ${newEstimatedCompletionAt} \n`;
                break;
              case "name":
                changedContent += `Tên hợp đồng: ${dataOld.name || "----"} -> ${data.name || "----"} \n`;
                break;
              case "customerId":
                const customerOld = await this.customerRepository.findById(dataOld.customerId, manager);
                const customerNew = await this.customerRepository.findById(data.customerId, manager);
                changedContent += `Khách hàng: ${customerOld?.name || "----"} -> ${customerNew?.name || "----"} \n`;
                break;
              case "customerEmail":
                changedContent += `Email khách hàng: ${dataOld.customerEmail || "----"} -> ${data.customerEmail || "----"} \n`;
                break;
              case "customerTaxCode":
                changedContent += `Mã số thuế khách hàng: ${dataOld.customerTaxCode || "----"} -> ${data.customerTaxCode || "----"} \n`;
                break;
              case "branchId":
                const branchOld = await this.branchRepository.findById(dataOld.branchId, manager);
                const branchNew = await this.branchRepository.findById(data.branchId, manager);
                changedContent += `Chi nhánh: ${branchOld?.name || "----"} -> ${branchNew?.name || "----"} \n`;

                if (data.branchId !== dataOld.branchId) {
                  await this.syncBranchManagerOrderLeader(data.id, dataOld.branchId, data.branchId, manager);

                  //? Re-sync Order.branchManagerId theo manager chi nhánh mới
                  if (branchNew && branchNew.employeeId) {
                    const newBranchManagerId = branchNew.employeeId;
                    if (data.branchManagerId !== newBranchManagerId) {
                      data.branchManagerId = newBranchManagerId;
                      await this.orderRepository.update(data.id, { branchManagerId: newBranchManagerId }, manager);
                    }

                    if (newBranchManagerId) {
                      const employee = await this.employeeRepository.findById(newBranchManagerId, manager);
                      changedContent += `Quản lý chi nhánh: ${employee?.name || "----"} \n`;
                    } else {
                      changedContent += `Quản lý chi nhánh: ---- \n`;
                    }
                  }
                }

                break;
              case "employeeCount":
                changedContent += `Số lượng nhân viên: ${dataOld.employeeCount || "----"} -> ${data.employeeCount || "----"} \n`;
                break;
              case "discountPercent":
                changedContent += `Phần trăm giảm giá: ${dataOld.discountPercent || "----"} -> ${data.discountPercent || "----"} \n`;
                break;
              case "referrerId":
                const referrerOld = await this.employeeRepository.findById(dataOld.referrerId!, manager);
                const referrerNew = await this.employeeRepository.findById(data.referrerId!, manager);
                changedContent += `Nhân viên giới thiệu: ${referrerOld?.name || "----"} -> ${referrerNew?.name || "----"} \n`;
                break;
              case "allocateRevenuePercent":
                changedContent += `Phần trăm phân bổ doanh thu cho quản lý chi nhánh: ${dataOld.allocateRevenuePercent ?? "----"} -> ${data.allocateRevenuePercent ?? "----"} \n`;
                break;
              case "referrerPercent":
                changedContent += `Phần trăm hoa hồng cho nhân viên giới thiệu: ${dataOld.referrerPercent || "----"} -> ${data.referrerPercent || "----"} \n`;
                break;
              case "referrerAmount":
                changedContent += `Số tiền hoa hồng cho nhân viên giới thiệu: ${dataOld.referrerAmount || "----"} -> ${data.referrerAmount || "----"} \n`;
                break;
              case "vat":
                changedContent += `Thuế VAT: ${dataOld.vat || "----"} -> ${data.vat || "----"} \n`;
                break;
              case "address":
                changedContent += `Địa chỉ: ${dataOld.address?.state || "----"}, ${dataOld.address?.ward || "----"}, ${dataOld.address?.detail || "----"} -> ${data.address?.state || "----"}, ${data.address?.ward || "----"}, ${data.address?.detail || "----"} \n`;
                break;
              case "link":
                changedContent += `Link hợp đồng: ${dataOld.link || "----"} -> ${data.link || "----"} \n`;
                break;
              case "note":
                changedContent += `Ghi chú: ${dataOld.note || "----"} -> ${data.note || "----"} \n`;
                break;
              case "isUrgent":
                const urgentOld = dataOld.isUrgent ? "Đơn gấp" : "Đơn thường";
                const urgentNew = data.isUrgent ? "Đơn gấp" : "Đơn thường";
                changedContent += `Loại đơn: ${urgentOld} -> ${urgentNew} \n`;
                break;
              case "branchManagerId":
                if (data.branchManagerId !== dataOld.branchManagerId) {
                  // Xóa bản ghi orderLeader cũ của branchManagerId (position = BRANCH_MANAGER)
                  if (dataOld.branchManagerId) {
                    const oldBranchManagerLeader = await this.orderLeaderRepository.findByOption(
                      {
                        where: {
                          orderId: data.id,
                          employeeId: dataOld.branchManagerId,
                          position: PositionDefaultEnum.BRANCH_MANAGER,
                        },
                      },
                      manager,
                    );
                    if (oldBranchManagerLeader) {
                      await this.orderLeaderRepository.softDelete(oldBranchManagerLeader.id, manager);
                    }
                  }

                  // Thêm bản ghi orderLeader mới cho branchManagerId
                  if (data.branchManagerId) {
                    // Tính revenueShare = order.amount - tổng revenueShare các bản ghi position = 'Quản lý chi nhánh' còn lại
                    const existingBranchManagerTotal = await this.orderLeaderRepository.sumByOptions(
                      "revenueShare",
                      {
                        where: {
                          orderId: data.id,
                          position: PositionDefaultEnum.BRANCH_MANAGER,
                        },
                      } as any,
                      manager,
                    );
                    const newRevenueShare = (data.amount || dataOld.amount || 0) - existingBranchManagerTotal;
                    const dataCreateOrderLeader: CreateOrderLeaderDto = {
                      position: PositionDefaultEnum.BRANCH_MANAGER,
                      orderId: data.id,
                      employeeId: data.branchManagerId,
                      revenueShare: Math.max(0, newRevenueShare),
                    };
                    await this.orderLeaderRepository.create(dataCreateOrderLeader, manager);

                    const newManager = await this.employeeRepository.findById(data.branchManagerId, manager);
                    changedContent += `Quản lý chi nhánh: ${newManager?.name || "----"}\n`;

                    // Gắn quản lý chi nhánh mới vào chat nếu đơn liên kết service order
                    if (data.serviceOrderId) {
                      await this.addEmployeeUserToChatIfNeeded(data.serviceOrderId, data.branchManagerId, manager);
                    }
                  } else {
                    changedContent += `Quản lý chi nhánh: ----\n`;
                  }
                }
                break;
              default:
                changedContent += `${field}: ${dataOld[field as keyof Order]} -> ${data[field as keyof Order]} \n`;
            }
          }
        }

        content = `Hợp đồng đã có thay đổi:\n   ${changedContent}`;
      }
    }

    //$ create comment if update
    await this.orderCommentService.create(
      {
        orderId: data.id,
        userId: null,
        content: content,
      },
      undefined,
      manager,
    );

    await this.calculateOrderData.process(data.id, manager);
  }

  async validateBeforeDelete(id: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const existingOrder = await this.orderRepository.findById(id, manager);
    if (!existingOrder) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    if (existingOrder.isPaid) {
      throw new BadRequestError(
        "Không thể xóa hợp đồng đã được thanh toán đầy đủ, vui lòng xóa hết các phiếu thu liên quan đến hợp đồng này trước khi xóa hợp đồng",
      );
    }
  }

  async actionAfterDelete(data: Order, req?: Request, manager?: IEntityManager): Promise<void> {
    // xóa hết các công nợ liên quan đến hợp đồng này
    await this.debtRepository.deleteFromOrder(data.id, manager);

    // Xóa tất cả TimeKeeping liên quan đến các OrderEmployee của Order này
    // Vì database cascade sẽ xóa OrderEmployee, nhưng không trigger TypeORM hooks
    // nên phải xóa TimeKeeping thủ công trước

    // Lấy danh sách orderEmployeeIds từ data.orderEmployees (eager loaded)
    if (data.orderEmployees && data.orderEmployees.length > 0) {
      const orderEmployeeIds = data.orderEmployees.map((oe) => oe.id);

      // Xóa tất cả TimeKeeping có orderEmployeeId trong danh sách
      await this.timeKeepingRepository.getRepository(manager).delete({
        orderEmployeeId: In(orderEmployeeIds),
      });
    }

    // TimeKeeping thưởng liên quan đến hợp đồng (referrerOrderId) đã được xóa ở
    // OrderRepository.cleanupReferencesBeforeDelete (trước khi xóa Order).
    // Không xóa ở đây vì lúc này referrerOrderId đã bị cleanup xử lý rồi.

    //? xóa hết các phiếu thu liên quan đến hợp đồng này
    await this.financeService.deleteFromOrder(data.id, req, manager);

    //? xóa hết các comment liên quan đến hợp đồng này
    await this.orderCommentService.deleteFromOrder(data.id, req, manager);

    //? xóa chat riêng của quản lý và checkpoint đã đọc
    await this.orderLeaderChatService.deleteFromOrder(data.id, manager);

    //? xóa hết các nhân viên liên quan đến hợp đồng này
    await this.orderEmployeeService.deleteFromOrder(data.id, req, manager);

    //? tìm service order liên quan và chuyển trạng thái về chờ xác nhận từ nhân viên
    if (data.serviceOrderId) {
      await this.serviceOrderRepository.update(
        data.serviceOrderId,
        { status: ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION },
        manager,
      );
    }
  }

  private async syncOrderLeaders(
    orderId: string,
    requestedOrderLeaders: Array<{ employeeId: string }>,
    manager?: IEntityManager,
  ): Promise<void> {
    const entityManager = this.orderRepository.getRepository(manager).manager;
    const orderLeaderRepository = entityManager.getRepository(OrderLeader);

    const uniqueLeaderIds = Array.from(
      new Set(requestedOrderLeaders.map((leader) => leader.employeeId).filter(Boolean)),
    );

    const existingOrderLeaders = await orderLeaderRepository.find({
      where: { orderId } as any,
    });

    const existingLeaderIds = existingOrderLeaders.map((leader) => leader.employeeId);
    const leadersToRemove = existingOrderLeaders.filter((leader) => !uniqueLeaderIds.includes(leader.employeeId));
    const leaderIdsToAdd = uniqueLeaderIds.filter((employeeId) => !existingLeaderIds.includes(employeeId));

    for (const leader of leadersToRemove) {
      await orderLeaderRepository.softDelete(leader.id);
    }

    for (const employeeId of leaderIdsToAdd) {
      await orderLeaderRepository.save(
        orderLeaderRepository.create({
          orderId,
          employeeId,
        }),
      );
    }
  }

  private async syncBranchManagerOrderLeader(
    orderId: string,
    oldBranchId: string,
    newBranchId: string,
    manager?: IEntityManager,
  ): Promise<void> {
    const [oldBranch, newBranch] = await Promise.all([
      this.branchRepository.findById(oldBranchId, manager),
      this.branchRepository.findById(newBranchId, manager),
    ]);

    const oldBranchManagerId = oldBranch?.employeeId;
    const newBranchManagerId = newBranch?.employeeId;

    if (oldBranchManagerId && oldBranchManagerId !== newBranchManagerId) {
      const oldBranchManagerOrderLeader = await this.orderLeaderRepository.findByOption(
        {
          where: {
            orderId,
            employeeId: oldBranchManagerId,
          },
        },
        manager,
      );

      if (oldBranchManagerOrderLeader) {
        await this.orderLeaderRepository.softDelete(oldBranchManagerOrderLeader.id, manager);
      }
    }

    if (newBranchManagerId) {
      const newBranchManagerOrderLeader = await this.orderLeaderRepository.findByOption(
        {
          where: {
            orderId,
            employeeId: newBranchManagerId,
          },
        },
        manager,
      );

      if (!newBranchManagerOrderLeader) {
        await this.orderLeaderRepository.create(
          {
            orderId,
            employeeId: newBranchManagerId,
          },
          manager,
        );
      }
    }
  }

  /**
   * Xác nhận bắt đầu thực hiện hợp đồng
   * @param orderId
   * @param req
   * @param manager
   * @returns
   */
  async startOrder(orderId: string, req: Request, manager?: IEntityManager): Promise<ApiResponse<void>> {
    const order = await this.orderRepository
      .getRepository(manager)
      .createQueryBuilder("entity")
      .setLock("pessimistic_write") // SELECT FOR UPDATE
      .where("entity.id = :id", { id: orderId })
      .andWhere("entity.deletedAt IS NULL")
      .getOne();

    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BadRequestError("Chỉ có thể bắt đầu hợp đồng ở trạng thái Đang chờ");
    }

    await this.orderRepository.update(orderId, { status: OrderStatusEnum.PROCESSING }, manager);

    await this.orderCommentService.create(
      {
        orderId: orderId,
        userId: null,
        content: `Hợp đồng đã bắt đầu xử lý.`,
      },
      undefined,
      manager,
    );

    //? cập nhật trạng thái của tất cả nhân viên tham gia vào hợp đồng này thành đang làm việc
    await this.employeeRepository.updateEmployeeStatusByOrder(orderId, manager);

    //? cập nhật giờ làm việc bắt đầu cho tất cả nhân viên trong hợp đồng
    // await this.orderEmployeeService.updateStartTime(orderId, manager);

    //? cập nhật trạng thái order service tương ứng nếu có
    if (order.serviceOrderId) {
      await this.serviceOrderRepository.update(
        order.serviceOrderId,
        { status: ServiceOrderStatusEnum.PROCESSING },
        manager,
      );
    }

    await this.sendNotificationToCustomer(
      order.customerId,
      orderId,
      "Đơn hàng đã bắt đầu",
      `Đơn hàng ${order.code} đã bắt đầu được xử lý.`,
      "ORDER_STARTED",
      order.code,
    );

    return ApiResponseHandler.createSuccess("OK");
  }

  async confirmOrderCompletion(
    orderId: string,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ isNewlyConfirmed: boolean }>> {
    const employeeId = req?.user?.employeeId;
    if (!employeeId) {
      throw new ForbiddenError("Tài khoản không liên kết với nhân viên");
    }

    const orderEntityRepository = this.orderRepository.getRepository(manager);
    const order = await orderEntityRepository
      .createQueryBuilder("entity")
      .setLock("pessimistic_write")
      .where("entity.id = :id", { id: orderId })
      .andWhere("entity.deletedAt IS NULL")
      .getOne();

    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    if (order.status !== OrderStatusEnum.PROCESSING) {
      throw new BadRequestError("Chỉ có thể xác nhận hoàn thành khi đơn đang thực hiện");
    }

    const orderLeaderEmployee = await this.orderEmployeeRepository.findByOption(
      {
        where: {
          orderId,
          employeeId,
          isLeader: true,
        },
      },
      manager,
    );

    if (!orderLeaderEmployee) {
      throw new ForbiddenError("Chỉ nhân viên đầu cánh của hợp đồng mới có thể xác nhận hoàn thành");
    }

    if (order.completedAt || order.completedByEmployeeId) {
      if (order.completedByEmployeeId !== employeeId) {
        throw new BadRequestError("Hợp đồng đã được nhân viên đầu cánh khác xác nhận hoàn thành");
      }

      return ApiResponseHandler.createSuccess("OK", { isNewlyConfirmed: false });
    }

    const hasConfirmedEmployeesWithoutCheckout =
      await this.orderEmployeeRepository.hasConfirmedEmployeesWithoutCheckout(orderId, manager);
    if (hasConfirmedEmployeesWithoutCheckout) {
      throw new BadRequestError(
        "Tất cả nhân viên đã xác nhận tham gia hợp đồng phải checkout trước khi xác nhận hoàn thành",
      );
    }

    await orderEntityRepository.update(orderId, {
      completedByEmployeeId: employeeId,
      completedAt: new Date(),
    });

    // kết thúc các điều hướng cho đơn hàng này
    await this.callNavigationService.stopCallNavigationByOrder(orderId, manager);

    return ApiResponseHandler.createSuccess("OK", { isNewlyConfirmed: true });
  }

  async notifyOrderCompletionConfirmed(orderId: string, req: Request): Promise<void> {
    const [order, orderLeaders, adminUsers] = await Promise.all([
      this.orderRepository.findByOption({ where: { id: orderId } }),
      this.orderLeaderRepository.findByOptions({ where: { orderId } }),
      this.userRepository.getRepository().find({
        where: { role: UserRoleEnum.ADMIN },
        select: { id: true },
      }),
    ]);

    if (!order) {
      return;
    }

    const employeeIds = [
      ...new Set(
        [...orderLeaders.map((orderLeader) => orderLeader.employeeId), order.createdByEmployeeId].filter(
          (employeeId): employeeId is string => Boolean(employeeId),
        ),
      ),
    ];
    const employeeUsers = employeeIds.length
      ? await this.userRepository.getRepository().find({
          where: { employeeId: In(employeeIds) },
          select: { id: true },
        })
      : [];
    const userIds = [...new Set([...adminUsers, ...employeeUsers].map((user) => user.id))];

    if (userIds.length === 0) {
      return;
    }

    await this.notificationService.createNotificationForMultipleUsers(
      userIds,
      {
        title: "Đơn hoàn thành chờ duyệt",
        content: "Thông báo! Đơn hàng đã hoàn thành và đang chờ quản lý duyệt.",
        type: NotificationTypeEnum.ALERT,
        objectId: orderId,
        metadata: { orderId, orderCode: order.code, event: "ORDER_COMPLETION_CONFIRMED" },
      },
      undefined,
      { orderCode: order.code },
    );

    if (req.user?.employeeId) {
      const emp = await this.employeeRepository.findById(req.user?.employeeId);
      await this.orderCommentService.create(
        {
          orderId: orderId,
          userId: null,
          content: `Nhân viên ${emp?.zaloName || emp?.name || "đầu cánh"} đã xác nhận hoàn thành đơn hàng và đang chờ quản lý duyệt`,
        },
        undefined,
        undefined,
      );
    }
  }

  /**
   * Xác nhận hoàn thành hợp đồng, bao gồm các bước: kiểm tra hợp đồng có hợp lệ để hoàn thành không, cập nhật trạng thái hợp đồng thành đã hoàn thành, tạo comment trong hợp đồng để ghi nhận việc đã hoàn thành, cập nhật trạng thái của tất cả nhân viên tham gia vào hợp đồng này thành đang làm việc, tạo bản ghi công nợ nếu hợp đồng có giá trị phải thu
   * @param orderId
   * @param req
   * @param manager
   * @returns
   */
  async completeOrder(orderId: string, req: Request, manager?: IEntityManager): Promise<ApiResponse<void>> {
    const orderEntityRepository = this.orderRepository.getRepository(manager);
    const order = await orderEntityRepository
      .createQueryBuilder("entity")
      .setLock("pessimistic_write") // SELECT FOR UPDATE
      .where("entity.id = :id", { id: orderId })
      .andWhere("entity.deletedAt IS NULL")
      .getOne();

    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    if (order.status !== OrderStatusEnum.PROCESSING) {
      throw new BadRequestError("Chỉ có thể hoàn thành hợp đồng ở trạng thái Đang xử lý");
    }

    if (req.user?.role !== UserRoleEnum.ADMIN && (!order.completedByEmployeeId || !order.completedAt)) {
      throw new BadRequestError("Nhân viên đầu cánh phải xác nhận hoàn thành trước khi quản lý hoàn thành hợp đồng");
    }

    if (order.amount === 0 || order.amount === null) {
      throw new BadRequestError("Hợp đồng chưa có giá trị, không thể hoàn thành hợp đồng");
    }

    const hasEmployeesWithoutSalary = await this.orderEmployeeRepository.hasEmployeesWithoutSalary(orderId, manager);
    if (hasEmployeesWithoutSalary) {
      throw new BadRequestError("Có nhân viên chưa nhập lương, không thể hoàn thành hợp đồng");
    }

    // const employeeIds = await this.orderEmployeeService.updateEndTime(orderId, manager);

    //? cập nhật trạng thái hợp đồng thành đã hoàn thành
    await orderEntityRepository.update(orderId, { status: OrderStatusEnum.COMPLETED });
    await this.orderCommentService.create(
      {
        orderId: orderId,
        userId: null,
        content: `Hợp đồng đã hoàn thành.`,
      },
      undefined,
      manager,
    );

    const oes = await this.orderEmployeeRepository.findByOptions({
      where: {
        orderId: orderId,
      },
      select: {
        id: true,
        employeeId: true,
      },
    });

    const employeeIds = oes.map((oe) => oe.employeeId);

    await this.employeeRepository.updateEmployeeStatuses(employeeIds, manager);

    await this.calculateOrderData.process(orderId, manager);

    return ApiResponseHandler.createSuccess("OK");
  }

  /**
   * Hủy hợp đồng, bao gồm các bước: kiểm tra hợp đồng có hợp lệ để hủy không, cập nhật trạng thái hợp đồng thành đã hủy, tạo comment trong hợp đồng để ghi nhận việc đã hủy, cập nhật trạng thái của tất cả nhân viên tham gia vào hợp đồng này thành đang làm việc, xóa bản ghi công nợ trong bảng debt nếu có
   * @param orderId
   * @param req
   * @param manager
   * @returns
   */
  async cancelOrder(orderId: string, req: Request, manager?: IEntityManager): Promise<ApiResponse<void>> {
    const order = await this.orderRepository
      .getRepository(manager)
      .createQueryBuilder("entity")
      .setLock("pessimistic_write") // SELECT FOR UPDATE
      .where("entity.id = :id", { id: orderId })
      .andWhere("entity.deletedAt IS NULL")
      .getOne();

    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    if (order.status === OrderStatusEnum.COMPLETED || order.status === OrderStatusEnum.CANCELED) {
      throw new BadRequestError("Không thể hủy hợp đồng đã hoàn thành hoặc đã hủy");
    }

    await this.orderRepository.update(orderId, { status: OrderStatusEnum.CANCELED }, manager);
    await this.callNavigationService.stopCallNavigationByOrder(orderId, manager);
    await this.orderCommentService.create(
      {
        orderId: orderId,
        userId: null,
        content: `Hợp đồng đã bị hủy.`,
      },
      undefined,
      manager,
    );
    //? cập nhật trạng thái của tất cả nhân viên tham gia vào hợp đồng này thành đang làm việc
    await this.employeeRepository.updateEmployeeStatusByOrder(orderId, manager);

    //? xóa bản ghi công nợ trong bảng debt
    await this.debtRepository.deleteFromOrder(orderId, manager);

    if (order.serviceOrderId) {
      await this.serviceOrderRepository.update(
        order.serviceOrderId,
        { status: ServiceOrderStatusEnum.CANCELED },
        manager,
      );
    }

    return ApiResponseHandler.createSuccess("OK");
  }

  /**
   * Xác nhận thanh toán đầy đủ cho hợp đồng, bao gồm: tạo phiếu thu nếu còn tiền phải thu, cập nhật trạng thái đã thanh toán đầy đủ cho hợp đồng, tạo comment trong hợp đồng để ghi nhận việc đã thanh toán đầy đủ
   * @param orderId
   * @param req
   * @param manager
   * @returns
   */
  async confirmOrderPaymentAll(orderId: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<void>> {
    const order = await this.orderRepository.findById(orderId, manager);
    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    if (order.isPaid) {
      throw new BadRequestError("Hợp đồng đã được thanh toán đầy đủ");
    }

    if (order.amount === 0 || order.amount === null) {
      throw new BadRequestError("Hợp đồng chưa có giá trị, không thể xác nhận thanh toán");
    }

    //? nếu hợp đồng đã hủy thì không thể xác nhận thanh toán
    if (order.status === OrderStatusEnum.CANCELED) {
      throw new BadRequestError("Không thể xác nhận thanh toán hợp đồng đã bị hủy");
    }

    //tính xem hợp đồng đã thanh toán bao nhiêu
    const totalIncome = await this.orderRepository.getTotalIncomeByOrderId(orderId, manager);

    const remainingAmount = order.amount - totalIncome;

    //? tạo phiếu thu nốt số tiền còn lại
    if (remainingAmount > 0) {
      const dataCreateFinance: CreateFinanceDto = {
        branchId: order.branchId,
        customerId: order.customerId,
        type: FinanceTypeEnum.INCOME,
        category: "Thu tiền tự động từ hợp đồng",
        amount: remainingAmount,
        timeAt: new Date(),
        orderPayments: [
          {
            orderId: order.id,
            amount: remainingAmount,
          },
        ],
        isDeposit: false,
        note: `Thu nốt tiền từ - Hợp đồng ${order.code}`,
      };
      await this.financeService.create(dataCreateFinance, req, manager, FinanceCreationSourceEnum.SYSTEM);
    }

    //? đánh dấu hợp đồng đã thanh toán đầy đủ
    await this.orderRepository.update(orderId, { isPaid: true }, manager);

    //? tạo comment trong hợp đồng
    await this.orderCommentService.create(
      {
        orderId: orderId,
        userId: null,
        content: `Hợp đồng đã được xác nhận thanh toán đầy đủ từ ${req?.user?.username || "hệ thống"}`,
      },
      undefined,
      manager,
    );

    return ApiResponseHandler.createSuccess("OK");
  }

  /**
   *  Xuất báo giá hợp đồng ra file PDF, bao gồm các bước: kiểm tra hợp đồng có tồn tại không, gọi handle để render dữ liệu hợp đồng ra HTML, gọi API của PDF Tool để tạo file PDF từ HTML, trả về đường dẫn file PDF đã tạo
   * @param orderId
   * @param req
   * @param manager
   * @returns
   */
  async exportBill(orderId: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<string>> {
    const order = await this.orderRepository.findById(orderId, manager);
    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    const details = await this.orderDetailService.findByOptions({ where: { orderId } }, req, manager);

    if (details.success && details.data.length === 0) {
      throw new BadRequestError("Hợp đồng chưa có chi tiết, không thể xuất báo giá");
    }

    const dataHtml = exportBillHandle(order);

    //? write to pdf file
    const api = config.API_PDF_TOOL;

    try {
      const requestBody = {
        content: dataHtml,
        fileName: "invoice_" + order.code + ".pdf",
        format: "A4",
        printBackground: true,
        landscape: false,
      };

      const response = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi tạo file PDF: ${response.status} ${response.statusText}. Chi tiết: ${errorText}`);
      }

      // Parse JSON response để lấy URL file
      const result = (await response.json()) as {
        statusCode: number;
        success: boolean;
        message: string;
        data: { url: string };
      };
      const fileUrl = result.data?.url || "";

      if (!fileUrl) {
        throw new Error("API PDF Tool không trả về đường dẫn file");
      }

      // Tạo full URL nếu cần (nếu API trả về relative path)
      const fullUrl = fileUrl.startsWith("http")
        ? fileUrl
        : `${config.API_PDF_TOOL.replace("/v1/tools/generate-pdf", "")}/${fileUrl}`;

      return ApiResponseHandler.createSuccess("OK", fullUrl);
    } catch (error: any) {
      // Kiểm tra các loại lỗi khác nhau
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(`Không thể kết nối đến API PDF Tool (${api}). Vui lòng kiểm tra cấu hình API_PDF_TOOL.`);
      }

      throw error;
    }
  }

  async getUnreadCommentCount(orderId: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<number>> {
    // Implement the logic to get unread comment count for the order
    const count = await this.orderCommentService.countUnreadComments(orderId, req, manager);
    return count;
  }

  /**
   * Tạo mã QR code để thanh toán chuyển khoản qua ngân hàng
   * @param orderId
   * @param req
   * @param manager
   * @returns
   */
  async createQRCodeBankTransfer(
    orderId: string,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<string>> {
    const order = await this.orderRepository.findById(orderId, manager);
    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    // tìm tài khảon mặc định để chuyển khoản
    const bankAccount = await this.fundRepository.findDefaultFund(manager);
    if (!bankAccount) {
      throw new BadRequestError("Chưa có tài khoản ngân hàng để chuyển khoản");
    }

    //? tạo mã QR code để hiển thị cho nhân viên quét thanh toán
    const generatorCodePayment = (amount: number, purpose: string) => {
      const qrPay = QrPay.vietQR({
        bin: bankAccount.bin!,
        bankNumber: bankAccount.accountNumber,
        // amount: `${amount}`, // Với amount được set, initMethod sẽ là "11" (fixed)
        service: VietQRService.byAccountNumber,
        purpose: purpose,
      });

      // initMethod = "11" nghĩa là số tiền đã được khóa theo chuẩn VietQR
      // Nếu app ngân hàng vẫn cho sửa, đó là do app không tuân thủ chuẩn
      return qrPay.build();
    };

    const qrCode = generatorCodePayment(order.amount, order.code);

    return ApiResponseHandler.getSuccess("OK", qrCode);
  }

  async getAllUnpaidOrdersByCustomer(
    customerId: string,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<Order[]>> {
    const orders = await this.orderRepository.getAllUnpaidOrdersByCustomer(customerId, manager);

    return ApiResponseHandler.getSuccess("OK", orders);
  }

  async checkIn(orderId: string, req?: Request): Promise<ApiResponse<void>> {
    const payload = req?.body as AdminOrderCheckInDto;
    const employeeId = req?.user?.employeeId;

    if (!employeeId) {
      throw new ForbiddenError("Tài khoản không liên kết với nhân viên");
    }

    await this.transactionManager.withTransactionCallback(async (manager) => {
      const order = await this.orderRepository
        .getRepository(manager)
        .createQueryBuilder("entity")
        .setLock("pessimistic_write")
        .where("entity.id = :id", { id: orderId })
        .andWhere("entity.deletedAt IS NULL")
        .getOne();

      if (!order) {
        throw new BadRequestError("Không tìm thấy hợp đồng");
      }

      if (order.status !== OrderStatusEnum.PROCESSING && order.status !== OrderStatusEnum.PENDING) {
        throw new BadRequestError("Chỉ có thể checkin khi đơn chuẩn bị hoặc đang thực hiện");
      }

      const thresholdMeters = await this.appSettingRepository.getCheckInDistanceThreshold();
      const checkInResult = evaluateServiceOrderCheckIn({
        employeeLocation: {
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
        addresses: [order.address],
        thresholdMeters,
      });

      if (!Number.isFinite(checkInResult.nearestDistanceMeters)) {
        throw new BadRequestError("Đơn hàng chưa có tọa độ nơi làm việc để checkin");
      }

      if (!checkInResult.isWithinThreshold) {
        throw new BadRequestError(
          `Vị trí checkin cách nơi làm việc gần nhất ${Math.round(checkInResult.nearestDistanceMeters)}m, vượt quá sai số cho phép ${thresholdMeters}m`,
        );
      }

      await this.orderEmployeeService.checkIn(
        orderId,
        employeeId,
        {
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
        manager,
      );
    });

    const [notificationResult] = await Promise.allSettled([
      this.orderEmployeeService.notifyOrderEmployeeCheckIn(orderId, employeeId),
    ]);
    if (notificationResult.status === "rejected") {
      logger.error("Order employee check-in notification failed", {
        orderId,
        employeeId,
        error:
          notificationResult.reason instanceof Error
            ? notificationResult.reason.message
            : String(notificationResult.reason),
      });
    }

    // await this.emitToCustomer({ id, customerId, status: ServiceOrderStatusEnum.PROCESSING }, "PROCESSING");
    return ApiResponseHandler.createSuccess("OK");
  }
}
