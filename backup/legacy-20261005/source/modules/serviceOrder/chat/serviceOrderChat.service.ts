import { Order } from "@/database/models/Order";
import { ServiceOrder } from "@/database/models/ServiceOrder";
import { ServiceOrderChatMessage } from "@/database/models/ServiceOrderChatMessage";
import { User } from "@/database/models/User";
import { NotificationService } from "@/modules/notification/notification.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { OrderRepository } from "@/modules/order/order.repository";
import { ORDER_TYPES } from "@/modules/order/order.types";
import { SERVICE_ORDER_TYPES } from "@/modules/serviceOrder/serviceOrder.types";
import { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { COMMON_TYPES } from "@/modules/common/common.types";
import {
  NotificationTypeEnum,
  ServiceOrderStatusEnum,
  ServiceOrderChatMessageTypeEnum,
  ServiceOrderTypeEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { formatOrderNotificationTitle } from "@/shared/utils/notification.utils";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/shared/types/errors";
import { inject, injectable } from "inversify";
import { In } from "typeorm";
import { SERVICE_ORDER_CHAT_TYPES, getServiceOrderChatRoomId } from "./serviceOrderChat.types";
import {
  AddChatParticipantDto,
  CreateServiceOrderChatMessageDto,
  CreateServiceOrderChatMessageInternalDto,
  ServiceOrderChatMessageQueryDto,
} from "./serviceOrderChat.validator";
import { ServiceOrderChatRepository } from "./serviceOrderChat.repository";
import { ServiceOrderChatParticipantRepository } from "./serviceOrderChatParticipant.repository";
import { ServiceOrderChatParticipant } from "@/database/models/ServiceOrderChatParticipant";
import { AdminServiceOrderRepository } from "../admin.serviceOrder.repository";

type ServiceOrderChatContext = {
  serviceOrder: ServiceOrder;
  linkedOrder:
    | (Pick<Order, "id" | "code" | "name"> & {
        orderEmployees: Array<{ employeeId: string; isLeader: boolean }>;
        orderLeaders: Array<{ employeeId: string }>;
      })
    | null;
  managerEmployeeIds: string[];
  participants: User[];
};

const SERVICE_ORDER_TYPE_LABELS: Record<ServiceOrderTypeEnum, string> = {
  [ServiceOrderTypeEnum.BOC_XEP_THEO_CA]: "Bốc xếp theo ca",
  [ServiceOrderTypeEnum.CHUYEN_NHA_VAN_PHONG]: "Chuyển nhà / văn phòng",
  [ServiceOrderTypeEnum.PHA_DO_HOAN_TRA]: "Phá dỡ hoàn trả mặt bằng",
  [ServiceOrderTypeEnum.VAN_CHUYEN_VAT_TU]: "Vận chuyển vật tư",
  [ServiceOrderTypeEnum.NANG_HA_CONT]: "Nâng hạ container",
  [ServiceOrderTypeEnum.DICH_VU_VAN_TAI]: "Dịch vụ vận tải",
  [ServiceOrderTypeEnum.XE_NANG_XE_CAU]: "Xe nâng / xe cẩu",
};

const ORDER_STATUS_LABELS: Record<ServiceOrderStatusEnum, string> = {
  [ServiceOrderStatusEnum.WAITING_FOR_CUSTOMER_CONFIRMATION]: "Chờ khách xác nhận",
  [ServiceOrderStatusEnum.WAITING_FOR_QUOTE]: "Chờ báo giá",
  [ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION]: "Chờ xác nhận đơn",
  [ServiceOrderStatusEnum.CONFIRMED]: "Đã xác nhận",
  [ServiceOrderStatusEnum.PROCESSING]: "Đang xử lý",
  [ServiceOrderStatusEnum.COMPLETED_BY_EMPLOYEE]: "Nhân viên xác nhận hoàn thành",
  [ServiceOrderStatusEnum.COMPLETED_BY_CUSTOMER]: "Khách hàng xác nhận hoàn thành",
  [ServiceOrderStatusEnum.CANCELED]: "Đã hủy",
};

@injectable()
export class ServiceOrderChatService {
  constructor(
    @inject(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatRepository)
    private readonly chatRepository: ServiceOrderChatRepository,
    @inject(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatParticipantRepository)
    private readonly participantRepository: ServiceOrderChatParticipantRepository,
    @inject(SERVICE_ORDER_TYPES.AdminServiceOrderRepository)
    private readonly serviceOrderRepository: AdminServiceOrderRepository,
    @inject(ORDER_TYPES.OrderRepository)
    private readonly orderRepository: OrderRepository,
    @inject(USER_TYPES.UserRepository)
    private readonly userRepository: UserRepository,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private readonly notificationService: NotificationService,
    @inject(COMMON_TYPES.TransactionManager)
    private readonly transactionManager: TransactionManager,
  ) {}

  private buildChatSubject(serviceOrder: ServiceOrder, linkedOrder: ServiceOrderChatContext["linkedOrder"]): string {
    return (
      linkedOrder?.name ||
      serviceOrder.contactName ||
      SERVICE_ORDER_TYPE_LABELS[serviceOrder.type] ||
      "Chat đơn dịch vụ"
    );
  }

  private buildChatTitle(serviceOrder: ServiceOrder, linkedOrder: ServiceOrderChatContext["linkedOrder"]): string {
    const subject = this.buildChatSubject(serviceOrder, linkedOrder);
    return formatOrderNotificationTitle(linkedOrder?.code, subject);
  }

  private buildSenderDisplayName(sender: User | null): string {
    if (!sender) {
      return "Hệ thống";
    }

    return sender.name || sender.username || sender.phone || "Người dùng";
  }

  private buildNotificationContent(message: ServiceOrderChatMessage, sender: User | null): string {
    if (message.messageType === ServiceOrderChatMessageTypeEnum.SYSTEM) {
      return message.content || "Có cập nhật mới trong chat";
    }

    const senderName = this.buildSenderDisplayName(sender);

    if (message.messageType === ServiceOrderChatMessageTypeEnum.IMAGE) {
      return `${senderName} đã gửi hình ảnh`;
    }

    if (message.messageType === ServiceOrderChatMessageTypeEnum.FILE) {
      return `${senderName} đã gửi tệp đính kèm`;
    }

    return `${senderName}: ${message.content || "Tin nhắn mới"}`;
  }

  private determineMessageType(
    payload: Pick<CreateServiceOrderChatMessageInternalDto, "content" | "attachments" | "messageType">,
  ): ServiceOrderChatMessageTypeEnum {
    if (payload.messageType === ServiceOrderChatMessageTypeEnum.SYSTEM) {
      return ServiceOrderChatMessageTypeEnum.SYSTEM;
    }

    if (payload.attachments && payload.attachments.length > 0) {
      const allImages = payload.attachments.every((attachment: any) => {
        const mimeType = attachment?.mimeType || attachment?.mimetype || attachment?.type || "";
        const category = attachment?.category || "";
        return String(mimeType).toLowerCase().startsWith("image/") || category === "image";
      });

      return allImages ? ServiceOrderChatMessageTypeEnum.IMAGE : ServiceOrderChatMessageTypeEnum.FILE;
    }

    return ServiceOrderChatMessageTypeEnum.TEXT;
  }

  private async resolveChatContext(serviceOrderId: string, manager?: IEntityManager): Promise<ServiceOrderChatContext> {
    const serviceOrder = await this.serviceOrderRepository.findById(serviceOrderId, manager);

    if (!serviceOrder) {
      throw new NotFoundError("Không tìm thấy đơn dịch vụ");
    }

    const linkedOrder = (await this.orderRepository.findByOption(
      {
        where: {
          serviceOrderId,
        },
        select: {
          id: true,
          code: true,
          name: true,
          orderEmployees: {
            employeeId: true,
            isLeader: true,
          },
          orderLeaders: {
            employeeId: true,
          },
        },
        relations: {
          orderEmployees: true,
          orderLeaders: true,
        },
      } as any,
      manager,
    )) as ServiceOrderChatContext["linkedOrder"];

    const managerEmployeeIds = [
      ...new Set(
        [
          ...(linkedOrder?.orderEmployees || [])
            .filter((item) => item.isLeader)
            .map((item) => item.employeeId),
          ...(linkedOrder?.orderLeaders || []).map((item) => item.employeeId),
        ],
      ),
    ];

    const [customerUsers, managerUsers, adminUsers, customParticipants] = await Promise.all([
      this.userRepository.findByOptions(
        {
          where: {
            customerId: serviceOrder.customerId,
          },
        } as any,
        manager,
      ),
      managerEmployeeIds.length > 0
        ? this.userRepository.findByOptions(
            {
              where: {
                employeeId: In(managerEmployeeIds),
              },
            } as any,
            manager,
          )
        : Promise.resolve([]),
      this.userRepository.findByOptions(
        {
          where: {
            role: UserRoleEnum.ADMIN,
          },
        } as any,
        manager,
      ),
      this.participantRepository.findByServiceOrderId(serviceOrderId, manager),
    ]);

    // Fetch extra users từ custom participants
    const customUserIds = customParticipants.map((p) => p.userId);
    const extraUsers =
      customUserIds.length > 0
        ? await this.userRepository.findByOptions({ where: { id: In(customUserIds) } } as any, manager)
        : [];

    const participantsMap = new Map<string, User>();
    [...customerUsers, ...managerUsers, ...adminUsers, ...extraUsers].forEach((user) => {
      participantsMap.set(user.id, user);
    });

    return {
      serviceOrder,
      linkedOrder,
      managerEmployeeIds,
      participants: [...participantsMap.values()],
    };
  }

  private async authorizeUser(
    serviceOrderId: string,
    userId: string,
    manager?: IEntityManager,
  ): Promise<{
    context: ServiceOrderChatContext;
    user: User;
  }> {
    const [context, user] = await Promise.all([
      this.resolveChatContext(serviceOrderId, manager),
      this.userRepository.findById(userId, manager),
    ]);

    if (!user) {
      throw new UnauthorizedError("Người dùng không tồn tại");
    }

    const isAdmin = user.role === UserRoleEnum.ADMIN;
    const isCustomer = !!user.customerId && user.customerId === context.serviceOrder.customerId;
    const isManager = !!user.employeeId && context.managerEmployeeIds.includes(user.employeeId);

    console.log("Chat authorization:", { userId, isAdmin, isCustomer, isManager });

    if (!isAdmin && !isCustomer && !isManager) {
      throw new ForbiddenError("Bạn không có quyền truy cập phòng chat của đơn dịch vụ này");
    }

    return { context, user };
  }

  private async notifyParticipants(
    message: ServiceOrderChatMessage,
    context: ServiceOrderChatContext,
    sender: User | null,
    taggedUsers: User[],
    manager?: IEntityManager,
  ): Promise<void> {
    const roomId = getServiceOrderChatRoomId(message.serviceOrderId);
    const eventPayload = {
      roomId,
      serviceOrderId: message.serviceOrderId,
      message,
    };

    SocketUtils.sendSocketToRoom("service-order-chat:new-message", roomId, eventPayload);

    const targetUsers = context.participants.filter((participant) => participant.id !== message.senderUserId);
    if (targetUsers.length === 0) {
      return;
    }

    const onlineSocketIds = await SocketUtils.getRoomMembers(roomId);
    const onlineSocketIdSet = new Set(onlineSocketIds);

    const taggedUserIdSet = new Set(taggedUsers.map((u) => u.id));

    // Tagged users (exclude sender): luôn nhận MENTION notification dù đang online
    const taggedTargets = targetUsers.filter((u) => taggedUserIdSet.has(u.id));

    // Offline users không được tag: nhận CHAT notification như bình thường
    const offlineNonTaggedUsers = targetUsers.filter((u) => {
      if (taggedUserIdSet.has(u.id)) return false;
      const userSocketIds = SocketUtils.getUserSocket(u.id);
      return userSocketIds.length === 0 || !userSocketIds.some((socketId) => onlineSocketIdSet.has(socketId));
    });

    const chatSubject = this.buildChatSubject(context.serviceOrder, context.linkedOrder);
    const orderCode = context.linkedOrder?.code;
    const title = this.buildChatTitle(context.serviceOrder, context.linkedOrder);
    const content = this.buildNotificationContent(message, sender);

    // Gửi MENTION notification + Firebase + socket riêng cho tagged users
    if (taggedTargets.length > 0) {
      const mentionTitle = formatOrderNotificationTitle(orderCode, `Bạn được nhắc đến: ${chatSubject}`);
      const taggedTargetIds = taggedTargets.map((u) => u.id);

      await this.notificationService.createNotificationForMultipleUsers(
        taggedTargetIds,
        {
          title: mentionTitle,
          content,
          type: NotificationTypeEnum.MENTION,
          objectId: message.serviceOrderId,
          metadata: {
            serviceOrderId: message.serviceOrderId,
            roomId,
            messageId: message.id,
            messageType: message.messageType,
          },
        },
        manager,
        { orderCode },
      );

      taggedTargets.forEach((participant) => {
        FirebaseUtils.SentFirebaseWithUser({
          userId: participant.id,
          orderCode,
          title: mentionTitle,
          content,
          data: {
            type: NotificationTypeEnum.MENTION,
            serviceOrderId: message.serviceOrderId,
            roomId,
            messageId: message.id,
            messageType: message.messageType,
          },
        });
        // Socket event riêng để FE có thể highlight mention
        SocketUtils.sendSocketToUser("service-order-chat:mention", participant.id, eventPayload);
      });
    }

    // Gửi CHAT notification cho offline users không được tag
    if (offlineNonTaggedUsers.length > 0) {
      const offlineTargetIds = offlineNonTaggedUsers.map((u) => u.id);

      await this.notificationService.createNotificationForMultipleUsers(
        offlineTargetIds,
        {
          title,
          content,
          type: NotificationTypeEnum.CHAT,
          objectId: message.serviceOrderId,
          metadata: {
            serviceOrderId: message.serviceOrderId,
            roomId,
            messageId: message.id,
            messageType: message.messageType,
          },
        },
        manager,
        { orderCode },
      );

      offlineNonTaggedUsers.forEach((participant) => {
        FirebaseUtils.SentFirebaseWithUser({
          userId: participant.id,
          orderCode,
          title,
          content,
          data: {
            type: NotificationTypeEnum.CHAT,
            serviceOrderId: message.serviceOrderId,
            roomId,
            messageId: message.id,
            messageType: message.messageType,
          },
        });
      });
    }
  }

  private async createMessageInternal(
    payload: CreateServiceOrderChatMessageInternalDto,
    manager?: IEntityManager,
  ): Promise<ServiceOrderChatMessage> {
    const context =
      payload.senderUserId !== null
        ? (await this.authorizeUser(payload.serviceOrderId, payload.senderUserId, manager)).context
        : await this.resolveChatContext(payload.serviceOrderId, manager);

    // Validate và resolve tagged users
    let taggedUsers: User[] = [];
    if (payload.tags && payload.tags.length > 0) {
      const participantIdSet = new Set(context.participants.map((p) => p.id));
      const invalidTags = payload.tags.filter((id) => !participantIdSet.has(id));
      if (invalidTags.length > 0) {
        throw new BadRequestError("Một số người dùng được tag không thuộc phòng chat này");
      }
      taggedUsers = context.participants.filter((p) => payload.tags!.includes(p.id));
    }

    const sender = payload.senderUserId ? await this.userRepository.findById(payload.senderUserId, manager) : null;
    const messageType = this.determineMessageType(payload);

    const createdMessage = await this.chatRepository.create(
      {
        serviceOrderId: payload.serviceOrderId,
        senderUserId: payload.senderUserId,
        content: payload.content || null,
        attachments: payload.attachments || null,
        messageType,
        metadata: payload.metadata || null,
        tags: payload.tags?.length ? payload.tags : null,
        timeAt: payload.timeAt || new Date(),
      },
      manager,
    );

    const fullMessage = await this.chatRepository.findById(createdMessage.id, manager);
    if (!fullMessage) {
      throw new NotFoundError("Không thể tải lại tin nhắn vừa tạo");
    }

    await this.notifyParticipants(fullMessage, context, sender, taggedUsers, manager);

    return fullMessage;
  }

  async listMessages(
    serviceOrderId: string,
    query: ServiceOrderChatMessageQueryDto,
    userId: string,
    manager?: IEntityManager,
  ): Promise<ApiResponse<ServiceOrderChatMessage[]>> {
    await this.authorizeUser(serviceOrderId, userId, manager);

    const result = await this.chatRepository.listMessages(
      serviceOrderId,
      {
        page: query.page,
        size: query.size,
        sortOrder: query.sortOrder,
      },
      manager,
    );

    const data = query.sortOrder === "DESC" ? [...result.data].reverse() : result.data;

    return ApiResponseHandler.getSuccess(
      "OK",
      data,
      {
        totalRecords: result.total,
        currentPage: query.page,
        size: query.size,
        totalPages: Math.ceil(result.total / query.size),
      },
      {
        roomId: getServiceOrderChatRoomId(serviceOrderId),
      },
    );
  }

  async createMessage(
    serviceOrderId: string,
    dto: CreateServiceOrderChatMessageDto,
    userId: string,
    manager?: IEntityManager,
  ): Promise<ApiResponse<ServiceOrderChatMessage>> {
    const execute = async (txManager: IEntityManager) => {
      const message = await this.createMessageInternal(
        {
          serviceOrderId,
          senderUserId: userId,
          content: dto.content?.trim() || null,
          attachments: dto.attachments || null,
          metadata: dto.metadata || null,
          tags: dto.tags || null,
          messageType: ServiceOrderChatMessageTypeEnum.TEXT,
        },
        txManager,
      );

      return ApiResponseHandler.createSuccess("OK", message);
    };

    if (manager) {
      return execute(manager);
    }

    return this.transactionManager.withTransactionCallback(execute);
  }

  async createSystemMessage(
    serviceOrderId: string,
    content: string,
    metadata?: Record<string, any> | null,
    manager?: IEntityManager,
  ): Promise<ServiceOrderChatMessage> {
    if (!content.trim()) {
      throw new BadRequestError("Nội dung thông báo hệ thống không hợp lệ");
    }

    if (manager) {
      return this.createMessageInternal(
        {
          serviceOrderId,
          senderUserId: null,
          content: content.trim(),
          attachments: null,
          metadata: metadata || null,
          messageType: ServiceOrderChatMessageTypeEnum.SYSTEM,
        },
        manager,
      );
    }

    return this.transactionManager.withTransactionCallback((txManager) =>
      this.createMessageInternal(
        {
          serviceOrderId,
          senderUserId: null,
          content: content.trim(),
          attachments: null,
          metadata: metadata || null,
          messageType: ServiceOrderChatMessageTypeEnum.SYSTEM,
        },
        txManager,
      ),
    );
  }

  async createStatusChangedSystemMessage(
    serviceOrderId: string,
    previousStatus: ServiceOrderStatusEnum,
    nextStatus: ServiceOrderStatusEnum,
    manager?: IEntityManager,
  ): Promise<void> {
    if (previousStatus === nextStatus) {
      return;
    }

    await this.createSystemMessage(
      serviceOrderId,
      `Trạng thái đơn dịch vụ đã chuyển từ "${ORDER_STATUS_LABELS[previousStatus]}" sang "${ORDER_STATUS_LABELS[nextStatus]}".`,
      {
        type: "SERVICE_ORDER_STATUS_CHANGED",
        previousStatus,
        nextStatus,
      },
      manager,
    );
  }

  async getRoomInfo(
    serviceOrderId: string,
    userId: string,
    manager?: IEntityManager,
  ): Promise<{
    roomId: string;
    participants: Array<Pick<User, "id" | "name" | "username" | "avatar" | "role" | "employeeId" | "customerId">>;
    customParticipants: Array<{
      id: string;
      userId: string;
      addedByUserId: string | null;
      createdAt: Date;
      user: Pick<User, "id" | "name" | "username" | "avatar"> | null;
      addedBy: Pick<User, "id" | "name" | "username"> | null;
    }>;
  }> {
    const { context } = await this.authorizeUser(serviceOrderId, userId, manager);
    const customParticipants = await this.participantRepository.findByServiceOrderId(serviceOrderId, manager);

    return {
      roomId: getServiceOrderChatRoomId(serviceOrderId),
      participants: context.participants.map((participant) => ({
        id: participant.id,
        name: participant.name,
        username: participant.username,
        avatar: participant.avatar ?? null,
        role: participant.role,
        employeeId: participant.employeeId,
        customerId: participant.customerId,
      })),
      customParticipants: customParticipants.map((cp) => ({
        id: cp.id,
        userId: cp.userId,
        addedByUserId: cp.addedByUserId,
        createdAt: cp.createdAt ?? new Date(),
        user: cp.user
          ? { id: cp.user.id, name: cp.user.name, username: cp.user.username, avatar: cp.user.avatar ?? null }
          : null,
        addedBy: cp.addedBy ? { id: cp.addedBy.id, name: cp.addedBy.name, username: cp.addedBy.username } : null,
      })),
    };
  }

  async addParticipant(
    serviceOrderId: string,
    data: AddChatParticipantDto,
    callerUserId: string,
    manager?: IEntityManager,
  ): Promise<ApiResponse> {
    const caller = await this.userRepository.findById(callerUserId, manager);
    if (!caller || caller.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenError("Chỉ admin mới có thể thêm thành viên vào cuộc hội thoại");
    }

    const serviceOrder = await this.serviceOrderRepository.findById(serviceOrderId, manager);
    if (!serviceOrder) {
      throw new NotFoundError("Không tìm thấy đơn dịch vụ");
    }

    const targetUser = await this.userRepository.findById(data.userId, manager);
    if (!targetUser) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    // Kiểm tra đã là participant chưa
    const existing = await this.participantRepository.findActiveByServiceOrderAndUser(
      serviceOrderId,
      data.userId,
      manager,
    );
    if (existing) {
      throw new ConflictError("Người dùng đã là thành viên của cuộc hội thoại này");
    }

    await this.participantRepository.create(
      { serviceOrderId, userId: data.userId, addedByUserId: callerUserId },
      manager,
    );

    // System message thông báo
    const systemMsg = `Admin đã thêm ${targetUser.name ?? targetUser.username} vào cuộc hội thoại`;
    await this.createSystemMessage(serviceOrderId, systemMsg);

    return ApiResponseHandler.getSuccess("Đã thêm thành viên vào cuộc hội thoại");
  }

  async removeParticipant(
    serviceOrderId: string,
    targetUserId: string,
    callerUserId: string,
    manager?: IEntityManager,
  ): Promise<ApiResponse> {
    const caller = await this.userRepository.findById(callerUserId, manager);
    if (!caller || caller.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenError("Chỉ admin mới có thể xóa thành viên khỏi cuộc hội thoại");
    }

    const existing = await this.participantRepository.findActiveByServiceOrderAndUser(
      serviceOrderId,
      targetUserId,
      manager,
    );
    if (!existing) {
      throw new NotFoundError("Người dùng không phải thành viên được thêm thủ công của cuộc hội thoại");
    }

    await this.participantRepository.softDelete(existing.id, manager);

    const targetUser = await this.userRepository.findById(targetUserId, manager);
    const systemMsg = `Admin đã xóa ${targetUser?.name ?? targetUser?.username ?? "thành viên"} khỏi cuộc hội thoại`;
    await this.createSystemMessage(serviceOrderId, systemMsg);

    return ApiResponseHandler.getSuccess("Đã xóa thành viên khỏi cuộc hội thoại");
  }
}
