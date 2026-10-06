import { inject, injectable } from "inversify";
import { SupportRoomChatMessage } from "@/database/models/SupportRoomChatMessage";
import { User } from "@/database/models/User";
import { SupportRoom } from "@/database/models/SupportRoom";
import { NotificationService } from "@/modules/notification/notification.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { NotificationTypeEnum, ServiceOrderChatMessageTypeEnum, UserRoleEnum } from "@/shared/constants/constance";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { IEntityManager } from "@/shared/types/interfaces";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "@/shared/types/errors";
import { SUPPORT_ROOM_CHAT_MESSAGE_TYPES } from "./supportRoomChatMessage.types";
import {
  CreateSupportRoomChatMessageDto,
  CreateSupportRoomChatMessageInternalDto,
  SupportRoomChatMessageQueryDto,
} from "./supportRoomChatMessage.validator";
import { SupportRoomChatMessageRepository } from "./supportRoomChatMessage.repository";
import DatabaseConfig from "@/database/database";

export const getSupportRoomChatRoomId = (supportRoomId: string): string => `support-room:${supportRoomId}`;

@injectable()
export class SupportRoomChatMessageService {
  constructor(
    @inject(SUPPORT_ROOM_CHAT_MESSAGE_TYPES.SupportRoomChatMessageRepository)
    private readonly chatRepository: SupportRoomChatMessageRepository,
    @inject(USER_TYPES.UserRepository)
    private readonly userRepository: UserRepository,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private readonly notificationService: NotificationService,
    @inject(COMMON_TYPES.TransactionManager)
    private readonly transactionManager: TransactionManager,
  ) {}

