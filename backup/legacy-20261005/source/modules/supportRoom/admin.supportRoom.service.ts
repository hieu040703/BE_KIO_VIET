import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { AdminSupportRoomRepository } from "./admin.supportRoom.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { SUPPORT_ROOM_TYPES } from "./supportRoom.types";
import { COMMON_TYPES } from "../common/common.types";
import { SupportRoom } from "@/database/models/SupportRoom";
import { SupportRoomRelations, SupportRoomSelectFull } from "./supportRoom.select";
import DatabaseConfig from "@/database/database";
import { SupportRoomChatMessage } from "@/database/models/SupportRoomChatMessage";
import { IEntityManager } from "@/shared/types/interfaces";
import { IsNull, Not } from "typeorm";

@injectable()
export class AdminSupportRoomService extends BaseService<SupportRoom> {
  protected relations = SupportRoomRelations;
  protected selectedFields = SupportRoomSelectFull;

  constructor(
    @inject(SUPPORT_ROOM_TYPES.AdminSupportRoomRepository) private supportRoomRepository: AdminSupportRoomRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(supportRoomRepository);
  }

  private getChatRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(SupportRoomChatMessage);
  }

  async getUnreadCount() {
    const roomRepo = DatabaseConfig.getRepository(SupportRoom);
    const count = await roomRepo.count({ where: { hasUnreadMessages: true, deletedAt: IsNull() } });
    return { statusCode: 200, success: true, message: "OK", data: { count } };
  }

  async markAsRead(id: string) {
    const roomRepo = DatabaseConfig.getRepository(SupportRoom);
    const room = await roomRepo.findOne({ where: { id } });
    if (!room) throw new Error("Không tìm thấy phòng hỗ trợ");
    await roomRepo.update({ id }, { hasUnreadMessages: false });
    return { statusCode: 200, success: true, message: "Đã đánh dấu đã đọc" };
  }

  async getRoomsWithLastMessage(query: { page?: number; size?: number; keyword?: string } = {}) {
    const { page = 1, size = 20, keyword } = query;
    const roomRepo = DatabaseConfig.getRepository(SupportRoom);

    const qb = roomRepo
      .createQueryBuilder("room")
      .leftJoinAndSelect("room.customer", "customer")
      .where("room.deletedAt IS NULL")
      .orderBy("room.updatedAt", "DESC")
      .skip((page - 1) * size)
      .take(size);

    if (keyword) {
      qb.andWhere("(room.name ILIKE :kw OR customer.name ILIKE :kw OR customer.phone ILIKE :kw)", {
        kw: `%${keyword}%`,
      });
    }

    const [rooms, total] = await qb.getManyAndCount();

    // Attach last message for each room
    const roomIds = rooms.map((r) => r.id);
    let lastMessages: SupportRoomChatMessage[] = [];
    if (roomIds.length > 0) {
      // Get the latest message per room using a subquery approach
      lastMessages = await this.getChatRepository()
        .createQueryBuilder("msg")
        .where("msg.supportRoomId IN (:...roomIds)", { roomIds })
        .andWhere(
          `msg."timeAt" = (SELECT MAX(srcm."timeAt") FROM support_room_chat_messages srcm WHERE srcm."supportRoomId" = msg."supportRoomId" AND srcm."deletedAt" IS NULL)`,
        )
        .andWhere("msg.deletedAt IS NULL")
        .leftJoinAndSelect("msg.sender", "sender")
        .getMany();
    }

    const lastMessageMap = new Map<string, SupportRoomChatMessage>();
    lastMessages.forEach((msg) => lastMessageMap.set(msg.supportRoomId, msg));

    const data = rooms.map((room) => ({
      ...room,
      lastMessage: lastMessageMap.get(room.id) || null,
    }));

    return {
      statusCode: 200,
      success: true,
      message: "OK",
      data,
      meta: { page, size, total, totalPages: Math.ceil(total / size) },
    };
  }
}
