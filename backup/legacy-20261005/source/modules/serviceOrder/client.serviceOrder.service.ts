import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { SERVICE_ORDER_TYPES } from "./serviceOrder.types";
import { ServiceOrder } from "@/database/models/ServiceOrder";
import { ServiceOrderRelations, ServiceOrderSelectFull } from "./serviceOrder.select";
import { IEntityManager, ApiResponse } from "@/shared/types/interfaces";
import { Request } from "express";
import {
  CustomerConfirmCompletedServiceOrderDto,
  CustomerCreateServiceOrderDto,
  CustomerCreateServiceOrderRatingDto,
  CustomerEstimateServiceOrderPriceDto,
} from "./serviceOrder.validator";
import { NotificationTypeEnum, ServiceOrderStatusEnum, ServiceOrderTypeEnum } from "@/shared/constants/constance";
import { SERVICE_ORDER_CHAT_TYPES } from "./chat/serviceOrderChat.types";
import { ServiceOrderChatService } from "./chat/serviceOrderChat.service";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "@/shared/types/errors";
import { ORDER_TYPES } from "../order/order.types";
import { OrderRepository } from "../order/order.repository";
import { OrderService } from "../order/order.service";
import { Order } from "@/database/models/Order";
import { SERVICE_ORDER_RATING_TYPES } from "./serviceOrderRating/serviceOrderRating.types";
import { ServiceOrderRatingRepository } from "./serviceOrderRating/serviceOrderRating.repository";
import { ServiceOrderRating } from "@/database/models/OrderRating";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { DeepPartial, FindOptionsRelations, In } from "typeorm";
import { APP_SETTING_TYPES } from "../appSetting/appSetting.types";
import { AppSettingRepository } from "../appSetting/appSetting.repository";
import { UserRepository } from "../user/user.repository";
import { USER_TYPES } from "../user/user.types";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { NotificationService } from "../notification/notification.service";
import { NOTIFICATION_TYPES } from "../notification/notification.types";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import { formatOrderNotificationTitle } from "@/shared/utils/notification.utils";
import { BRANCH_TYPES } from "../branch/branch.types";
import { BranchRepository } from "../branch/branch.repository";
import { Branch } from "@/database/models/Branch";
import { IAddress } from "../common/common.validator";
import { GOONG_MAP_TYPES } from "../goongMap/goongMap.types";
import { GoongMapService } from "../goongMap/goongMap.service";
import { ClientServiceOrderRepository } from "./client.serviceOrder.repository";
import { COMMON_TYPES } from "../common/common.types";
import { CodeService } from "../common/code.service";
import { VOUCHERS_TYPES } from "../vouchers/vouchers.types";
import { VouchersRepository } from "../vouchers/vouchers.repository";
import {
  buildServiceOrderPricing,
  calculateEstimatedServiceOrderPrice,
  EstimatedServiceOrderPriceResult,
  isUrgentServiceOrder,
} from "./serviceOrder.pricing";
import { resolveVoucherDiscountAmount } from "./serviceOrder.voucher";
import { VouchersTemplate } from "@/database/models/VouchersTemplate";
import { SERVICE_TYPES } from "../service/service.types";
import { ServiceRepository } from "../service/service.repository";
import { SERVICE_PRICE_TYPES } from "../service/servicePrice/servicePrice.types";
import { ServicePriceRepository } from "../service/servicePrice/servicePrice.repository";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type BranchDistanceCandidate = {
  branch: Pick<Branch, "id" | "name" | "employeeId" | "address">;
  aerialDistanceMeters: number;
  routeDistanceMeters?: number;
};

type GoongDirectionsData = {
  routes?: Array<{
    distance?: {
      value?: number;
    };
    legs?: Array<{
      distance?: {
        value?: number;
      };
    }>;
  }>;
};

@injectable()
export class ClientServiceOrderService extends BaseService<ServiceOrder> {
  protected relations = ServiceOrderRelations;
  protected selectedFields = ServiceOrderSelectFull;

