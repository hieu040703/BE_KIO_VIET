import { inject, injectable } from "inversify";
import { In, IsNull } from "typeorm";
import { Request } from "express";
import { BaseService } from "@/shared/base/BaseService";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "@/shared/types/errors";
import { NotificationTypeEnum, UserRoleEnum } from "@/shared/constants/constance";
import { Order } from "@/database/models/Order";
import { OrderLeaderChat } from "@/database/models/OrderLeaderChat";
import { User } from "@/database/models/User";
import { OrderLeaderChatRepository } from "./orderLeaderChat.repository";
import { OrderLeaderChatReadStateRepository } from "./orderLeaderChatReadState.repository";
import { OrderLeaderChatRelations, OrderLeaderChatSelectFull } from "./orderLeaderChat.select";
import {
  CreateOrderLeaderChatDto,
  OrderLeaderChatQueryDto,
  OrderLeaderChatReadDto,
  UpdateOrderLeaderChatDto,
} from "./orderLeaderChat.validator";
import { ORDER_LEADER_CHAT_TYPES, getOrderLeaderChatRoomId } from "./orderLeaderChat.types";
import { ORDER_LEADER_TYPES } from "../orderLeader/orderLeader.types";
import { OrderLeaderRepository } from "../orderLeader/orderLeader.repository";
import { ORDER_TYPES } from "../order.types";
import { OrderRepository } from "../order.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import { UserRepository } from "@/modules/user/user.repository";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { NotificationService } from "@/modules/notification/notification.service";
import {
  canAccessOrderLeaderChat,
  getOrderLeaderChatNotificationRecipients,
  isMessageAfterCursor,
} from "./orderLeaderChat.policy";
import { buildOrderMentionNotification } from "@/shared/utils/notification.utils";

type OrderLeaderChatContext = {
  user: Pick<User, "id" | "name" | "username" | "role" | "employeeId">;
  order: Pick<Order, "id" | "code" | "name" | "createdByEmployeeId">;
  leaderEmployeeIds: string[];
  participantUserIds: string[];
};

@injectable()
export class OrderLeaderChatService extends BaseService<OrderLeaderChat> {
  protected relations = OrderLeaderChatRelations;
  protected selectedFields = OrderLeaderChatSelectFull;

  constructor(
    @inject(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatRepository)
    private readonly orderLeaderChatRepository: OrderLeaderChatRepository,
    @inject(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatReadStateRepository)
    private readonly readStateRepository: OrderLeaderChatReadStateRepository,
    @inject(ORDER_LEADER_TYPES.OrderLeaderRepository)
    private readonly orderLeaderRepository: OrderLeaderRepository,
    @inject(ORDER_TYPES.OrderRepository)
    private readonly orderRepository: OrderRepository,
    @inject(USER_TYPES.UserRepository)
    private readonly userRepository: UserRepository,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private readonly notificationService: NotificationService,
  ) {
    super(orderLeaderChatRepository);
  }

  private async getContext(orderId: string, userId: string, manager?: IEntityManager): Promise<OrderLeaderChatContext> {
    const [user, order, leaders] = await Promise.all([
      this.userRepository.getRepository(manager).findOne({
        where: { id: userId },
        select: { id: true, name: true, username: true, role: true, employeeId: true },
        loadEagerRelations: false,
      }),
      this.orderRepository.getRepository(manager).findOne({
        where: { id: orderId },
        select: { id: true, code: true, name: true, createdByEmployeeId: true },
        loadEagerRelations: false,
      }),
      this.orderLeaderRepository.getRepository(manager).find({
        where: { orderId, deletedAt: IsNull() },
        select: { employeeId: true },
      }),
    ]);

    if (!user) {
      throw new UnauthorizedError("Người dùng không tồn tại");
    }

    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    const leaderEmployeeIds = leaders.map((leader) => leader.employeeId);
    if (!canAccessOrderLeaderChat(user, leaderEmployeeIds, order.createdByEmployeeId)) {
      throw new ForbiddenError("Bạn không có quyền truy cập phòng chat quản lý");
    }

    const participantEmployeeIds = [
      ...new Set(
        [...leaderEmployeeIds, order.createdByEmployeeId].filter((employeeId): employeeId is string =>
          Boolean(employeeId),
        ),
      ),
    ];

    const [adminUsers, leaderAndCreatorUsers] = await Promise.all([
      this.userRepository.getRepository(manager).find({
        where: { role: UserRoleEnum.ADMIN, isActive: true },
        select: { id: true },
      }),
      participantEmployeeIds.length > 0
        ? this.userRepository.getRepository(manager).find({
            where: { employeeId: In(participantEmployeeIds), isActive: true },
            select: { id: true },
          })
        : Promise.resolve([]),
    ]);

    return {
      user,
      order,
      leaderEmployeeIds,
      participantUserIds: [...new Set([...adminUsers, ...leaderAndCreatorUsers].map((item) => item.id))],
    };
  }

