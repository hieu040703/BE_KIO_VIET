import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { OrderCommentRepository } from "./orderComment.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { OrderComment } from "@/database/models/OrderComment";
import { OrderEmployee } from "@/database/models/OrderEmployee";
import { OrderLeader } from "@/database/models/OrderLeader";
import { OrderCommentRelations, OrderCommentSelectFull } from "./orderComment.select";
import { ApiResponse, IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { CreateOrderCommentDto } from "./orderComment.validator";
import { ForbiddenError, NotFoundError } from "@/shared/types/errors";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { UserRepository } from "@/modules/user/user.repository";
import { USER_TYPES } from "@/modules/user/user.types";
import { ORDER_COMMENT_TYPES } from "./orderComment.types";
import { OrderEmployeeRepository } from "../orderEmployee/orderEmployee.repository";
import { ORDER_EMPLOYEE_TYPES } from "../orderEmployee/orderEmployee.types";
import { OrderLeaderRepository } from "../orderLeader/orderLeader.repository";
import { ORDER_LEADER_TYPES } from "../orderLeader/orderLeader.types";
import { OrderCommentReadStateRepository } from "./orderCommentReadState.repository";
import { SocketUtils } from "@/shared/utils/socket.utils";
import { OrderRepository } from "../order.repository";
import { ORDER_TYPES } from "../order.types";
import { User } from "@/database/models/User";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { NotificationRepository } from "@/modules/notification/notification.repository";
import { CreateNotificationDto } from "@/modules/notification/notification.validator";
import { NotificationTypeEnum, UserRoleEnum } from "@/shared/constants/constance";
import { File } from "@/database/models/File";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import {
  buildOrderMentionNotification,
  formatOrderNotificationTitle,
} from "@/shared/utils/notification.utils";
import { In } from "typeorm";

export interface OrderChatParticipant {
  userId: string;
  employeeId: string;
  name: string;
  zaloName: string | null;
}

const EMPLOYEE_ORDER_COMMENT_VISIBILITY_CUTOFF = new Date(
  "2026-09-04T00:00:00+07:00",
);

@injectable()
export class OrderCommentService extends BaseService<OrderComment> {
  protected relations = OrderCommentRelations;
  protected selectedFields = OrderCommentSelectFull;
  constructor(
    @inject(ORDER_COMMENT_TYPES.OrderCommentRepository)
    private orderCommentRepository: OrderCommentRepository,
    @inject(COMMON_TYPES.TransactionManager)
    private transactionManager: TransactionManager,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeRepository)
    private orderEmployeeRepository: OrderEmployeeRepository,
    @inject(ORDER_LEADER_TYPES.OrderLeaderRepository)
    private orderLeaderRepository: OrderLeaderRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentReadStateRepository)
    private orderCommentReadStateRepository: OrderCommentReadStateRepository,
    @inject(ORDER_TYPES.OrderRepository)
    private orderRepository: OrderRepository,
    @inject(NOTIFICATION_TYPES.NotificationRepository)
    private notificationRepository: NotificationRepository,
  ) {
    super(orderCommentRepository);
  }

  async validateBeforeQuery(
    options: IFindOptions<OrderComment>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    if (req?.user?.role !== UserRoleEnum.EMPLOYEE) {
      return;
    }

    const orderId = req.params?.orderId as string | undefined;
    if (!orderId) {
      return;
    }

    const order = await this.orderRepository.findById(orderId, manager);
    if (
      order?.timeAt &&
      new Date(order.timeAt).getTime() < EMPLOYEE_ORDER_COMMENT_VISIBILITY_CUTOFF.getTime()
    ) {
      const emptyFilter = { id: In([]) };

      if (Array.isArray(options.where)) {
        options.where = options.where.map((condition) => ({
          ...condition,
          ...emptyFilter,
        })) as IFindOptions<OrderComment>["where"];
      } else {
        options.where = {
          ...((options.where || {}) as Record<string, unknown>),
          ...emptyFilter,
        } as IFindOptions<OrderComment>["where"];
      }
    }
  }

  async getChatParticipants(orderId: string, manager?: IEntityManager): Promise<ApiResponse<OrderChatParticipant[]>> {
    const [orderEmployees, orderLeaders, order] = await Promise.all([
      this.orderEmployeeRepository.findByOptions(
        {
          where: { orderId },
          select: {
            employeeId: true,
            employee: {
              id: true,
              name: true,
              zaloName: true,
              user: { id: true },
            },
          },
          relations: {
            employee: { user: true },
          },
        },
        manager,
      ),
      this.orderLeaderRepository.findByOptions(
        {
          where: { orderId },
          select: {
            employeeId: true,
            employee: {
              id: true,
              name: true,
              zaloName: true,
              user: { id: true },
            },
          },
          relations: {
            employee: { user: true },
          },
        },
        manager,
      ),
      this.orderRepository.findByOption(
        {
          where: { id: orderId },
          select: {
            createdByEmployeeId: true,
            createdByEmployee: {
              id: true,
              name: true,
              zaloName: true,
              user: { id: true },
            },
          },
          relations: {
            createdByEmployee: { user: true },
          },
        },
        manager,
      ),
    ]);

    const participants = new Map<string, OrderChatParticipant>();
    const assignments: Array<OrderEmployee | OrderLeader> = [...orderEmployees, ...orderLeaders];

    assignments.forEach((assignment) => {
      const employee = assignment.employee;
      const userId = employee?.user?.id;

      if (!userId || participants.has(userId)) {
        return;
      }

      participants.set(userId, {
        userId,
        employeeId: assignment.employeeId,
        name: employee.name,
        zaloName: employee.zaloName,
      });
    });

    const creator = order?.createdByEmployee;
    const creatorUserId = creator?.user?.id;
    if (creator && creatorUserId && !participants.has(creatorUserId)) {
      participants.set(creatorUserId, {
        userId: creatorUserId,
        employeeId: order.createdByEmployeeId as string,
        name: creator.name,
        zaloName: creator.zaloName,
      });
    }

    return ApiResponseHandler.getSuccess("OK", [...participants.values()]);
  }

  async validateBeforeCreate(data: CreateOrderCommentDto, req?: Request, manager?: IEntityManager): Promise<void> {
    const orderId = data.orderId || (req?.params.orderId as string | undefined);

    if (!orderId) {
      throw new ForbiddenError("Tài nguyên không hợp lệ.");
    }

    // Gán orderId từ params vào data trước khi tạo
    data.orderId = orderId;

    const userId = data.userId || req?.user?.userId;
    data.userId = userId || null;
  }

  async actionAfterCreate(data: OrderComment, req?: Request, manager?: IEntityManager): Promise<void> {
    const userId = req?.user?.userId;

    let user: User | null = null;
    if (userId) {
      user = await this.userRepository.findById(userId, manager);
      if (!user) {
        throw new NotFoundError("Người dùng không tồn tại");
      }
    }

    // Lấy danh sách users trong order và admin user song song để tăng performance
    const [usersInOrder, usersInOrderLeader, adminUser] = await Promise.all([
      this.orderEmployeeRepository.getAllUsersByOrderId(data.orderId, manager),
      this.orderLeaderRepository.getAllUsersByOrderId(data.orderId, manager),
      this.userRepository.findAdminUser(),
    ]);

    // Tạo danh sách tất cả users cần notify (users trong order + admin nếu chưa có)
    const allTargetUsers = [...usersInOrder, ...usersInOrderLeader].filter(
      (user, index, users) => users.findIndex((item) => item.id === user.id) === index,
    );
    const userIdSet = new Set(allTargetUsers.map((u) => u.id));

    if (adminUser && !userIdSet.has(adminUser.id)) {
      allTargetUsers.push(adminUser);
    }

    // Loại bỏ user tạo comment khỏi danh sách target users
    const targetUsers = allTargetUsers.filter((user) => user.id !== userId);
    // KHÔNG return sớm khi targetUsers rỗng: broadcast "chat-message" vào room vẫn phải
    // chạy để mọi user online trong room (kể cả không cần notify) cập nhật badge unread.
    // Các khối notification bên dưới đều có guard riêng (length > 0).

    // Resolve tagged users từ tags UUID array (loại bỏ sender)
    const taggedUserIdSet = new Set<string>();
    let taggedUsers: User[] = [];
    if (data.tags && data.tags.length > 0) {
      taggedUsers = await this.userRepository.findByOptions({ where: { id: In(data.tags) } } as any, manager);
      taggedUsers = taggedUsers.filter((u) => u.id !== userId);
      taggedUsers.forEach((u) => taggedUserIdSet.add(u.id));
    }

    // Lấy danh sách socket IDs đang online trong room và convert sang Set để check nhanh hơn
    const onlineSocketIds = await SocketUtils.getRoomMembers(data.orderId);
    const onlineSocketIdSet = new Set(onlineSocketIds);

    // Offline users không được tag: tạo CHAT notification
    const offlineNonTaggedUsers: User[] = [];
    for (const user of targetUsers) {
      if (taggedUserIdSet.has(user.id)) continue;
      const userSocketIds = SocketUtils.getUserSocket(user.id);
      const isUserOnlineInRoom =
        userSocketIds.length > 0 && userSocketIds.some((socketId) => onlineSocketIdSet.has(socketId));
      if (!isUserOnlineInRoom) {
        offlineNonTaggedUsers.push(user);
      }
    }

    // Broadcast message tới room (tự động exclude sender nếu userId có giá trị)
    SocketUtils.broadcastToRoom("chat-message", data.orderId, data, userId);

    const order = await this.orderRepository.findById(data.orderId, manager);
    if (!order) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    const messageContent = user
      ? `${user.name || user.username}: ${data.content ? data.content : "Đã gửi tài liệu / hình ảnh"}`
      : `${data.content}` || "Có tin nhắn mới";

    // Gửi MENTION notification cho tagged users (luôn notify dù đang online)
    if (taggedUsers.length > 0) {
      const mentionNotificationContent = buildOrderMentionNotification(order, user);
      const mentionNotification: CreateNotificationDto = {
        ...mentionNotificationContent,
        type: NotificationTypeEnum.MENTION,
        objectId: data.orderId,
        metadata: data,
        details: taggedUsers.map((user) => ({
          userId: user.id,
          isRead: false,
        })),
      };
      await this.notificationRepository.create(mentionNotification, manager);

      taggedUsers.forEach((user) => {
        FirebaseUtils.SentFirebaseWithUser({
          userId: user.id,
          title: mentionNotificationContent.title,
          content: mentionNotificationContent.content,
          data: { objectId: data.orderId, type: NotificationTypeEnum.MENTION },
        });
        SocketUtils.sendSocketToUser("mention-comment", user.id, {
          title: mentionNotificationContent.title,
          message: mentionNotificationContent.content,
          data: { objectId: data.orderId, type: NotificationTypeEnum.MENTION },
        });
      });
    }

    // Gửi CHAT notification + socket cho offline non-tagged users
    if (offlineNonTaggedUsers.length > 0) {
      const chatTitle = formatOrderNotificationTitle(order.code, "Tin nhắn mới");
      const notification: CreateNotificationDto = {
        title: chatTitle,
        content: messageContent,
        type: NotificationTypeEnum.CHAT,
        objectId: data.orderId,
        metadata: data,
        details: offlineNonTaggedUsers.map((user) => ({
          userId: user.id,
          isRead: false,
        })),
      };
      await this.notificationRepository.create(notification, manager);

      offlineNonTaggedUsers.forEach((user) => {
        FirebaseUtils.SentFirebaseWithUser({
          userId: user.id,
          orderCode: order.code,
          title: chatTitle,
          content: messageContent,
          data: { objectId: data.orderId, type: "CHAT" },
        });
        SocketUtils.sendSocketToUser("new-comment", user.id, {
          title: chatTitle,
          message: messageContent,
          data: { objectId: data.orderId, type: "CHAT" },
        });
      });
    }
  }

  async markCommentsAsViewed(
    orderId: string,
    userId: string,
    commentId?: string,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ lastReadCommentId: string; unreadCount: number }>> {
    const orderExist = await this.orderRepository.findById(orderId, manager);
    if (!orderExist) {
      throw new NotFoundError("Hợp đồng không tồn tại");
    }

    // Nếu không truyền commentId → lấy comment mới nhất của order (mark all as viewed)
    let lastReadCommentId: string | null = commentId ?? null;
    if (!lastReadCommentId) {
      const latest = await this.orderCommentRepository.findLatestComment(orderId, manager);
      lastReadCommentId = latest?.id || null;
    }

    if (lastReadCommentId) {
      await this.orderCommentReadStateRepository.saveCheckpoint(orderId, userId, lastReadCommentId, manager);
    }

    const unreadCount = await this.orderCommentRepository.countUnreadComments(orderId, lastReadCommentId, manager);
    return ApiResponseHandler.updateSuccess("OK", {
      lastReadCommentId: lastReadCommentId || null,
      unreadCount,
    });
  }

  async getAllFileAttachments(orderId: string, manager?: IEntityManager): Promise<ApiResponse<File[]>> {
    const result = await this.orderCommentRepository.getAllFileAttachments(orderId, manager);
    return ApiResponseHandler.getSuccess("OK", result);
  }

  async countUnreadComments(orderId: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<number>> {
    const userId = req?.user?.userId;
    if (!userId) {
      return ApiResponseHandler.getSuccess("OK", 0);
    }
    const readState = await this.orderCommentReadStateRepository.findActive(orderId, userId, manager);
    const count = await this.orderCommentRepository.countUnreadComments(
      orderId,
      readState?.lastReadCommentId || null,
      manager,
    );
    return ApiResponseHandler.getSuccess("OK", count);
  }

  async deleteFromOrder(orderId: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const comments = await this.orderCommentRepository.findByOptions(
      {
        where: { orderId },
        select: { id: true },
      },
      manager,
    );

    const commentIds = comments.map((comment) => comment.id);
    if (commentIds.length > 0) {
      for (const commentId of commentIds) {
        await this.delete(commentId, req, manager);
      }
    }
  }
}