  constructor(
    @inject(SERVICE_ORDER_TYPES.ClientServiceOrderRepository)
    private serviceOrderRepository: ClientServiceOrderRepository,
    @inject(ORDER_TYPES.OrderRepository)
    private readonly orderRepository: OrderRepository,
    @inject(ORDER_TYPES.OrderService)
    private readonly orderService: OrderService,
    @inject(SERVICE_ORDER_RATING_TYPES.ServiceOrderRatingRepository)
    private readonly serviceOrderRatingRepository: ServiceOrderRatingRepository,
    @inject(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatService)
    private readonly serviceOrderChatService: ServiceOrderChatService,
    @inject(APP_SETTING_TYPES.AppSettingRepository)
    private readonly appSettingRepository: AppSettingRepository,
    @inject(USER_TYPES.UserRepository)
    private readonly userRepository: UserRepository,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private readonly notificationService: NotificationService,
    @inject(BRANCH_TYPES.BranchRepository)
    private readonly branchRepository: BranchRepository,
    @inject(GOONG_MAP_TYPES.GoongMapService)
    private readonly goongMapService: GoongMapService,
    @inject(COMMON_TYPES.CodeService)
    private readonly codeService: CodeService,
    @inject(VOUCHERS_TYPES.VouchersRepository)
    private readonly vouchersRepository: VouchersRepository,
    @inject(SERVICE_TYPES.ServiceRepository)
    private readonly serviceRepository: ServiceRepository,
    @inject(SERVICE_PRICE_TYPES.ServicePriceRepository)
    private readonly servicePriceRepository: ServicePriceRepository,
  ) {
    super(serviceOrderRepository);
  }

  private async emitToAdmins(serviceOrder: Pick<ServiceOrder, "id" | "status">, event: string): Promise<void> {
    const adminIds = await this.userRepository.findAllAdminAndManagerUserIds();
    adminIds.forEach((userId) =>
      SocketUtils.sendSocketToUser("service-order:updated", userId, {
        serviceOrderId: serviceOrder.id,
        status: serviceOrder.status,
        event,
      }),
    );
  }