  private async validateTags(
    tags: string[] | null | undefined,
    context: OrderLeaderChatContext,
    manager?: IEntityManager,
  ): Promise<void> {
    if (!tags || tags.length === 0) return;

    const invalidTags = tags.filter((userId) => !context.participantUserIds.includes(userId));
    if (invalidTags.length > 0) {
      throw new BadRequestError("Người được tag không thuộc phòng chat quản lý");
    }

    const existingUsers = await this.userRepository.getRepository(manager).find({
      where: { id: In(tags), isActive: true },
      select: { id: true },
    });
    if (existingUsers.length !== new Set(tags).size) {
      throw new BadRequestError("Danh sách người được tag không hợp lệ");
    }
  }

  private async validateReplyMessage(
    orderId: string,
    replyMessageId: string | null | undefined,
    manager?: IEntityManager,
  ): Promise<void> {
    if (!replyMessageId) return;

    const replyMessage = await this.orderLeaderChatRepository.findMessageInOrder(orderId, replyMessageId, manager);
    if (!replyMessage) {
      throw new BadRequestError("Tin nhắn trả lời không thuộc đơn hàng");
    }
  }

  async validateBeforeCreate(data: CreateOrderLeaderChatDto, req?: Request, manager?: IEntityManager): Promise<void> {
    const orderId = req?.params?.orderId as string | undefined;
    const userId = req?.user?.userId;

    if (!orderId) {
      throw new BadRequestError("Order ID is required");
    }
    if (data.orderId && data.orderId !== orderId) {
      throw new BadRequestError("Order ID không hợp lệ");
    }
    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const context = await this.getContext(orderId, userId, manager);
    await this.validateReplyMessage(orderId, data.replyMessageId, manager);
    await this.validateTags(data.tags, context, manager);

    Object.assign(data, {
      orderId,
      userId,
      content: data.content?.trim() || null,
      timeAt: new Date(),
    });
  }

  async actionAfterCreate(data: OrderLeaderChat, req?: Request, manager?: IEntityManager): Promise<void> {
    const context = await this.getContext(data.orderId, data.userId, manager);
    const { recipientIds, taggedRecipientIds, genericRecipientIds } = getOrderLeaderChatNotificationRecipients(
      context.participantUserIds,
      data.userId,
      data.tags,
    );
    const roomId = getOrderLeaderChatRoomId(data.orderId);
    const eventPayload = {
      roomId,
      orderId: data.orderId,
      message: data,
    };

    if (recipientIds.length > 0) {
      SocketUtils.sendSocketToMultipleUsers("order-leader-chat:new-message", recipientIds, eventPayload as any);
    }

    if (genericRecipientIds.length > 0) {
      await this.notificationService.createNotificationForMultipleUsers(
        genericRecipientIds,
        {
          title: context.order.name || "Chat quản lý",
          content: data.content || "Đã gửi tệp đính kèm",
          type: NotificationTypeEnum.CHAT,
          objectId: data.orderId,
          metadata: {
            chatType: "ORDER_LEADER",
            orderId: data.orderId,
            messageId: data.id,
            roomId,
          },
        },
        manager,
        { orderCode: context.order.code },
      );
    }

    if (taggedRecipientIds.length > 0) {
      const mentionNotificationContent = buildOrderMentionNotification(context.order, context.user);

      await this.notificationService.createNotificationForMultipleUsers(
        taggedRecipientIds,
        {
          ...mentionNotificationContent,
          type: NotificationTypeEnum.MENTION,
          objectId: data.orderId,
          metadata: {
            chatType: "ORDER_LEADER",
            orderId: data.orderId,
            messageId: data.id,
            roomId,
          },
        },
        manager,
      );
    }

    void req;
  }

