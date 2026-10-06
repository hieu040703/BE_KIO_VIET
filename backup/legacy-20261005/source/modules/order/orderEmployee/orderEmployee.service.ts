import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { OrderEmployeeRepository } from "./orderEmployee.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ORDER_EMPLOYEE_TYPES } from "./orderEmployee.types";
import { OrderEmployee } from "@/database/models/OrderEmployee";
import { OrderEmployeeRelations, OrderEmployeeSelectFull } from "./orderEmployee.select";
import {
  CreateOrderEmployeeDto,
  OrderEmployeeCheckoutDto,
  UpdateOrderEmployeeDto,
  UpdateOrderEmployeeMultiDto,
} from "./orderEmployee.validator";
import { ApiResponse, IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/shared/types/errors";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { EMPLOYEE_TYPES } from "@/modules/employee/employee.types";
import { EmployeeRepository } from "@/modules/employee/employee.repository";
import { ORDER_COMMENT_TYPES } from "../orderComment/orderComment.types";
import { OrderCommentRepository } from "../orderComment/orderComment.repository";
import { OrderCommentService } from "../orderComment/orderComment.service";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import { TimeKeepingRepository } from "@/modules/timeKeeping/timeKeeping.repository";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import { Request } from "express";
import dayjs from "dayjs";
import { ORDER_TYPES } from "../order.types";
import { ORDER_LEADER_TYPES } from "../orderLeader/orderLeader.types";
import { OrderLeaderRepository } from "../orderLeader/orderLeader.repository";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { NotificationService } from "@/modules/notification/notification.service";
import {
  EntityTypeEnum,
  FileStatusEnum,
  NotificationTypeEnum,
  OrderEmployeeStatusEnum,
  OrderStatusEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { OrderRepository } from "../order.repository";
import { In, Not } from "typeorm";
import { resolveOrderEmployeeDefaultNote } from "./orderEmployee.helpers";
import { FILE_TYPES, FileRepository } from "@/modules/file";
import { CALL_NAVIGATION_TYPES } from "@/modules/callNavigation/callNavigation.types";
import { CallNavigationService } from "@/modules/callNavigation/callNavigation.service";
import { UserSelectBasic } from "@/modules/user/user.select";
import { CallNavigationRepository } from "@/modules/callNavigation/callNavigation.repository";

export type OrderEmployeeDeleteMeta = {
  employeeId: string;
  orderId: string;
};

type OrderEmployeeWithDeleteMeta = OrderEmployee & {
  __deleteMeta?: OrderEmployeeDeleteMeta;
};

/**
 * Tính tổng số giờ làm việc từ startTime / endTime, có trừ giờ giải lao (breakTime).
 * - endTime > startTime: cùng ngày
 * - endTime < startTime: sang ngày hôm sau
 * Trả về undefined nếu startTime hoặc endTime không hợp lệ.
 */
const computeTotalHours = (
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  breakTime: number | null | undefined,
): number | undefined => {
  if (!startTime || !endTime) return undefined;
  if (startTime === endTime) return undefined;

  const startHour = Number(startTime.split(":")[0]);
  const endHour = Number(endTime.split(":")[0]);

  let rawDiff: number;
  if (startHour < endHour) {
    rawDiff = dayjs(`2026-01-01 ${endTime}`).diff(dayjs(`2026-01-01 ${startTime}`), "hour", true);
  } else if (startHour > endHour) {
    rawDiff = dayjs(`2026-01-02 ${endTime}`).diff(dayjs(`2026-01-01 ${startTime}`), "hour", true);
  } else {
    const startMinute = Number(startTime.split(":")[1]);
    const endMinute = Number(endTime.split(":")[1]);
    if (startMinute > endMinute) {
      rawDiff = dayjs(`2026-01-02 ${endTime}`).diff(dayjs(`2026-01-01 ${startTime}`), "hour", true);
    } else {
      rawDiff = dayjs(`2026-01-01 ${endTime}`).diff(dayjs(`2026-01-01 ${startTime}`), "hour", true);
    }
  }

  const breakHours = Number(breakTime) || 0;
  const total = rawDiff - breakHours;

  // Không cho total âm
  return total < 0 ? 0 : Number(total.toFixed(2));
};

@injectable()
export class OrderEmployeeService extends BaseService<OrderEmployee> {
  protected relations = OrderEmployeeRelations;
  protected selectedFields = OrderEmployeeSelectFull;
  constructor(
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeRepository)
    private orderEmployeeRepository: OrderEmployeeRepository,
    @inject(COMMON_TYPES.TransactionManager)
    private transactionManager: TransactionManager,
    @inject(EMPLOYEE_TYPES.EmployeeRepository)
    private employeeRepository: EmployeeRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentRepository)
    private orderCommentRepository: OrderCommentRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentService)
    private orderCommentService: OrderCommentService,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository)
    private timeKeepingRepository: TimeKeepingRepository,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(ORDER_TYPES.OrderRepository)
    private orderRepository: OrderRepository,
    @inject(ORDER_LEADER_TYPES.OrderLeaderRepository)
    private orderLeaderRepository: OrderLeaderRepository,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private notificationService: NotificationService,
    @inject(FILE_TYPES.FileRepository)
    private fileRepository: FileRepository,
    @inject(CALL_NAVIGATION_TYPES.CallNavigationRepository)
    private callNavigationRepository: CallNavigationRepository,
  ) {
    super(orderEmployeeRepository);
  }

  async validateBeforeQuery(
    options: IFindOptions<OrderEmployee>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    options.page = options.page ? options.page : 1;
    options.size = options.size ? options.size : 200;
  }

  async checkIn(
    orderId: string,
    employeeId: string,
    coordinates: { latitude: number; longitude: number },
    manager?: IEntityManager,
  ): Promise<OrderEmployee> {
    const orderEmployee = await this.orderEmployeeRepository.findByOption(
      {
        where: { orderId, employeeId },
        select: OrderEmployeeSelectFull,
        relations: OrderEmployeeRelations,
      },
      manager,
    );

    if (!orderEmployee) {
      throw new BadRequestError("Nhân viên không thuộc hợp đồng");
    }

    if (orderEmployee.checkInAt) {
      throw new ConflictError("Nhân viên đã checkin đơn hàng này");
    }
    const checkInAt = new Date();
    const timeAt = checkInAt;
    const startTime = dayjs(checkInAt).tz("Asia/Ho_Chi_Minh").format("HH:mm:ss");

    const updated = await this.orderEmployeeRepository.update(
      orderEmployee.id,
      {
        timeAt,
        checkInAt,
        startTime,
        checkInLatitude: coordinates.latitude,
        checkInLongitude: coordinates.longitude,
      },
      manager,
    );

    if (!updated) {
      throw new BadRequestError("Không thể lưu thông tin checkin của nhân viên");
    }

    //? create comment trong hợp đồng
    await this.orderCommentService.create(
      {
        orderId: orderId,
        userId: null,
        content: `Nhân viên ${orderEmployee.employee.zaloName || orderEmployee.employee.name} đã thực hiện checkin`,
      },
      undefined,
      manager,
    );

    return updated;
  }

  async checkOut(
    orderId: string,
    orderEmployeeId: string,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<OrderEmployee>> {
    const employeeId = req?.user?.employeeId;
    if (!employeeId) {
      throw new ForbiddenError("Tài khoản không liên kết với nhân viên");
    }

    const breakTime = (req?.body as Partial<OrderEmployeeCheckoutDto> | undefined)?.breakTime;
    if (typeof breakTime !== "number" || !Number.isFinite(breakTime) || breakTime < 0) {
      throw new BadRequestError("Số giờ giải lao là bắt buộc và không được âm");
    }

    const order = await this.orderRepository.findById(orderId, manager);
    if (!order) {
      throw new BadRequestError("Hợp đồng không tồn tại");
    }

    if (order.status !== OrderStatusEnum.PROCESSING) {
      throw new BadRequestError("Chỉ có thể checkout khi hợp đồng đang thực hiện");
    }

    const orderEmployee = await this.orderEmployeeRepository.findByOption(
      {
        where: { id: orderEmployeeId, orderId, employeeId },
        select: OrderEmployeeSelectFull,
        relations: OrderEmployeeRelations,
      },
      manager,
    );
    if (!orderEmployee) {
      throw new ForbiddenError("Nhân viên không thuộc hợp đồng");
    }

    if (orderEmployee.checkOutAt) {
      throw new ConflictError("Nhân viên đã checkout hợp đồng này");
    }

    const orderFiles = await this.fileRepository.findByOptions(
      {
        where: {
          entityType: EntityTypeEnum.ORDER,
          entityId: orderId,
          status: FileStatusEnum.ACTIVE,
        },
      },
      manager,
    );

    console.log("orderFiles", orderFiles.length);

    if (orderFiles.length === 0) {
      throw new BadRequestError("Hợp đồng phải có tài liệu trước khi checkout");
    }

    const checkOutAt = new Date();
    const endTime = dayjs(checkOutAt).tz("Asia/Ho_Chi_Minh").format("HH:mm:ss");
    const totalHours = dayjs(checkOutAt).diff(dayjs(orderEmployee.checkInAt), "hour", true) - (breakTime || 0);
    const updated = await this.orderEmployeeRepository.update(
      orderEmployee.id,
      {
        breakTime,
        checkOutAt,
        endTime,
        totalHours,
      },
      manager,
    );
    if (!updated) {
      throw new BadRequestError("Không thể lưu thông tin checkout của nhân viên");
    }

    const oe = await this.orderEmployeeRepository.findById(orderEmployeeId, manager);

    if (oe) {
      await this.timeKeepingRepository.updateTimeKeepingForEmployeeInOrder(oe, manager);
      await this.employeeRepository.updateEmployeeStatus(employeeId, manager);
    }

    //? create comment trong hợp đồng
    await this.orderCommentService.create(
      {
        orderId: orderId,
        userId: null,
        content: `Nhân viên ${orderEmployee.employee.zaloName || orderEmployee.employee.name} đã thực hiện checkout`,
      },
      undefined,
      manager,
    );

    return ApiResponseHandler.updateSuccess("Checkout thành công", updated);
  }

  async notifyOrderEmployeeCheckIn(orderId: string, employeeId: string): Promise<void> {
    await this.notifyOrderEmployeeAttendance(orderId, employeeId, true);
  }

  async notifyOrderEmployeeCheckOut(orderId: string, employeeId: string): Promise<void> {
    await this.notifyOrderEmployeeAttendance(orderId, employeeId, false);
  }

  private async notifyOrderEmployeeAttendance(orderId: string, employeeId: string, isCheckIn: boolean): Promise<void> {
    const order = await this.orderRepository.findByOption({
      where: { id: orderId },
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

    const employee = await this.employeeRepository.findById(employeeId);
    const action = isCheckIn ? "check-in" : "checkout";
    await this.notificationService.createNotificationForMultipleUsers(
      userIds,
      {
        title: isCheckIn ? "Nhân viên đã check-in đơn hàng" : "Nhân viên đã checkout đơn hàng",
        content: `Nhân viên ${employee?.name || "Nhân viên"} đã ${action} đơn hàng.`,
        type: NotificationTypeEnum.ALERT,
        objectId: order.id,
        metadata: {
          orderId: order.id,
          orderCode: order.code,
          employeeId,
          event: isCheckIn ? "ORDER_EMPLOYEE_CHECKED_IN" : "ORDER_EMPLOYEE_CHECKED_OUT",
        },
      },
      undefined,
      { orderCode: order.code },
    );
  }

  private async persistAssignmentStatus(
    orderEmployee: OrderEmployee,
    status: OrderEmployeeStatusEnum,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ isNewlyUpdated: boolean; orderEmployee: OrderEmployee }>> {
    if (orderEmployee.status === status) {
      return ApiResponseHandler.updateSuccess("OK", {
        isNewlyUpdated: false,
        orderEmployee,
      });
    }

    await this.orderEmployeeRepository.update(orderEmployee.id, { status }, manager);
    const updatedOrderEmployee = await this.orderEmployeeRepository.findById(orderEmployee.id, manager);

    if (!updatedOrderEmployee) {
      throw new BadRequestError("Không thể cập nhật trạng thái nhân viên");
    }

    return ApiResponseHandler.updateSuccess("OK", {
      isNewlyUpdated: true,
      orderEmployee: updatedOrderEmployee,
    });
  }

  async confirmAssignment(
    orderId: string,
    orderEmployeeId: string,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ isNewlyUpdated: boolean; orderEmployee: OrderEmployee }>> {
    return this.respondToAssignment(orderId, orderEmployeeId, OrderEmployeeStatusEnum.CONFIRMED, req, manager);
  }

  async rejectAssignment(
    orderId: string,
    orderEmployeeId: string,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ isNewlyUpdated: boolean; orderEmployee: OrderEmployee }>> {
    return this.respondToAssignment(orderId, orderEmployeeId, OrderEmployeeStatusEnum.REJECTED, req, manager);
  }

  private async respondToAssignment(
    orderId: string,
    orderEmployeeId: string,
    status: OrderEmployeeStatusEnum.CONFIRMED | OrderEmployeeStatusEnum.REJECTED,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ isNewlyUpdated: boolean; orderEmployee: OrderEmployee }>> {
    const employeeId = req?.user?.employeeId;
    if (!employeeId) {
      throw new ForbiddenError("Tài khoản không liên kết với nhân viên");
    }

    const orderEmployee = await this.orderEmployeeRepository.findByOption(
      {
        where: { id: orderEmployeeId, orderId, employeeId },
        select: OrderEmployeeSelectFull,
        relations: OrderEmployeeRelations,
      },
      manager,
    );
    if (!orderEmployee) {
      throw new ForbiddenError("Nhân viên không thuộc hợp đồng");
    }

    if (orderEmployee.status !== OrderEmployeeStatusEnum.PENDING) {
      throw new BadRequestError("Nhân viên đã phản hồi việc thực hiện hợp đồng");
    }

    //? create comment trong hợp đồng
    await this.orderCommentService.create(
      {
        orderId: orderId,
        userId: null,
        content: `Nhân viên ${orderEmployee.employee.zaloName || orderEmployee.employee.name} đã ${status === OrderEmployeeStatusEnum.CONFIRMED ? "đồng ý" : "từ chôi"} tham gia hợp đồng`,
      },
      undefined,
      manager,
    );

    return this.persistAssignmentStatus(orderEmployee, status, manager);
  }

  async updateAssignmentStatus(
    orderId: string,
    orderEmployeeId: string,
    status: OrderEmployeeStatusEnum,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ isNewlyUpdated: boolean; orderEmployee: OrderEmployee }>> {
    const orderEmployee = await this.orderEmployeeRepository.findByOption(
      { where: { id: orderEmployeeId, orderId } },
      manager,
    );
    if (!orderEmployee) {
      throw new BadRequestError("Nhân viên không thuộc hợp đồng");
    }

    if (req?.user?.role !== UserRoleEnum.ADMIN) {
      const managerEmployeeId = req?.user?.employeeId;
      if (!managerEmployeeId) {
        throw new ForbiddenError("Bạn không có quyền cập nhật trạng thái nhân viên");
      }

      const orderLeader = await this.orderLeaderRepository.findByOption(
        { where: { orderId, employeeId: managerEmployeeId } },
        manager,
      );
      if (!orderLeader) {
        throw new ForbiddenError("Chỉ quản lý của hợp đồng mới có thể cập nhật trạng thái nhân viên");
      }
    }

    return this.persistAssignmentStatus(orderEmployee, status, manager);
  }

  async notifyOrderEmployeeAssignmentStatus(
    orderId: string,
    orderEmployee: Pick<OrderEmployee, "employee">,
    status: OrderEmployeeStatusEnum,
  ): Promise<void> {
    const [order, orderLeaders, adminUsers] = await Promise.all([
      this.orderRepository.findById(orderId),
      this.orderLeaderRepository.findByOptions({ where: { orderId } }),
      this.userRepository.getRepository().find({
        where: { role: UserRoleEnum.ADMIN },
        select: { id: true },
      }),
    ]);
    if (!order) {
      return;
    }

    const leaderEmployeeIds = [...new Set(orderLeaders.map((leader) => leader.employeeId))];
    const [leaderUsers, creatorUserIds] = await Promise.all([
      leaderEmployeeIds.length
        ? this.userRepository.getRepository().find({
            where: { employeeId: In(leaderEmployeeIds) },
            select: { id: true },
          })
        : Promise.resolve([]),
      order.createdByEmployeeId
        ? this.userRepository.findUserIdsByEmployeeIds([order.createdByEmployeeId])
        : Promise.resolve([]),
    ]);
    const userIds = [
      ...new Set([...adminUsers.map((user) => user.id), ...leaderUsers.map((user) => user.id), ...creatorUserIds]),
    ];
    if (userIds.length === 0) {
      return;
    }

    const isConfirmed = status === OrderEmployeeStatusEnum.CONFIRMED;
    const employeeName = orderEmployee.employee?.name || "Nhân viên";
    await this.notificationService.createNotificationForMultipleUsers(
      userIds,
      {
        title: isConfirmed ? "Nhân viên xác nhận thực hiện hợp đồng" : "Nhân viên từ chối thực hiện hợp đồng",
        content: isConfirmed
          ? `Nhân viên ${employeeName} đã xác nhận thực hiện hợp đồng.`
          : `Nhân viên ${employeeName} đã từ chối thực hiện hợp đồng.`,
        type: NotificationTypeEnum.ALERT,
        objectId: orderId,
        metadata: {
          orderId,
          orderCode: order.code,
          event: "ORDER_EMPLOYEE_ASSIGNMENT_STATUS_UPDATED",
          status,
        },
      },
      undefined,
      { orderCode: order.code },
    );
  }

  async notifyUrgentOrderEmployeeAdded(orderId: string, orderEmployeeId: string): Promise<void> {
    const [order, orderEmployee] = await Promise.all([
      this.orderRepository.findByOption({
        where: { id: orderId, isUrgent: true },
        select: {
          id: true,
          code: true,
          isUrgent: true,
        },
      }),
      this.orderEmployeeRepository.findByOption({
        where: { id: orderEmployeeId, orderId },
        select: {
          id: true,
          orderId: true,
          employeeId: true,
        },
      }),
    ]);

    if (!order || !orderEmployee) {
      return;
    }

    const userIds = await this.userRepository.findUserIdsByEmployeeIds([orderEmployee.employeeId]);
    if (userIds.length === 0) {
      return;
    }

    await this.notificationService.createNotificationForMultipleUsers(
      userIds,
      {
        title: "Yêu cầu xác nhận tham gia hợp đồng",
        content: "Vui lòng nhanh chóng vào xác nhận đồng ý hoặc từ chối tham gia hợp đồng.",
        type: NotificationTypeEnum.ALERT,
        objectId: order.id,
        metadata: {
          orderId: order.id,
          orderCode: order.code,
          event: "URGENT_ORDER_EMPLOYEE_ASSIGNED",
        },
      },
      undefined,
      { orderCode: order.code },
    );
  }

  async notifyOrderEmployeeRemoved(orderId: string, employeeId: string): Promise<void> {
    const order = await this.orderRepository.findByOption({
      where: { id: orderId },
      select: {
        id: true,
        code: true,
      },
    });

    if (!order) {
      return;
    }

    const userIds = await this.userRepository.findUserIdsByEmployeeIds([employeeId]);
    if (userIds.length === 0) {
      return;
    }

    await this.notificationService.createNotificationForMultipleUsers(
      userIds,
      {
        title: "Bạn đã được xóa khỏi hợp đồng",
        content: `Bạn đã được xóa khỏi hợp đồng ${order.code}.`,
        type: NotificationTypeEnum.ALERT,
        objectId: order.id,
        metadata: {
          orderId: order.id,
          orderCode: order.code,
          employeeId,
          event: "ORDER_EMPLOYEE_REMOVED",
        },
      },
      undefined,
      { orderCode: order.code },
    );
  }

  async validateBeforeCreate(data: CreateOrderEmployeeDto, req?: Request, manager?: IEntityManager): Promise<void> {
    console.log("req", req?.params);
    const orderId = req?.params?.orderId as string | undefined;

    // Gán orderId từ params vào data trước khi tạo
    if (orderId) {
      data.orderId = orderId;
    } else {
      throw new BadRequestError("orderId is required");
    }

    const orderExist = await this.orderRepository.findById(data.orderId!, manager);

    if (!orderExist) {
      throw new BadRequestError("Hợp đồng không tồn tại");
    }

    data.note = resolveOrderEmployeeDefaultNote(data.note, orderExist.address?.detail);

    const employeeExist = await this.employeeRepository.findById(data.employeeId, manager);
    if (!employeeExist) {
      throw new BadRequestError("Nhân viên không tồn tại");
    }

    //? kiểm tra xem nhân viên đã có trong hợp đồng chưa
    const existing = await this.orderEmployeeRepository.findByOptions(
      { where: { orderId: data.orderId, employeeId: data.employeeId } },
      manager,
    );
    if (existing.length > 0) {
      throw new BadRequestError("Nhân viên đã có trong hợp đồng");
    }

    if (data.startTime && data.endTime) {
      const startTime = data.startTime;
      const endTime = data.endTime;

      if (startTime === endTime) {
        throw new BadRequestError(
          "Thời gian làm việc không hợp lệ, thời gian bắt đầu và kết thúc không được trùng nhau",
        );
      }

      const totalHours = computeTotalHours(startTime, endTime, data.breakTime);
      if (totalHours !== undefined) {
        data.totalHours = totalHours;
      }
    }

    if (data.leaderPercentAmount && data.leaderPercentAmount > 0) {
      if (!data.isLeader) {
        throw new BadRequestError("Chỉ có thể nhập phần trăm cho nhân viên phụ trách chính");
      }

      const totalPercentAmount = await this.orderEmployeeRepository.sumByOptions("leaderPercentAmount", {
        where: {
          orderId: orderExist.id,
          isLeader: true,
        },
      });

      console.log("totalPercentAmount", totalPercentAmount);

      if (totalPercentAmount + data.leaderPercentAmount > orderExist.amount) {
        throw new BadRequestError(
          "Tổng số tiền phần trăm cho nhân viên phụ trách chính không được vượt quá tổng giá trị hợp đồng",
        );
      }
    }
  }

  async actionAfterCreate(data: OrderEmployee, req?: Request, manager?: IEntityManager): Promise<void> {
    const employee = await this.employeeRepository.findByOption(
      {
        where: {
          id: data.employeeId,
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

    if (!employee) {
      throw new BadRequestError("Nhân viên không tồn tại");
    }

    // if (employee.isWorking) {
    //   throw new BadRequestError("Nhân viên đang trong công việc khác, không thể thêm vào hợp đồng");
    // }

    //? create comment trong hợp đồng
    await this.orderCommentService.create(
      {
        orderId: data.orderId,
        userId: null,
        content: `Nhân viên ${employee.zaloName || employee.name} đã được thêm vào hợp đồng`,
      },
      undefined,
      manager,
    );

    // gửi thông báo đến cho nhân viên
    if (employee.user && employee.user.id) {
      const order = await this.orderRepository.findById(data.orderId, manager);
      if (!order) {
        throw new BadRequestError("Hợp đồng không tồn tại");
      }

      await this.notificationService.createNotificationForMultipleUsers(
        [employee.user.id],
        {
          title: "Bạn đã được thêm vào hợp đồng",
          content: "Vui lòng nhanh chóng vào xác nhận đồng ý hoặc từ chối tham gia hợp đồng.",
          type: NotificationTypeEnum.ALERT,
          objectId: data.orderId,
          metadata: {
            orderId: data.orderId,
            orderCode: "",
            event: "URGENT_ORDER_EMPLOYEE_ASSIGNED",
          },
        },
        undefined,
        { orderCode: order.code },
      );
    }

    //? nếu có nhập thời gian làm việc thì tạo bản ghi timeKeeping
    await this.timeKeepingRepository.createTimeKeepingForEmployeeInOrder(data, manager);

    await this.employeeRepository.updateEmployeeStatus(data.employeeId, manager);

    //? kiểm tra xem nhân viên có phải là đầu cánh không, nếu đúng thì tạo callNavigation cho nhân viên này
    // if (data.isLeader) {
    //   const order = await this.orderRepository.findById(data.orderId, manager);
    //   if (!order) {
    //     throw new BadRequestError("Hợp đồng không tồn tại");
    //   }

    //   await this.callNavigationService.makeCallToCustomer(order, employee.user.id, manager);
    // }
  }

  async validateBeforeUpdate(
    id: string,
    data: UpdateOrderEmployeeDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const existing = await this.orderEmployeeRepository.findById(id, manager);
    if (!existing) {
      throw new BadRequestError("Nhân viên trong hợp đồng không tồn tại");
    }

    const orderExist = await this.orderRepository.findById(existing.orderId, manager);
    if (!orderExist) {
      throw new BadRequestError("Hợp đồng không tồn tại");
    }

    if (data.startTime || data.salary) {
      //? chỉ chặn khi gọi qua api
      if (req) {
        const canEdit = req.user?.permissionAdvance || false;
        if (!canEdit) {
          throw new BadRequestError("Bạn không có quyền chỉnh sửa thông tin này");
        }
      }
    }

    // //? nếu đã xác nhận mức lương thì không cho chỉnh sửa thông tin liên quan đến lương , chỉ admin mới được chỉnh sửa khi đã xác nhận mức lương
    // if (!existing.isConfirmed) {
    //   if (data.startTime || data.salary) {
    //     //? chỉ chặn khi gọi qua api
    //     if (req) {
    //       const canEdit = req.user?.permissionAdvance || false;
    //       if (!canEdit) {
    //         throw new BadRequestError("Bạn không có quyền chỉnh sửa thông tin này");
    //       }
    //     }
    //   }
    // } else {
    //   const userId = req?.user?.userId;
    //   const user = await this.userRepository.findById(userId!, manager);
    //   if (data.salary && data.salary !== existing.salary && user && user.role !== UserRoleEnum.ADMIN) {
    //     throw new BadRequestError("Bạn không có quyền chỉnh sửa thông tin này, vui lòng liên hệ admin để được hỗ trợ");
    //   }
    // }

    if (data.employeeId && data.employeeId !== existing.employeeId) {
      const employee = await this.employeeRepository.findById(data.employeeId, manager);
      if (!employee) {
        throw new BadRequestError("Nhân viên không tồn tại");
      }
    }

    //? tinh tong so gio lam viec, vi du tu 08:00:00 - 17:00:00 = 9 gio, tru breakTime neu co
    const hasStartEndChange =
      (data.startTime && data.endTime) || (data.startTime && existing.endTime) || (existing.startTime && data.endTime);

    //? TH1: co thay doi startTime/endTime -> tinh lai totalHours
    if (hasStartEndChange) {
      const startTime = data.startTime || existing.startTime;
      const endTime = data.endTime || existing.endTime;

      if (startTime === endTime) {
        throw new BadRequestError(
          "Thời gian làm việc không hợp lệ, thời gian bắt đầu và kết thúc không được trùng nhau",
        );
      }

      // breakTime moi (neu co) hoac lay tu DB
      const breakTime = data.breakTime !== undefined ? data.breakTime : existing.breakTime;

      const totalHours = computeTotalHours(startTime, endTime, breakTime);
      if (totalHours !== undefined) {
        data.totalHours = totalHours;
      }
    }
    //? TH2: chi thay doi breakTime (startTime/endTime khong doi nhung ca 2 da ton tai) -> tinh lai totalHours
    else if (data.breakTime !== undefined && existing.startTime && existing.endTime) {
      const totalHours = computeTotalHours(existing.startTime, existing.endTime, data.breakTime);
      if (totalHours !== undefined) {
        data.totalHours = totalHours;
      }
    }

    if (data.leaderPercentAmount && data.leaderPercentAmount > 0) {
      if (!data.isLeader) {
        throw new BadRequestError("Chỉ có thể nhập phần trăm cho nhân viên phụ trách chính");
      }

      const totalPercentAmount = await this.orderEmployeeRepository.sumByOptions("leaderPercentAmount", {
        where: {
          orderId: orderExist.id,
          isLeader: true,
          employeeId: Not(existing.employeeId), //? khi update thì không tính phần trăm của chính nhân viên đó để tránh trường hợp nhân viên phụ trách chính tự nhập phần trăm vượt quá tổng giá trị hợp đồng
        },
      });

      console.log("totalPercentAmount", totalPercentAmount);

      if (totalPercentAmount + data.leaderPercentAmount > orderExist.amount) {
        throw new BadRequestError(
          "Tổng số tiền phần trăm cho nhân viên phụ trách chính không được vượt quá tổng giá trị hợp đồng",
        );
      }
    }
  }

  async actionAfterUpdate(data: OrderEmployee, req?: Request, manager?: IEntityManager): Promise<void> {
    const employee = await this.employeeRepository.findByOption(
      {
        where: {
          id: data.employeeId,
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

    if (!employee) {
      throw new BadRequestError("Nhân viên không tồn tại");
    }

    await this.timeKeepingRepository.updateTimeKeepingForEmployeeInOrder(data, manager);

    await this.employeeRepository.updateEmployeeStatus(data.employeeId, manager);

    //? kiểm tra xem nhân viên có phải là đầu cánh không, nếu đúng thì tạo callNavigation cho nhân viên này
    // if (data.isLeader) {
    //   const order = await this.orderRepository.findById(data.orderId, manager);
    //   if (!order) {
    //     throw new BadRequestError("Hợp đồng không tồn tại");
    //   }

    //   await this.callNavigationService.makeCallToCustomer(order, employee.user.id, manager);
    // }
  }

  async validateBeforeDelete(id: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const existing = await this.orderEmployeeRepository.findById(id, manager);
    if (!existing) {
      throw new BadRequestError("Nhân viên trong hợp đồng không tồn tại");
    }
  }

  async getDeleteMeta(id: string, manager?: IEntityManager): Promise<OrderEmployeeDeleteMeta | null> {
    const existing = await this.orderEmployeeRepository.findByOption(
      {
        where: { id },
        select: {
          id: true,
          orderId: true,
          employeeId: true,
        },
      },
      manager,
    );

    if (!existing) {
      return null;
    }

    return {
      orderId: existing.orderId,
      employeeId: existing.employeeId,
    };
  }

  async actionAfterDelete(data: OrderEmployee, req?: Request, manager?: IEntityManager): Promise<void> {
    //? xóa bản ghi timeKeeping liên quan
    await this.timeKeepingRepository.deleteTimeKeepingForEmployeeInOrder(data, manager);

    //? cập nhật trạng thái làm việc của nhân viên
    await this.employeeRepository.updateEmployeeStatus(data.employeeId, manager);

    // lấy thông tin nhân viên
    const employee = await this.employeeRepository.findByOption(
      {
        where: {
          id: data.employeeId,
        },
        select: {
          id: true,
          name: true,
          zaloName: true,
          phone: true,
          user: {
            id: true,
          },
        },
        relations: {
          user: true,
        },
      },
      manager,
    );

    if (!employee) {
      throw new NotFoundError("Nhân viên không còn tồn tại");
    }

    // xóa hết điều hướng của nhân viên này trong hợp đồng nếu có
    if (employee.user && employee.user.id) {
      await this.callNavigationRepository.deleteCallNavigationByOrderAndUser(data.orderId, employee.user.id);
    }

    //? create comment trong hợp đồng
    await this.orderCommentService.create(
      {
        orderId: data.orderId,
        userId: null,
        content: `Nhân viên ${employee?.zaloName || employee?.name || "Không xác định"} đã được xóa khỏi hợp đồng.`,
      },
      req,
      manager,
    );
  }

  async confirmSalary(id: string, manager?: IEntityManager): Promise<OrderEmployee> {
    const existing = await this.orderEmployeeRepository.findById(id, manager);
    if (!existing) {
      throw new BadRequestError("Nhân viên trong hợp đồng không tồn tại");
    }

    if (existing.isConfirmed) {
      throw new BadRequestError("Mức lương đã được xác nhận, không thể xác nhận lại");
    }

    if (!existing.salary) {
      throw new BadRequestError("Mức lương chưa được nhập, không thể xác nhận");
    }

    await this.orderEmployeeRepository.update(id, { isConfirmed: true }, manager);

    const updated = await this.orderEmployeeRepository.findById(id, manager);
    return updated!;
  }

  async updateStartTime(orderId: string, manager?: IEntityManager): Promise<void> {
    const orderEmployees = await this.orderEmployeeRepository.findByOptions(
      { where: { orderId }, order: { createdAt: "ASC" } },
      manager,
    );

    if (orderEmployees.length === 0) {
      return;
    }

    //? cập nhật giờ làm việc bắt đầu cho tất cả nhân viên trong hợp đồng
    await Promise.all(
      orderEmployees.map((oe) =>
        this.update(
          oe.id,
          {
            timeAt: dayjs().tz("Asia/Ho_Chi_Minh").toDate(),
            startTime: dayjs().tz("Asia/Ho_Chi_Minh").format("HH:mm:ss"),
          },
          undefined,
          manager,
        ),
      ),
    );
  }

  async updateEndTime(orderId: string, manager?: IEntityManager): Promise<string[]> {
    const endTime = dayjs().tz("Asia/Ho_Chi_Minh").format("HH:mm:ss");
    return this.orderEmployeeRepository.completeEmployeesForOrder(orderId, endTime, manager);
  }

  async updateManyData(
    data: UpdateOrderEmployeeMultiDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<any>> {
    const { orderEmployeeIds, ...updateData } = data;
    for (const id of orderEmployeeIds) {
      await this.update(id, updateData, req, manager);
    }

    return ApiResponseHandler.updateSuccess("OK");
  }

  async deleteFromOrder(orderId: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const orderEmployees = await this.orderEmployeeRepository.findByOptions({ where: { orderId } }, manager);
    const orderEmployeeIds = orderEmployees.map((oe) => oe.id);

    if (orderEmployeeIds.length > 0) {
      for (const id of orderEmployeeIds) {
        await this.delete(id, req, manager);
      }
    }
  }
}