  private async sendNotificationToAdminsAndManagers(
    serviceOrderId: string,
    title: string,
    content: string,
    event: string,
    managerEmployeeIds: string[] = [],
    orderCode?: string | null,
  ): Promise<void> {
    const [adminManagerIds, managerUserIds] = await Promise.all([
      this.userRepository.findAllAdminAndManagerUserIds(),
      this.userRepository.findUserIdsByEmployeeIds(managerEmployeeIds),
    ]);
    const userIds = [...new Set([...adminManagerIds, ...managerUserIds])];
    if (userIds.length === 0) return;
    const notificationTitle = formatOrderNotificationTitle(orderCode, title);
    await this.notificationService.createNotificationForMultipleUsers(
      userIds,
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
    userIds.forEach((userId) => {
      FirebaseUtils.SentFirebaseWithUser({
        userId,
        orderCode,
        title: notificationTitle,
        content,
        data: { type: NotificationTypeEnum.SYSTEM, serviceOrderId, event },
      });
    });
  }

  async validateBeforeCreate(data: DeepPartial<ServiceOrder>, req?: Request, manager?: IEntityManager): Promise<void> {
    const customerId = req?.user?.customerId;
    if (!customerId) {
      throw new UnauthorizedError("Bạn chưa đăng nhập với tài khoản khách hàng");
    }
    data.customerId = customerId;

    if (!data.code) {
      const code = await this.codeService.getCode("ServiceOrder", manager);
      data.code = code.data.code;
    }

    if (data.quote?.length) {
      data.status = ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION;
    }

    if (!data.branchId && !data.branchManagerId) {
      const nearestBranch = await this.resolveNearestBranch(data.address as IAddress | undefined);
      if (nearestBranch) {
        data.branchId = nearestBranch.branch.id;
        data.branchManagerId = nearestBranch.branch.employeeId || null;
      }
    }
  }

  async actionAfterCreate(data: ServiceOrder, _req?: Request, _manager?: IEntityManager): Promise<void> {
    // Lưu ý: KHÔNG mark voucher isUsed=true tại đây.
    // Voucher chỉ bị "khóa" khi nhân viên xác nhận đơn (status -> CONFIRMED),
    // xử lý trong `AdminServiceOrderService.confirm()`. Lý do: cho phép khách hàng
    // đổi/hủy voucher trước khi đơn được nhân viên confirm mà không cần unlock thủ công.
    await this.emitToAdmins(data, "CREATED");
    await this.notifyAssignedManager(data);
  }

  private async getVoucherDiscountAmount(
    vouchersId: string | null | undefined,
    customerId: string,
    manager?: IEntityManager,
  ): Promise<number> {
    if (!vouchersId) return 0;

    const qb = this.vouchersRepository
      .getRepository(manager)
      .createQueryBuilder("voucher")
      .where("voucher.id = :id", { id: vouchersId })
      .andWhere("voucher.deletedAt IS NULL");

    if (manager) {
      qb.setLock("pessimistic_write");
    }

    const voucher = await qb.getOne();
    if (!voucher) {
      throw new BadRequestError("Không tìm thấy phiếu giảm giá");
    }

    const vouchersTemplate = await this.vouchersRepository
      .getRepository(manager)
      .manager.getRepository(VouchersTemplate)
      .findOne({
        where: {
          id: voucher.vouchersTemplateId,
        },
      });

    if (!vouchersTemplate) {
      throw new BadRequestError("Không tìm thấy mẫu phiếu giảm giá");
    }

    return resolveVoucherDiscountAmount({
      voucher,
      customerId,
      templateAmount: vouchersTemplate.amount,
    });
  }

  private getCoordinate(address?: IAddress | null): Coordinate | null {
    const latitude = Number(address?.latitude);
    const longitude = Number(address?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  }

  private calculateAerialDistanceMeters(origin: Coordinate, destination: Coordinate): number {
    const earthRadiusMeters = 6371000;
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const dLat = toRadians(destination.latitude - origin.latitude);
    const dLng = toRadians(destination.longitude - origin.longitude);
    const lat1 = toRadians(origin.latitude);
    const lat2 = toRadians(destination.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
  }

  private async getRouteDistanceMeters(branch: BranchDistanceCandidate, destination: Coordinate): Promise<number> {
    const origin = this.getCoordinate(branch.branch.address);
    if (!origin) return branch.aerialDistanceMeters;

    try {
      const response = await this.goongMapService.directions({
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        vehicle: "car",
      });
      const data = response.data as GoongDirectionsData;
      const distance = data.routes?.[0]?.distance?.value;

      return typeof distance === "number" && Number.isFinite(distance) ? distance : branch.aerialDistanceMeters;
    } catch (error) {
      console.warn("Không thể lấy khoảng cách Goong directions, fallback đường chim bay", {
        branchId: branch.branch.id,
        error,
      });
      return branch.aerialDistanceMeters;
    }
  }

  private async getTransportDistanceKm(
    pickupAddress?: IAddress | null,
    deliveryAddress?: IAddress | null,
  ): Promise<number> {
    const pickup = this.getCoordinate(pickupAddress);
    const delivery = this.getCoordinate(deliveryAddress);

    if (!pickup || !delivery) {
      throw new BadRequestError("Địa chỉ lấy hàng và giao hàng phải có tọa độ để tính phí vận tải");
    }

    const response = await this.goongMapService.directions({
      origin: `${pickup.latitude},${pickup.longitude}`,
      destination: `${delivery.latitude},${delivery.longitude}`,
      vehicle: "car",
    });

    const data = response.data as GoongDirectionsData;
    const distanceMeters = data.routes?.[0]?.legs?.[0]?.distance?.value ?? data.routes?.[0]?.distance?.value;

    if (typeof distanceMeters !== "number" || !Number.isFinite(distanceMeters)) {
      throw new BadRequestError("Không thể tính khoảng cách vận tải");
    }

    return distanceMeters / 1000;
  }

  //? Các hàm xử lý các bước báo giá tự động cho khách hàng
  private async resolveEstimatedServicePrices(
    serviceId: string,
    selectedServicePrices?: Array<{ servicePriceId: string; quantity?: number }>,
  ): Promise<
    Array<{
      category: string;
      unit: string;
      price: number;
      quantity: number;
      includedQuantity: number;
      excessUnitPrice: number;
    }>
  > {
    if (!selectedServicePrices?.length) {
      throw new BadRequestError("Danh sách gói dịch vụ phải có ít nhất 1 dòng");
    }

    const hasInvalidRow = selectedServicePrices.some((item) => item.quantity != null && item.quantity <= 0);
    if (hasInvalidRow) {
      throw new BadRequestError("Số lượng gói dịch vụ phải lớn hơn 0");
    }

    const servicePriceIds = [...new Set(selectedServicePrices.map((item) => item.servicePriceId))];
    const servicePrices = await this.servicePriceRepository.findByOptions({
      where: {
        id: In(servicePriceIds),
      },
    });

    if (servicePrices.length !== servicePriceIds.length) {
      throw new BadRequestError("Bảng giá dịch vụ không tồn tại");
    }

    if (servicePrices.some((item) => item.serviceId !== serviceId)) {
      throw new BadRequestError("Bảng giá không thuộc dịch vụ đã chọn");
    }

    const servicePriceById = new Map(servicePrices.map((item) => [item.id, item]));

    return selectedServicePrices.map((item) => {
      const servicePrice = servicePriceById.get(item.servicePriceId)!;

      return {
        category: servicePrice.category,
        unit: servicePrice.unit,
        price: servicePrice.price,
        quantity: item.quantity ?? 1,
        includedQuantity: servicePrice.quantity,
        excessUnitPrice: servicePrice.excessUnitPrice,
      };
    });
  }

  //? Các hàm xử lý các bước báo giá tự động cho khách hàng
  async createCustomerOrder(
    input: CustomerCreateServiceOrderDto,
    req: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<ServiceOrder>> {
    const customerId = req.user?.customerId;
    if (!customerId) throw new UnauthorizedError("Bạn chưa đăng nhập với tài khoản khách hàng");

    const { serviceId, servicePrices: selectedServicePrices, ...entityData } = input;
    const service = await this.serviceRepository.findById(serviceId, manager);
    if (!service) throw new BadRequestError("Dịch vụ không tồn tại");
    if (service.type !== input.type) throw new BadRequestError("Loại dịch vụ không khớp với dịch vụ đã chọn");

    const settings = await this.appSettingRepository.getOrderPricingConfig();
    const isUrgent = isUrgentServiceOrder({
      enabled: settings.urgentOrderEnabled,
      urgentOrderHours: settings.urgentOrderHours,
      timeAt: input.timeAt,
    });

    if (!service.autoQuote) {
      if (selectedServicePrices?.length) {
        throw new BadRequestError("Dịch vụ báo giá thủ công không nhận bảng giá tự động");
      }
      return super.create(
        {
          ...entityData,
          customerId,
          needsQuote: true,
          servicePrices: null,
          isUrgent,
          quote: null,
          basePrice: null,
          preVatAmount: null,
          vat: entityData.hasVat ? settings.vat : 0,
          vatAmount: null,
          amount: null,
        },
        req,
        manager,
      );
    }

    const servicePrices = await this.resolveEstimatedServicePrices(serviceId, selectedServicePrices ?? undefined);
    const distanceKm =
      input.type === ServiceOrderTypeEnum.DICH_VU_VAN_TAI
        ? await this.getTransportDistanceKm(input.pickupAddress, input.deliveryAddress)
        : null;
    const voucherDiscountAmount = await this.getVoucherDiscountAmount(input.vouchersId, customerId, manager);
    const estimate = calculateEstimatedServiceOrderPrice({
      type: input.type,
      servicePrices,
      employeeCount: input.employeeCount,
      distanceKm,
      baseItems: [],
      isUrgent,
      urgentSurchargePercent: settings.urgentOrderSurchargePercent,
      hasFragileItems: input.hasFragileItems,
      fragileItemSurchargePercent: settings.fragileItemSurchargePercent,
      voucherDiscountAmount,
      hasVat: input.hasVat,
      vat: settings.vat,
    });

    return super.create(
      {
        ...entityData,
        customerId,
        needsQuote: false,
        servicePrices: servicePrices.map((item) => ({
          name: item.category,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          note: null,
        })),
        isUrgent,
        quote: estimate.items,
        basePrice: estimate.basePrice,
        preVatAmount: estimate.preVatAmount,
        vat: estimate.vat,
        vatAmount: estimate.vatAmount,
        amount: estimate.totalPrice,
      },
      req,
      manager,
    );
  }

  //? Các hàm xử lý các bước báo giá tự động cho khách hàng
  async estimatePrice(
    data: CustomerEstimateServiceOrderPriceDto,
    req?: Request,
  ): Promise<ApiResponse<EstimatedServiceOrderPriceResult>> {
    const service = await this.serviceRepository.findById(data.serviceId);
    if (!service) {
      throw new BadRequestError("Dịch vụ không tồn tại");
    }

    if (service.type !== data.type) {
      throw new BadRequestError("Loại dịch vụ không khớp với dịch vụ đã chọn");
    }

    if (!service.autoQuote) {
      throw new BadRequestError("Dịch vụ chưa hỗ trợ báo giá tự động");
    }

    const servicePrices = await this.resolveEstimatedServicePrices(service.id, data.servicePrices);

    if (data.type === ServiceOrderTypeEnum.BOC_XEP_THEO_CA) {
      if (!data.employeeCount || data.employeeCount <= 0) {
        throw new BadRequestError("Số nhân viên phải lớn hơn 0");
      }
    }

    const distanceKm =
      data.type === ServiceOrderTypeEnum.DICH_VU_VAN_TAI
        ? await this.getTransportDistanceKm(data.pickupAddress, data.deliveryAddress)
        : null;
    const customerId = req?.user?.customerId;
    if (!customerId) throw new UnauthorizedError("Bạn chưa đăng nhập với tài khoản khách hàng");
    const settings = await this.appSettingRepository.getOrderPricingConfig();
    const isUrgent = isUrgentServiceOrder({
      enabled: settings.urgentOrderEnabled,
      urgentOrderHours: settings.urgentOrderHours,
      timeAt: data.timeAt,
    });
    const voucherDiscountAmount = await this.getVoucherDiscountAmount(data.vouchersId, customerId);

    const estimate = calculateEstimatedServiceOrderPrice({
      type: data.type,
      servicePrices,
      employeeCount: data.employeeCount,
      distanceKm,
      baseItems: [],
      isUrgent,
      urgentSurchargePercent: settings.urgentOrderSurchargePercent,
      hasFragileItems: data.hasFragileItems,
      fragileItemSurchargePercent: settings.fragileItemSurchargePercent,
      voucherDiscountAmount,
      hasVat: data.hasVat,
      vat: settings.vat,
    });

    return ApiResponseHandler.getSuccess("OK", estimate);
  }

  private async resolveNearestBranch(address?: IAddress | null): Promise<BranchDistanceCandidate | null> {
    const destination = this.getCoordinate(address);
    if (!destination) return null;

    const branches = await this.branchRepository.getRepository().find({
      select: {
        id: true,
        name: true,
        employeeId: true,
        address: true,
      } as any,
    });

    const candidates = branches
      .filter((branch) => this.getCoordinate(branch.address))
      .map((branch) => ({
        branch,
        aerialDistanceMeters: this.calculateAerialDistanceMeters(this.getCoordinate(branch.address)!, destination),
      }))
      .sort((a, b) => a.aerialDistanceMeters - b.aerialDistanceMeters)
      .slice(0, 2);

    if (candidates.length === 0) return null;

    const candidatesWithRoute = await Promise.all(
      candidates.map(async (candidate) => ({
        ...candidate,
        routeDistanceMeters: await this.getRouteDistanceMeters(candidate, destination),
      })),
    );

    return candidatesWithRoute.sort(
      (a, b) => (a.routeDistanceMeters ?? a.aerialDistanceMeters) - (b.routeDistanceMeters ?? b.aerialDistanceMeters),
    )[0];
  }

  private async notifyAssignedManager(serviceOrder: ServiceOrder): Promise<void> {
    if (
      (serviceOrder.status !== ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION &&
        serviceOrder.status !== ServiceOrderStatusEnum.WAITING_FOR_QUOTE) ||
      !serviceOrder.employeeId
    ) {
      return;
    }

    const userIds = await this.userRepository.findUserIdsByEmployeeIds([serviceOrder.employeeId]);
    if (userIds.length === 0) return;

    const title = "Đơn dịch vụ mới được phân công";
    const content = "Bạn có đơn dịch vụ mới cần xác nhận, vui lòng kiểm tra và phản hồi.";
    await this.notificationService.createNotificationForMultipleUsers(userIds, {
      title,
      content,
      type: NotificationTypeEnum.SYSTEM,
      objectId: serviceOrder.id,
      metadata: {
        serviceOrderId: serviceOrder.id,
        event: "AUTO_ASSIGNED_MANAGER",
        branchId: serviceOrder.branchId,
      },
    });

    userIds.forEach((userId) => {
      FirebaseUtils.SentFirebaseWithUser({
        userId,
        title,
        content,
        data: {
          type: NotificationTypeEnum.SYSTEM,
          serviceOrderId: serviceOrder.id,
          event: "AUTO_ASSIGNED_MANAGER",
        },
      });
    });
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

    // Khách hàng chỉ được sửa đơn khi đang ở trạng thái WAITING_FOR_QUOTE
    const customerId = req?.user?.customerId;
    if (customerId) {
      if (current.customerId !== customerId) {
        throw new ForbiddenError("Bạn không có quyền chỉnh sửa đơn này");
      }
      if (current.status !== ServiceOrderStatusEnum.WAITING_FOR_QUOTE) {
        throw new BadRequestError("Chỉ có thể chỉnh sửa đơn khi đang ở trạng thái chờ báo giá (WAITING_FOR_QUOTE)");
      }
    }

    if (data.vouchersId && data.vouchersId !== current.vouchersId) {
      if (!customerId) {
        throw new UnauthorizedError("Bạn chưa đăng nhập với tài khoản khách hàng");
      }
      if (current.vouchersId) {
        await this.vouchersRepository.update(current.vouchersId, { isUsed: false, usedAt: null }, manager);
      }
    } else if (data.vouchersId === null && current.vouchersId) {
      await this.vouchersRepository.update(current.vouchersId, { isUsed: false, usedAt: null }, manager);
    }

    if (
      data.quote ||
      data.timeAt !== undefined ||
      data.hasFragileItems !== undefined ||
      data.vouchersId !== undefined ||
      data.hasVat !== undefined
    ) {
      const settings = await this.appSettingRepository.getOrderPricingConfig();
      const timeAt = this.normalizeDate(data.timeAt ?? current.timeAt)!;
      const isUrgent = isUrgentServiceOrder({
        enabled: settings.urgentOrderEnabled,
        urgentOrderHours: settings.urgentOrderHours,
        timeAt,
      });
      const vouchersId = data.vouchersId === undefined ? current.vouchersId : data.vouchersId;
      const voucherDiscountAmount = await this.getVoucherDiscountAmount(
        vouchersId,
        customerId ?? current.customerId,
        manager,
      );
      const hasVat = data.hasVat ?? current.hasVat;
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

    const result = await super.update(id, data, req, manager);
    if (data.vouchersId && data.vouchersId !== current.vouchersId) {
      await this.vouchersRepository.update(data.vouchersId, { isUsed: true, usedAt: new Date() }, manager);
    }

    if (data.status && data.status !== current.status) {
      await this.serviceOrderChatService.createStatusChangedSystemMessage(id, current.status, data.status, manager);
    }

    return result;
  }

  async cancelOrder(id: string, req: Request, manager?: IEntityManager): Promise<ApiResponse<ServiceOrder>> {
    const customerId = req.user?.customerId;
    if (!customerId) {
      throw new UnauthorizedError("Bạn chưa đăng nhập với tài khoản khách hàng");
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id, manager);
    if (!serviceOrder) {
      throw new NotFoundError("Không tìm thấy đơn khách hàng");
    }

    if (serviceOrder.customerId !== customerId) {
      throw new ForbiddenError("Bạn không có quyền hủy đơn khách hàng này");
    }

    if (
      ![ServiceOrderStatusEnum.WAITING_FOR_QUOTE, ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION].includes(
        serviceOrder.status,
      )
    ) {
      throw new BadRequestError("Chỉ có thể hủy đơn khi đang chờ báo giá hoặc chờ xác nhận nhân viên");
    }

    const result = await super.update(id, { status: ServiceOrderStatusEnum.CANCELED, vouchersId: null }, req, manager);
    if (serviceOrder.vouchersId) {
      await this.vouchersRepository.update(serviceOrder.vouchersId, { isUsed: false, usedAt: null }, manager);
    }

    await this.serviceOrderChatService.createSystemMessage(
      id,
      "Khách hàng đã hủy đơn hàng.",
      { type: "CUSTOMER_CANCELED_ORDER" },
      manager,
    );

    return result;
  }

  private async getCustomerContext(serviceOrderId: string, req: Request, manager?: IEntityManager) {
    const userId = req.user?.userId;
    const customerId = req.user?.customerId;

    if (!userId || !customerId) {
      throw new UnauthorizedError("Bạn chưa đăng nhập với tài khoản khách hàng");
    }

    const serviceOrder = await this.serviceOrderRepository
      .getRepository(manager)
      .createQueryBuilder("entity")
      .setLock("pessimistic_write")
      .where("entity.id = :id", { id: serviceOrderId })
      .andWhere("entity.deletedAt IS NULL")
      .getOne();

    if (!serviceOrder) {
      throw new NotFoundError("Không tìm thấy đơn khách hàng");
    }

    if (serviceOrder.customerId !== customerId) {
      throw new UnauthorizedError("Bạn không có quyền thao tác đơn khách hàng này");
    }

    return { userId, serviceOrder };
  }

  private async getLinkedOrder(serviceOrderId: string, manager?: IEntityManager): Promise<Order | null> {
    return this.orderRepository.getRepository(manager).findOne({
      where: {
        serviceOrderId,
      },
      relations: {
        orderEmployees: true,
        orderLeaders: true,
      } as FindOptionsRelations<Order>,
    });
  }

  private getRatedEmployeeIds(order: Order): string[] {
    return [...new Set((order.orderEmployees || []).map((item) => item.employeeId))];
  }

  //? Khách hàng xác nhận hoàn thành đơn hàng
  async confirmCompleted(id: string, req: Request, manager?: IEntityManager): Promise<ApiResponse<ServiceOrder>> {
    const { userId, serviceOrder } = await this.getCustomerContext(id, req, manager);
    const dto = req.body as CustomerConfirmCompletedServiceOrderDto;
    const linkedOrder = await this.getLinkedOrder(id, manager);

    if (!linkedOrder) {
      throw new BadRequestError("Có lỗi phát sinh, vui lòng liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ");
    }

    if (serviceOrder.status !== ServiceOrderStatusEnum.COMPLETED_BY_EMPLOYEE) {
      throw new BadRequestError("Chỉ có thể xác nhận hoàn thành khi nhân viên đã xác nhận xong công việc");
    }

    await this.serviceOrderChatService.createMessage(
      id,
      {
        content: dto.content?.trim() || "Khách hàng đã xác nhận hoàn thành đơn hàng.",
        attachments: dto.attachments || null,
        metadata: {
          type: "CUSTOMER_CONFIRMED_COMPLETED",
          linkedOrderId: linkedOrder.id,
        },
      },
      userId,
      manager,
    );

    await this.serviceOrderRepository.update(id, { status: ServiceOrderStatusEnum.COMPLETED_BY_CUSTOMER }, manager);
    await this.emitToAdmins(
      { ...serviceOrder, status: ServiceOrderStatusEnum.COMPLETED_BY_CUSTOMER },
      "COMPLETED_BY_CUSTOMER",
    );
    const managerEmployeeIds = [...new Set((linkedOrder.orderLeaders || []).map((item) => item.employeeId))];
    await this.sendNotificationToAdminsAndManagers(
      id,
      "Khách hàng xác nhận hoàn thành",
      "Khách hàng đã xác nhận hoàn thành đơn dịch vụ, vui lòng kiểm tra và đóng đơn.",
      "COMPLETED_BY_CUSTOMER",
      managerEmployeeIds,
      linkedOrder.code,
    );
    return ApiResponseHandler.updateSuccess("Xác nhận hoàn thành đơn hàng thành công");
  }

  async createCustomerRating(
    id: string,
    req: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ serviceOrder: ServiceOrder; ratings: ServiceOrderRating[] }>> {
    const { serviceOrder } = await this.getCustomerContext(id, req, manager);
    const dto = req.body as CustomerCreateServiceOrderRatingDto;
    const linkedOrder = await this.getLinkedOrder(id, manager);

    if (!linkedOrder) {
      throw new BadRequestError("Đơn dịch vụ chưa được liên kết sang hợp đồng để đánh giá");
    }

    const availableEmployeeIds = this.getRatedEmployeeIds(linkedOrder);
    if (availableEmployeeIds.length === 0) {
      throw new BadRequestError("Đơn hàng chưa có nhân viên thực hiện để đánh giá");
    }

    const normalizedRatings =
      dto.employeeRatings && dto.employeeRatings.length > 0
        ? dto.employeeRatings
        : dto.rating
          ? [
              {
                employeeId:
                  linkedOrder.orderEmployees?.find((item) => item.isLeader)?.employeeId ?? availableEmployeeIds[0],
                rating: dto.rating,
                review: dto.review,
                note: dto.note,
              },
            ]
          : [];

    if (normalizedRatings.length === 0) {
      throw new BadRequestError("Không có dữ liệu đánh giá hợp lệ");
    }

    const invalidEmployeeIds = normalizedRatings
      .map((item) => item.employeeId)
      .filter((employeeId) => !availableEmployeeIds.includes(employeeId));

    if (invalidEmployeeIds.length > 0) {
      throw new BadRequestError("Có nhân viên không thuộc đơn hàng này");
    }

    // Batch fetch existing ratings in a single query
    const existingRatings = await this.serviceOrderRatingRepository.getRepository(manager).find({
      where: normalizedRatings.map((item) => ({
        orderId: linkedOrder.id,
        employeeId: item.employeeId,
      })),
    });
    const existingMap = new Map(existingRatings.map((r) => [r.employeeId, r]));

    const toCreate: { orderId: string; employeeId: string; rating: number; review?: string; note?: string }[] = [];
    const toUpdate: { id: string; data: Partial<ServiceOrderRating> }[] = [];

    for (const item of normalizedRatings) {
      const existed = existingMap.get(item.employeeId);
      if (existed) {
        toUpdate.push({
          id: existed.id,
          data: {
            rating: item.rating,
            review: item.review?.trim() || undefined,
            note: item.note?.trim() || undefined,
          },
        });
      } else {
        toCreate.push({
          orderId: linkedOrder.id,
          employeeId: item.employeeId,
          rating: item.rating,
          review: item.review?.trim() || undefined,
          note: item.note?.trim() || undefined,
        });
      }
    }

    const [updatedRatings, createdRatings] = await Promise.all([
      Promise.all(toUpdate.map((item) => this.serviceOrderRatingRepository.update(item.id, item.data, manager))),
      Promise.all(toCreate.map((item) => this.serviceOrderRatingRepository.create(item, manager))),
    ]);

    const persistedRatings: ServiceOrderRating[] = [
      ...(updatedRatings.filter(Boolean) as ServiceOrderRating[]),
      ...createdRatings,
    ];

    const averageRating =
      dto.rating ??
      Math.round(persistedRatings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / persistedRatings.length);

    await this.orderRepository.update(linkedOrder.id, { rating: averageRating }, manager);
    await this.serviceOrderRepository.update(id, { rating: averageRating }, manager);

    await this.serviceOrderChatService.createSystemMessage(
      id,
      `Khách hàng đã gửi đánh giá ${averageRating}/5 cho đơn hàng.`,
      {
        type: "CUSTOMER_RATED_SERVICE_ORDER",
        linkedOrderId: linkedOrder.id,
        rating: averageRating,
        employeeRatings: persistedRatings.map((item) => ({
          employeeId: item.employeeId,
          rating: item.rating,
        })),
      },
      manager,
    );

    const managerEmployeeIds = [...new Set((linkedOrder.orderLeaders || []).map((item) => item.employeeId))];
    await this.sendNotificationToAdminsAndManagers(
      id,
      "Khách hàng đánh giá dịch vụ",
      `Khách hàng đã gửi đánh giá ${averageRating}/5 cho đơn dịch vụ.`,
      "CUSTOMER_RATED",
      managerEmployeeIds,
      linkedOrder.code,
    );

    const updatedServiceOrder = await this.serviceOrderRepository.findById(id, manager);
    if (!updatedServiceOrder) {
      throw new NotFoundError("Không tìm thấy đơn khách hàng sau khi cập nhật đánh giá");
    }

    return ApiResponseHandler.createSuccess("OK", {
      serviceOrder: updatedServiceOrder,
      ratings: persistedRatings,
    });
  }

  //? Step 3: Khách hàng xác nhận báo giá → WAITING_FOR_QUOTE → WAITING_FOR_CONFIRMATION
  async confirmQuote(id: string, req: Request, manager?: IEntityManager): Promise<ApiResponse<ServiceOrder>> {
    const { serviceOrder } = await this.getCustomerContext(id, req, manager);

    if (serviceOrder.status !== ServiceOrderStatusEnum.WAITING_FOR_CUSTOMER_CONFIRMATION) {
      throw new BadRequestError("Chỉ có thể xác nhận báo giá khi đơn đang chờ xác nhận báo giá");
    }

    const updateData: Partial<ServiceOrder> = {
      status: ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION,
    };

    if (!serviceOrder.branchId && !serviceOrder.employeeId) {
      const nearestBranch = await this.resolveNearestBranch(serviceOrder.address);
      if (nearestBranch) {
        updateData.branchId = nearestBranch.branch.id;
        updateData.employeeId = nearestBranch.branch.employeeId || null;
      }
    }

    await this.serviceOrderRepository.update(id, updateData, manager);

    await this.serviceOrderChatService.createSystemMessage(
      id,
      "Khách hàng đã xác nhận báo giá.",
      { type: "CUSTOMER_CONFIRMED_QUOTE" },
      manager,
    );

    const updatedServiceOrder = await this.serviceOrderRepository.findById(id, manager);
    if (!updatedServiceOrder) {
      throw new NotFoundError("Không tìm thấy đơn khách hàng sau khi xác nhận báo giá");
    }

    await this.emitToAdmins(updatedServiceOrder, "QUOTE_CONFIRMED");
    await this.notifyAssignedManager(updatedServiceOrder);
    await this.sendNotificationToAdminsAndManagers(
      id,
      "Khách hàng xác nhận báo giá",
      "Khách hàng đã xác nhận báo giá, vui lòng tiến hành xác nhận đơn hàng.",
      "QUOTE_CONFIRMED",
      updatedServiceOrder.employeeId ? [updatedServiceOrder.employeeId] : [],
    );
    return ApiResponseHandler.updateSuccess("Xác nhận báo giá thành công");
  }
}