  async listMessages(
    orderId: string,
    query: OrderLeaderChatQueryDto,
    userId: string,
    manager?: IEntityManager,
  ): Promise<ApiResponse<OrderLeaderChat[]>> {
    await this.getContext(orderId, userId, manager);
    const result = await this.orderLeaderChatRepository.listMessages(
      orderId,
      query.beforeMessageId,
      query.limit,
      manager,
    );
    const readState = await this.readStateRepository.findActive(orderId, userId, manager);
    const unreadCount = await this.orderLeaderChatRepository.countUnread(
      orderId,
      readState?.lastReadMessageId || null,
      manager,
    );

    return ApiResponseHandler.getSuccess("OK", result.data, undefined, {
      roomId: getOrderLeaderChatRoomId(orderId),
      lastReadMessageId: readState?.lastReadMessageId || null,
      unreadCount,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  }

  async getRoomInfo(orderId: string, userId: string, manager?: IEntityManager): Promise<ApiResponse> {
    const context = await this.getContext(orderId, userId, manager);
    const readState = await this.readStateRepository.findActive(orderId, userId, manager);
    const unreadCount = await this.orderLeaderChatRepository.countUnread(
      orderId,
      readState?.lastReadMessageId || null,
      manager,
    );
    const participants = await this.userRepository.getRepository(manager).find({
      where: { id: In(context.participantUserIds), isActive: true },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        role: true,
        employeeId: true,
        employee: { id: true, name: true, zaloName: true },
      },
      relations: { employee: true },
      loadEagerRelations: false,
    });

    return ApiResponseHandler.getSuccess("OK", {
      roomId: getOrderLeaderChatRoomId(orderId),
      participants,
      lastReadMessageId: readState?.lastReadMessageId || null,
      unreadCount,
    });
  }

  async countUnread(orderId: string, userId: string, manager?: IEntityManager): Promise<ApiResponse<number>> {
    await this.getContext(orderId, userId, manager);
    const readState = await this.readStateRepository.findActive(orderId, userId, manager);
    const count = await this.orderLeaderChatRepository.countUnread(
      orderId,
      readState?.lastReadMessageId || null,
      manager,
    );
    return ApiResponseHandler.getSuccess("OK", count);
  }

  async markAsRead(
    orderId: string,
    data: OrderLeaderChatReadDto,
    userId: string,
    manager?: IEntityManager,
  ): Promise<ApiResponse> {
    await this.getContext(orderId, userId, manager);
    const message = await this.orderLeaderChatRepository.findMessageInOrder(orderId, data.messageId, manager);
    if (!message) {
      throw new NotFoundError("Tin nhắn không tồn tại trong đơn hàng");
    }

    const currentState = await this.readStateRepository.findActive(orderId, userId, manager);
    if (currentState?.lastReadMessageId) {
      const currentMessage = await this.orderLeaderChatRepository.findMessageInOrder(
        orderId,
        currentState.lastReadMessageId,
        manager,
        true,
      );
      if (currentMessage && !isMessageAfterCursor(message, currentMessage)) {
        return ApiResponseHandler.updateSuccess("OK", {
          lastReadMessageId: currentState.lastReadMessageId,
        });
      }
    }

    await this.readStateRepository.saveCheckpoint(orderId, userId, message.id, manager);
    const unreadCount = await this.orderLeaderChatRepository.countUnread(orderId, message.id, manager);
    return ApiResponseHandler.updateSuccess("OK", {
      lastReadMessageId: message.id,
      unreadCount,
    });
  }

  async validateBeforeUpdate(
    id: string,
    data: UpdateOrderLeaderChatDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const userId = req?.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const existing = await this.orderLeaderChatRepository.findById(id, manager);
    if (!existing) throw new NotFoundError("Tin nhắn không tồn tại");

    const context = await this.getContext(existing.orderId, userId, manager);
    if (existing.userId !== userId && context.user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenError("Bạn chỉ có thể sửa tin nhắn của mình");
    }

    await this.validateReplyMessage(existing.orderId, data.replyMessageId, manager);
    await this.validateTags(data.tags, context, manager);
  }

  async actionAfterUpdate(data: OrderLeaderChat, req?: Request, manager?: IEntityManager): Promise<void> {
    const context = await this.getContext(data.orderId, req?.user?.userId as string, manager);
    const recipientIds = context.participantUserIds.filter((userId) => userId !== req?.user?.userId);
    SocketUtils.sendSocketToMultipleUsers("order-leader-chat:message-updated", recipientIds, {
      roomId: getOrderLeaderChatRoomId(data.orderId),
      orderId: data.orderId,
      message: data,
    } as any);
  }

  async validateBeforeDelete(id: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const userId = req?.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const existing = await this.orderLeaderChatRepository.findById(id, manager);
    if (!existing) throw new NotFoundError("Tin nhắn không tồn tại");

    const context = await this.getContext(existing.orderId, userId, manager);
    if (existing.userId !== userId && context.user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenError("Bạn chỉ có thể xóa tin nhắn của mình");
    }
  }

  async actionAfterDelete(data: OrderLeaderChat, req?: Request, manager?: IEntityManager): Promise<void> {
    const context = await this.getContext(data.orderId, req?.user?.userId as string, manager);
    const recipientIds = context.participantUserIds.filter((userId) => userId !== req?.user?.userId);
    SocketUtils.sendSocketToMultipleUsers("order-leader-chat:message-deleted", recipientIds, {
      roomId: getOrderLeaderChatRoomId(data.orderId),
      orderId: data.orderId,
      messageId: data.id,
    } as any);
  }

  async deleteFromOrder(orderId: string, manager?: IEntityManager): Promise<void> {
    const messages = await this.orderLeaderChatRepository.findByOptions(
      { where: { orderId }, select: { id: true } },
      manager,
    );
    for (const message of messages) {
      await this.orderLeaderChatRepository.softDelete(message.id, manager);
    }
    await this.readStateRepository.deleteFromOrder(orderId, manager);
  }
}
