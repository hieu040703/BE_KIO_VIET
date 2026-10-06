import { injectable, inject } from "inversify";
import { Request } from "express";
import { BaseService } from "@/shared/base/BaseService";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { SERVICE_ORDER_TYPES } from "./serviceOrder.types";
import { COMMON_TYPES } from "../common/common.types";
import { ServiceOrder } from "@/database/models/ServiceOrder";
import { ServiceOrderRelations, ServiceOrderSelectFull } from "./serviceOrder.select";
import { ApiResponse } from "@/shared/types/interfaces";
import {
  NotificationTypeEnum,
  OrderStatusEnum,
  ServiceOrderStatusEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { BadRequestError } from "@/shared/types/errors";
import { ORDER_TYPES } from "../order/order.types";
import { OrderService } from "../order/order.service";
import { CreateOrderDto } from "../order/order.validator";
import { ConfirmServiceOrderDto } from "./serviceOrder.validator";
import { SERVICE_ORDER_CHAT_TYPES } from "./chat/serviceOrderChat.types";
import { ServiceOrderChatService } from "./chat/serviceOrderChat.service";
import { IEntityManager } from "@/shared/types/interfaces";
import { UserRepository } from "../user/user.repository";
import { USER_TYPES } from "../user/user.types";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { NotificationService } from "../notification/notification.service";
import { NOTIFICATION_TYPES } from "../notification/notification.types";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import { formatOrderNotificationTitle } from "@/shared/utils/notification.utils";
import { AdminServiceOrderRepository } from "./admin.serviceOrder.repository";
import { GOONG_MAP_TYPES } from "../goongMap/goongMap.types";
import { GoongMapService } from "../goongMap/goongMap.service";
import { CUSTOMER_TYPES } from "../customer/customer.types";
import { CustomerRepository } from "../customer/customer.repository";
import { CodeService } from "../common/code.service";
import { VOUCHERS_TYPES } from "../vouchers/vouchers.types";
import { VouchersRepository } from "../vouchers/vouchers.repository";
import {
  buildServiceOrderPricing,
  isUrgentServiceOrder,
  mapServiceOrderQuoteToOrderPricing,
} from "./serviceOrder.pricing";
import { APP_SETTING_TYPES } from "../appSetting/appSetting.types";
import { AppSettingRepository } from "../appSetting/appSetting.repository";
import { AdminServiceOrderCheckInDto } from "./serviceOrder.validator";
import { evaluateServiceOrderCheckIn } from "./serviceOrder.checkin";
import { Order } from "@/database/models/Order";
import { Ticket } from "@/database/models/Ticket";
import { VouchersTemplate } from "@/database/models/VouchersTemplate";
import { resolveVoucherDiscountAmount } from "./serviceOrder.voucher";
import dayjs from "dayjs";
import { ORDER_EMPLOYEE_TYPES } from "../order/orderEmployee/orderEmployee.types";
import { OrderEmployeeService } from "../order/orderEmployee/orderEmployee.service";

@injectable()
export class AdminServiceOrderService extends BaseService<ServiceOrder> {
  protected relations = ServiceOrderRelations;
  protected selectedFields = ServiceOrderSelectFull;
  protected selectedFieldsForList = ServiceOrderSelectFull;
  protected searchableFields = ["contactName", "contactPhone"] as (keyof ServiceOrder)[] & string[];
  protected timeField: keyof ServiceOrder & string = "timeAt";

  constructor(
    @inject(SERVICE_ORDER_TYPES.AdminServiceOrderRepository)
    private serviceOrderRepository: AdminServiceOrderRepository,
    @inject(COMMON_TYPES.TransactionManager)
    private transactionManager: TransactionManager,
    @inject(ORDER_TYPES.OrderService)
    private orderService: OrderService,
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeService)
    private orderEmployeeService: OrderEmployeeService,
    @inject(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatService)
    private readonly serviceOrderChatService: ServiceOrderChatService,
    @inject(USER_TYPES.UserRepository)
    private readonly userRepository: UserRepository,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private readonly notificationService: NotificationService,
    @inject(GOONG_MAP_TYPES.GoongMapService)
    private readonly goongMapService: GoongMapService,
    @inject(CUSTOMER_TYPES.CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @inject(COMMON_TYPES.CodeService)
    private readonly codeService: CodeService,
    @inject(VOUCHERS_TYPES.VouchersRepository)
    private readonly vouchersRepository: VouchersRepository,
    @inject(APP_SETTING_TYPES.AppSettingRepository)
    private readonly appSettingRepository: AppSettingRepository,
  ) {
    super(serviceOrderRepository);
  }

  private async emitToCustomer(
    serviceOrder: Pick<ServiceOrder, "id" | "status" | "customerId">,
    event: string,
  ): Promise<void> {
    if (!serviceOrder.customerId) return;
    const userId = await this.userRepository.findUserIdByCustomerId(serviceOrder.customerId);
    if (!userId) return;
    SocketUtils.sendSocketToUser("service-order:updated", userId, {
      serviceOrderId: serviceOrder.id,
      status: serviceOrder.status,
      event,
    });
  }

  private async sendNotificationToCustomer(
    customerId: string,
    serviceOrderId: string,
    title: string,
    content: string,
    event: string,
    orderCode?: string | null,
  ): Promise<void> {
    const userId = await this.userRepository.findUserIdByCustomerId(customerId);
    if (!userId) return;
    const notificationTitle = formatOrderNotificationTitle(orderCode, title);
    await this.notificationService.createNotificationForMultipleUsers(
      [userId],
      {
        title: notificationTitle,
        content,
        type: NotificationTypeEnum.SYSTEM,
        objectId: serviceOrderId,
        metadata: { serviceOrderId, event, ...(orderCode ? { orderCode } : {}) },
      },
      undefined,
      { orderCode },
    );
    FirebaseUtils.SentFirebaseWithUser({
      userId,
      orderCode,
      title: notificationTitle,
      content,
      data: { type: NotificationTypeEnum.SYSTEM, serviceOrderId, event },
    });
  }

  private async sendCancelNotificationToAdmins(serviceOrderId: string): Promise<void> {
    const adminUserIds = await this.userRepository.findAllAdminUserIds();

    if (adminUserIds.length === 0) return;

    await this.notificationService.createNotificationForMultipleUsers(
      adminUserIds,
      {
        title: "Đơn dịch vụ đã bị hủy",
        content:
          "Đơn đã được hủy và đã bỏ gán chi nhánh/nhân viên. Vui lòng phân công lại chi nhánh phù hợp để tiếp nhận.",
        type: NotificationTypeEnum.SYSTEM,
        objectId: serviceOrderId,
        metadata: { serviceOrderId, event: "CANCELED_NEED_REASSIGN" },
      },
      undefined,
      {
        sendFirebase: true,
      },
    );
  }

  async validateBeforeUpdate(
    id: string,
    data: Partial<ServiceOrder>,
    _req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    if (data.timeAt === undefined) {
      return;
    }

    const current = await this.serviceOrderRepository.findById(id, manager);
    if (!current) {
      return;
    }

    const currentTimeAt = this.normalizeDate(current.timeAt)?.getTime() ?? null;
    const nextTimeAt = this.normalizeDate(data.timeAt)?.getTime() ?? null;

    if (currentTimeAt !== nextTimeAt) {
      data.orderStartNotificationSentAt = null;
    }
  }

  async update(
    id: string,
    data: Partial<ServiceOrder>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<ServiceOrder>> {
    const current = await this.serviceOrderRepository.findById(id, manager);
    if (!current) {
      throw new BadRequestError("Không tìm thấy đơn khách hàng");
    }
    const releasedVoucherId =
      data.status === ServiceOrderStatusEnum.CANCELED && current.vouchersId ? current.vouchersId : null;

    if (
      data.quote ||
      data.timeAt !== undefined ||
      data.hasFragileItems !== undefined ||
      data.vouchersId !== undefined ||
      data.hasVat !== undefined ||
      data.vat !== undefined
    ) {
      await this.applyPricing(data, current, manager);
    }

    if (releasedVoucherId) {
      data.vouchersId = null;
    }

    const result = await super.update(id, data, req, manager);

    if (data.status && data.status !== current.status) {
      await this.serviceOrderChatService.createStatusChangedSystemMessage(id, current.status, data.status, manager);
      if (
        !(req as any)?.skipTrackingLifecycle &&
        [
          ServiceOrderStatusEnum.COMPLETED_BY_EMPLOYEE,
          ServiceOrderStatusEnum.COMPLETED_BY_CUSTOMER,
          ServiceOrderStatusEnum.CANCELED,
        ].includes(data.status)
      ) {
        await this.goongMapService.stopServiceOrderTracking(
          id,
          data.status === ServiceOrderStatusEnum.CANCELED ? "canceled" : "status_changed",
        );
      }
    }

    if (releasedVoucherId) {
      await this.vouchersRepository.update(releasedVoucherId, { isUsed: false, usedAt: null }, manager);
    }

    return result;
  }

  private async getVoucherDiscountAmount(current: ServiceOrder, manager?: IEntityManager): Promise<number> {
    const vouchersId = current.vouchersId;
    if (!vouchersId) return 0;
    const qb = this.vouchersRepository
      .getRepository(manager)
      .createQueryBuilder("voucher")
      .where("voucher.id = :id", { id: vouchersId })
      .andWhere("voucher.deletedAt IS NULL");
    if (manager) qb.setLock("pessimistic_write");
    const voucher = await qb.getOne();
    if (!voucher) throw new BadRequestError("Không tìm thấy phiếu giảm giá");
    const template = await this.vouchersRepository
      .getRepository(manager)
      .manager.getRepository(VouchersTemplate)
      .findOne({ where: { id: voucher.vouchersTemplateId } });
    if (!template) throw new BadRequestError("Không tìm thấy mẫu phiếu giảm giá");
    return resolveVoucherDiscountAmount({ voucher, customerId: current.customerId, templateAmount: template.amount });
  }

  private async applyPricing(
    data: Partial<ServiceOrder>,
    current: ServiceOrder,
    manager?: IEntityManager,
  ): Promise<void> {
    const settings = await this.appSettingRepository.getOrderPricingConfig();
    const isUrgent = isUrgentServiceOrder({
      enabled: settings.urgentOrderEnabled,
      urgentOrderHours: settings.urgentOrderHours,
      timeAt: this.normalizeDate(data.timeAt ?? current.timeAt)!,
    });
    const hasVat = data.hasVat ?? current.hasVat;
    const effectiveOrder = { ...current, ...data } as ServiceOrder;
    const voucherDiscountAmount = await this.getVoucherDiscountAmount(effectiveOrder, manager);
    const pricing = buildServiceOrderPricing({
      baseItems: data.quote ?? current.quote ?? [],
      isUrgent,
      urgentSurchargePercent: settings.urgentOrderSurchargePercent,
      hasFragileItems: data.hasFragileItems ?? current.hasFragileItems,
      fragileItemSurchargePercent: settings.fragileItemSurchargePercent,
      voucherDiscountAmount,
      hasVat,
      vat: settings.vat,
    });
    Object.assign(data, {
      isUrgent,
      quote: pricing.quote,
      basePrice: pricing.basePrice,
      preVatAmount: pricing.preVatAmount,
      vat: hasVat ? settings.vat : 0,
      vatAmount: pricing.vatAmount,
      amount: pricing.amount,
    });
  }

  //? Hủy đơn:
  //  - Admin (role = ADMIN): hủy hoàn toàn → status = CANCELED, clear branch + employee.
  //  - Quản lý chi nhánh (role = MANAGER): từ chối nhận → bỏ gán branch/branchManagerId,
  //    giữ nguyên status để admin phân công lại chi nhánh khác.
  async cancel(id: string, req?: Request): Promise<ApiResponse<ServiceOrder>> {
    let customerId!: string;
    const isAdmin = (req as any)?.user?.role === UserRoleEnum.ADMIN;

    const result = await this.transactionManager.withTransactionCallback(async (manager) => {
      const exist = await this.serviceOrderRepository.findById(id, manager);
      if (!exist) throw new BadRequestError("Không tìm thấy đơn khách hàng");

      customerId = exist.customerId;
      if (exist.status === ServiceOrderStatusEnum.CANCELED) {
        throw new BadRequestError("Đơn đã được hủy");
      }

      if (isAdmin) {
        return this.update(
          id,
          {
            status: ServiceOrderStatusEnum.CANCELED,
            branchId: null,
            employeeId: null,
          },
          req,
          manager,
        );
      }

      //? Quản lý chi nhánh từ chối nhận: chỉ bỏ gán branch/branchManagerId, giữ status.
      return this.update(
        id,
        {
          branchId: null,
          branchManagerId: null,
        },
        req,
        manager,
      );
    });

    if (isAdmin) {
      await this.emitToCustomer({ id, customerId, status: ServiceOrderStatusEnum.CANCELED }, "CANCELED");
      await this.sendNotificationToCustomer(
        customerId,
        id,
        "Đơn dịch vụ đã bị hủy",
        "Đơn dịch vụ của bạn đã bị hủy, vui lòng liên hệ với chúng tôi để biết thêm chi tiết.",
        "CANCELED",
      );
      await this.goongMapService.stopServiceOrderTracking(id, "canceled");
    } else {
      //? Quản lý chi nhánh từ chối → báo admin biết để phân công lại chi nhánh khác.
      await this.sendCancelNotificationToAdmins(id);
    }
    return result;
  }

  //? Step 2: Nhân viên gửi báo giá → PENDING → WAITING_FOR_QUOTE
  async submitQuote(id: string, req?: Request): Promise<ApiResponse<ServiceOrder>> {
    let customerId!: string;

    const result = await this.transactionManager.withTransactionCallback(async (manager) => {
      const exist = await this.serviceOrderRepository.findById(id, manager);
      if (!exist) throw new BadRequestError("Không tìm thấy đơn khách hàng");

      customerId = exist.customerId;

      const allowedStatuses = [
        ServiceOrderStatusEnum.WAITING_FOR_QUOTE,
        ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION,
      ];
      if (!allowedStatuses.includes(exist.status)) {
        throw new BadRequestError("Chỉ có thể gửi báo giá khi đơn đang ở trạng thái chờ báo giá hoặc chờ xác nhận");
      }

      if (!exist.quote || exist.quote.length === 0) {
        throw new BadRequestError("Đơn chưa có báo giá, vui lòng nhập báo giá trước khi gửi");
      }

      return this.update(
        id,
        {
          status: ServiceOrderStatusEnum.WAITING_FOR_CUSTOMER_CONFIRMATION,
        },
        req,
        manager,
      );
    });

    await this.emitToCustomer(
      { id, customerId, status: ServiceOrderStatusEnum.WAITING_FOR_CUSTOMER_CONFIRMATION },
      "QUOTE_SUBMITTED",
    );
    await this.sendNotificationToCustomer(
      customerId,
      id,
      "Báo giá dịch vụ",
      "Báo giá cho đơn dịch vụ của bạn đã được cập nhật, vui lòng kiểm tra và xác nhận.",
      "QUOTE_SUBMITTED",
    );
    return result;
  }

  //? Step 4: Nhân viên xác nhận đơn, phân bổ quản lý → (WAITING_FOR_EMPLOYEE_CONFIRMATION) → CONFIRMED + tạo Order
  async confirm(id: string, req?: Request): Promise<ApiResponse<ServiceOrder>> {
    const payload = req?.body as ConfirmServiceOrderDto;

    const result = await this.transactionManager.withTransactionCallback(async (manager) => {
      const exist = await this.serviceOrderRepository
        .getRepository(manager)
        .createQueryBuilder("entity")
        .setLock("pessimistic_write")
        .where("entity.id = :id", { id })
        .andWhere("entity.deletedAt IS NULL")
        .getOne();

      if (!exist) throw new BadRequestError("Không tìm thấy đơn khách hàng");

      if (exist.status !== ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION) {
        throw new BadRequestError(
          "Chỉ có thể xác nhận đơn khi đang ở trạng thái chờ xử lý hoặc khách hàng đã xác nhận báo giá",
        );
      }

      if (exist.amount == null) {
        throw new BadRequestError("Đơn chưa có tổng tiền, vui lòng cập nhật báo giá trước khi xác nhận");
      }

      // Voucher lock + validate: voucher chỉ bị "khóa" khi nhân viên xác nhận đơn
      // (status -> CONFIRMED). Acquire pessimistic_write để chống race khi 2 đơn
      // cùng tham chiếu 1 voucher trước khi đơn nào được confirm.
      let lockedVoucherId: string | null = null;
      if (exist.vouchersId) {
        const voucher = await this.vouchersRepository
          .getRepository(manager)
          .createQueryBuilder("voucher")
          .setLock("pessimistic_write")
          .where("voucher.id = :id", { id: exist.vouchersId })
          .andWhere("voucher.deletedAt IS NULL")
          .getOne();

        if (!voucher) {
          throw new BadRequestError("Không tìm thấy phiếu giảm giá");
        }
        if (voucher.isUsed) {
          throw new BadRequestError("Phiếu giảm giá đã được sử dụng");
        }
        if (voucher.expiredAt.getTime() < Date.now()) {
          throw new BadRequestError("Phiếu giảm giá đã hết hạn");
        }
        if (voucher.customerId !== exist.customerId) {
          throw new BadRequestError("Phiếu giảm giá không thuộc về khách hàng của đơn này");
        }
        lockedVoucherId = voucher.id;
      }

      const customer = await this.customerRepository.findById(exist.customerId, manager);
      if (!customer) {
        throw new BadRequestError("Không tìm thấy khách hàng");
      }

      const code = await this.codeService.getCode("Order", manager);
      const mappedPricing = mapServiceOrderQuoteToOrderPricing(exist.quote);

      const createOrderPayload: CreateOrderDto = {
        serviceOrderId: exist.id,
        branchId: payload.branchId,
        branchManagerId: payload.branchManagerId,
        code: code.data.code,
        name: `${customer.name} - ${exist.type.toUpperCase()} - ${dayjs(exist.timeAt).format("DD/MM/YYYY")}`,
        customerId: customer.id,
        timeAt: new Date(), //? đặt thời gian bắt đầu là thời điểm tạo đơn, có thể điều chỉnh sau nếu cần
        address: exist.address,
        deliveryAddress: exist.deliveryAddress || undefined,
        employeeCount: exist.employeeCount || 1,
        description: exist.description,
        vat: exist.vat,
        vatAmount: exist.vatAmount,
        discountAmount: mappedPricing.discountAmount,
        amount: exist.amount,
        status: OrderStatusEnum.PENDING,
        isUrgent: false,
      };

      // nếu có báo giá thì thêm dữ liệu chi tiết đơn hàng theo báo giá
      if (mappedPricing.details.length > 0) {
        Object.assign(createOrderPayload, { details: mappedPricing.details });
      }

      const createdOrder = await this.orderService.create(createOrderPayload, req, manager);

      if (payload.employeeId) {
        await this.orderEmployeeService.create(
          {
            orderId: createdOrder.data.id,
            employeeId: payload.employeeId,
            isLeader: true,
          },
          {
            ...req,
            params: { ...(req?.params || {}), orderId: createdOrder.data.id },
          } as unknown as Request,
          manager,
        );
      }

      await this.emitToCustomer(
        { id, customerId: customer.id, status: ServiceOrderStatusEnum.CONFIRMED },
        "ORDER_CONFIRMED",
      );
      await this.sendNotificationToCustomer(
        customer.id,
        id,
        "Đơn dịch vụ đã được xác nhận",
        "Đơn dịch vụ của bạn đã được xác nhận và đang được chuẩn bị thực hiện.",
        "ORDER_CONFIRMED",
        createdOrder.data.code,
      );

      return this.update(
        id,
        {
          status: ServiceOrderStatusEnum.CONFIRMED,
          branchId: payload.branchId,
          branchManagerId: payload.branchManagerId,
          employeeId: payload.employeeId,
        },
        req,
        manager,
      ).then(async (updateResult) => {
        // Mark voucher used SAU khi status -> CONFIRMED thành công, trong cùng
        // transaction để đảm bảo atomic với lệnh update ở trên.
        if (lockedVoucherId) {
          await this.vouchersRepository.update(lockedVoucherId, { isUsed: true, usedAt: new Date() }, manager);
        }
        return updateResult;
      });
    });

    await this.goongMapService.notifyServiceOrderAssigned(id);
    return result;
  }

  //? Step 5: Bắt đầu xử lý → CONFIRMED → PROCESSING
  async startProcessing(id: string, req?: Request): Promise<ApiResponse<ServiceOrder>> {
    let customerId!: string;

    const result = await this.transactionManager.withTransactionCallback(async (manager) => {
      const exist = await this.serviceOrderRepository.findById(id, manager);
      if (!exist) throw new BadRequestError("Không tìm thấy đơn khách hàng");

      customerId = exist.customerId;

      if (exist.status !== ServiceOrderStatusEnum.CONFIRMED) {
        throw new BadRequestError("Chỉ có thể bắt đầu xử lý khi đơn đã được xác nhận (CONFIRMED)");
      }

      return this.update(id, { status: ServiceOrderStatusEnum.PROCESSING }, req, manager);
    });

    await this.emitToCustomer({ id, customerId, status: ServiceOrderStatusEnum.PROCESSING }, "PROCESSING");
    return result;
  }

  async checkIn(id: string, req?: Request): Promise<ApiResponse<void>> {
    const payload = req?.body as AdminServiceOrderCheckInDto;
    let customerId!: string;

    const result = await this.transactionManager.withTransactionCallback(async (manager) => {
      const serviceOrder = await this.serviceOrderRepository
        .getRepository(manager)
        .createQueryBuilder("entity")
        .setLock("pessimistic_write")
        .where("entity.id = :id", { id })
        .andWhere("entity.deletedAt IS NULL")
        .getOne();

      if (!serviceOrder) {
        throw new BadRequestError("Không tìm thấy đơn khách hàng");
      }

      if (serviceOrder.status !== ServiceOrderStatusEnum.CONFIRMED) {
        throw new BadRequestError("Chỉ có thể checkin khi đơn đã được xác nhận (CONFIRMED)");
      }

      customerId = serviceOrder.customerId;

      const linkedOrder = await manager.getRepository(Order).findOne({
        where: {
          serviceOrderId: serviceOrder.id,
        },
        select: {
          id: true,
        },
      });

      if (!linkedOrder) {
        throw new BadRequestError("Đơn dịch vụ chưa có hợp đồng liên kết");
      }

      const thresholdMeters = await this.appSettingRepository.getCheckInDistanceThreshold();
      const checkInResult = evaluateServiceOrderCheckIn({
        employeeLocation: {
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
        addresses: [serviceOrder.address, serviceOrder.pickupAddress, serviceOrder.deliveryAddress],
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

      return this.orderService.startOrder(linkedOrder.id, req as Request, manager);
    });

    await this.emitToCustomer({ id, customerId, status: ServiceOrderStatusEnum.PROCESSING }, "PROCESSING");
    return result;
  }

  //? Step 6: Nhân viên xác nhận hoàn thành → PROCESSING → COMPLETED_BY_EMPLOYEE
  async completeByEmployee(id: string, req?: Request): Promise<ApiResponse<ServiceOrder>> {
    let customerId!: string;

    const result = await this.transactionManager.withTransactionCallback(async (manager) => {
      const exist = await this.serviceOrderRepository.findById(id, manager);
      if (!exist) throw new BadRequestError("Không tìm thấy đơn khách hàng");

      customerId = exist.customerId;

      if (exist.status !== ServiceOrderStatusEnum.PROCESSING) {
        throw new BadRequestError("Chỉ có thể xác nhận hoàn thành khi đơn đang ở trạng thái xử lý (PROCESSING)");
      }

      Object.assign(req || {}, { skipTrackingLifecycle: true });
      return this.update(id, { status: ServiceOrderStatusEnum.COMPLETED_BY_EMPLOYEE }, req, manager);
    });

    await this.emitToCustomer(
      { id, customerId, status: ServiceOrderStatusEnum.COMPLETED_BY_EMPLOYEE },
      "COMPLETED_BY_EMPLOYEE",
    );
    await this.goongMapService.stopServiceOrderTracking(id, "completed");
    return result;
  }

  // async delete(id: string, req?: Request, _manager?: IEntityManager): Promise<ApiResponse<Boolean>> {
  //   void _manager;

  //   return this.transactionManager.withTransactionCallback(async (manager) => {
  //     await manager.getRepository(Ticket).update({ serviceOrderId: id }, { serviceOrderId: null });
  //     return super.delete(id, req, manager);
  //   });
  // }
}