  private getSupportRoomRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(SupportRoom);
  }

  private getUserRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(User);
  }

  private determineMessageType(
    payload: Pick<CreateSupportRoomChatMessageInternalDto, "content" | "attachments">,
  ): ServiceOrderChatMessageTypeEnum {
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

  private buildSenderDisplayName(sender: User | null): string {
    if (!sender) return "Hệ thống";
    return sender.name || sender.username || sender.phone || "Người dùng";
  }

  private buildNotificationContent(message: SupportRoomChatMessage, sender: User | null): string {
    const senderName = this.buildSenderDisplayName(sender);
    if (message.messageType === ServiceOrderChatMessageTypeEnum.IMAGE) {
      return `${senderName} đã gửi hình ảnh`;
    }
    if (message.messageType === ServiceOrderChatMessageTypeEnum.FILE) {
      return `${senderName} đã gửi tệp đính kèm`;
    }
    return `${senderName}: ${message.content || "Tin nhắn mới"}`;
  }

  private async getSupportRoomOrThrow(supportRoomId: string, manager?: IEntityManager): Promise<SupportRoom> {
    const room = await this.getSupportRoomRepository(manager).findOne({
      where: { id: supportRoomId },
    });
    if (!room) throw new NotFoundError("Không tìm thấy phòng hỗ trợ");
    return room;
  }

  private async notifyParticipants(
    message: SupportRoomChatMessage,
    room: SupportRoom,
    sender: User | null,
    manager?: IEntityManager,
  ): Promise<void> {
    const roomId = getSupportRoomChatRoomId(message.supportRoomId);
    const eventPayload = { roomId, supportRoomId: message.supportRoomId, message };

    SocketUtils.sendSocketToRoom("support-room:new-message", roomId, eventPayload);

    // Find participants: the customer user + all admin/support users
    const [customerUsers, adminUsers] = await Promise.all([
      this.getUserRepository(manager).find({ where: { customerId: room.customerId } }),
      this.getUserRepository(manager).find({
        where: [{ role: UserRoleEnum.ADMIN }, { role: UserRoleEnum.MANAGER }, { role: UserRoleEnum.SUPPORT }],
      }),
    ]);

    const participantsMap = new Map<string, User>();
    [...customerUsers, ...adminUsers].forEach((user) => participantsMap.set(user.id, user));
    const allParticipants = [...participantsMap.values()];
    const targetUsers = allParticipants.filter((u) => u.id !== message.senderUserId);

    if (targetUsers.length === 0) return;

    const onlineSocketIds = await SocketUtils.getRoomMembers(roomId);
    const onlineSocketIdSet = new Set(onlineSocketIds);

    // Tách thành: (1) có socket nhưng chưa vào room, (2) không có socket (thực sự offline)
    const notInRoomUsers: User[] = [];
    const fullyOfflineUsers: User[] = [];

    for (const participant of targetUsers) {
      const userSocketIds = SocketUtils.getUserSocket(participant.id);
      if (userSocketIds.length === 0) {
        fullyOfflineUsers.push(participant);
      } else if (!userSocketIds.some((sid) => onlineSocketIdSet.has(sid))) {
        notInRoomUsers.push(participant);
      }
      // else: đã ở trong room → đã nhận qua sendSocketToRoom ở trên
    }

    // Gửi badge-update cho staff đang online nhưng chưa mở room này
    notInRoomUsers.forEach((participant) => {
      SocketUtils.sendSocketToUser("support-room:badge-update", participant.id, {
        supportRoomId: message.supportRoomId,
      });
    });

    const offlineUsers = [...notInRoomUsers, ...fullyOfflineUsers];
    if (offlineUsers.length === 0) return;

    const title = `Hỗ trợ khách hàng - ${room.name}`;
    const content = this.buildNotificationContent(message, sender);
    const targetUserIds = offlineUsers.map((u) => u.id);

    await this.notificationService.createNotificationForMultipleUsers(
      targetUserIds,
      {
        title,
        content,
        type: NotificationTypeEnum.CHAT,
        objectId: message.supportRoomId,
        metadata: {
          supportRoomId: message.supportRoomId,
          roomId,
          messageId: message.id,
          messageType: message.messageType,
        },
      },
      manager,
    );

    fullyOfflineUsers.forEach((participant) => {
      FirebaseUtils.SentFirebaseWithUser({
        userId: participant.id,
        title,
        content,
        data: {
          type: NotificationTypeEnum.CHAT,
          supportRoomId: message.supportRoomId,
          roomId,
          messageId: message.id,
          messageType: message.messageType,
        },
      });
    });
  }

  async listMessages(supportRoomId: string, query: SupportRoomChatMessageQueryDto, manager?: IEntityManager) {
    await this.getSupportRoomOrThrow(supportRoomId, manager);

    const { page = 1, size = 20, sortOrder = "DESC" } = query;
    const { data, total } = await this.chatRepository.listMessages(supportRoomId, { page, size, sortOrder }, manager);

    return {
      statusCode: 200,
      success: true,
      message: "OK",
      data,
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async sendMessage(
    supportRoomId: string,
    userId: string,
    dto: CreateSupportRoomChatMessageDto,
    manager?: IEntityManager,
  ) {
    const room = await this.getSupportRoomOrThrow(supportRoomId, manager);
    const sender = await this.userRepository.findById(userId, manager);
    if (!sender) throw new UnauthorizedError("Người dùng không tồn tại");

    const messageType = this.determineMessageType({
      content: dto.content ?? null,
      attachments: dto.attachments ?? null,
    });

    const created = await this.chatRepository.create(
      {
        supportRoomId,
        senderUserId: userId,
        content: dto.content || null,
        attachments: (dto.attachments as any) || null,
        messageType,
        metadata: dto.metadata || null,
        timeAt: new Date(),
      },
      manager,
    );

    const fullMessage = await this.chatRepository.findById(created.id, manager);
    if (!fullMessage) throw new NotFoundError("Không thể tải lại tin nhắn");

    // Nếu người gửi là khách hàng (có customerId) → đánh dấu room có tin nhắn chưa đọc
    if (sender.customerId) {
      await this.getSupportRoomRepository(manager).update(
        { id: supportRoomId },
        { hasUnreadMessages: true },
      );
    }

    await this.notifyParticipants(fullMessage, room, sender, manager);

    return { statusCode: 201, success: true, message: "Đã gửi tin nhắn", data: fullMessage };
  }

  async sendSystemMessage(supportRoomId: string, content: string, manager?: IEntityManager) {
    const room = await this.getSupportRoomOrThrow(supportRoomId, manager);

    const created = await this.chatRepository.create(
      {
        supportRoomId,
        senderUserId: null,
        content,
        attachments: null,
        messageType: ServiceOrderChatMessageTypeEnum.SYSTEM,
        metadata: null,
        timeAt: new Date(),
      },
      manager,
    );

    const fullMessage = await this.chatRepository.findById(created.id, manager);
    if (!fullMessage) throw new NotFoundError("Không thể tải lại tin nhắn");

    await this.notifyParticipants(fullMessage, room, null, manager);

    return fullMessage;
  }
}
