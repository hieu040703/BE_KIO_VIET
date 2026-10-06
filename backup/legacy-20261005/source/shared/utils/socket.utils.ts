import Socket from "@/shared/config/socket";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { NotificationTypeEnum } from "../constants/constance";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface SocketData {
  id?: string;
  title: string;
  content: string;
  type: NotificationTypeEnum;
  timeAt: Date;
  objectId?: string | null;
  metadata?: unknown;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  isRead?: boolean;
}

export interface RoomData {
  roomId: string;
  roomName?: string;
  members?: string[];
  metadata?: Record<string, any>;
}

export interface RoomMember {
  userId: string;
  socketId: string;
  joinedAt: Date;
}

export class SocketUtils {
  /**
   * Lấy tất cả socket IDs của user
   * @param userId
   * @returns
   */
  static getUserSocket(userId: string | string): string[] | [] {
    return Socket.getUserSocket(userId);
  }

  /**
   * Lấy tất cả socket IDs của tất cả user
   * @returns
   */
  static getAllUserSockets() {
    return Socket.getAllUserSockets();
  }

  //? sent socket to user
  static sendSocketToUser(socketName: string, userId: string | string, data: any) {
    const userSockets = Socket.getUserSocket(userId);

    if (userSockets) {
      //? gửi thông báo qua socket
      userSockets.forEach((socketId) => {
        Socket.getIO().to(socketId).emit(socketName, data);
        // console.log("Send socket to user:", socketId);
      });
    }
  }

  //? sent socket to multiple users
  static sendSocketToMultipleUsers(socketName: string, userIds: (number | string)[], data: SocketData) {
    const allUserSockets = userIds
      .map((userId) => Socket.getUserSocket(userId))
      .filter((sockets): sockets is string[] => Array.isArray(sockets))
      .flat();

    if (allUserSockets.length > 0) {
      Socket.getIO().to(allUserSockets).emit(socketName, data);
      // console.log(
      //   `Sent socket "${socketName}" to users ${allUserSockets} at ${dayjs().tz("Asia/Ho_Chi_Minh").format()}`,
      // );
    }
  }

  //? sent socket to all user
  static sendSocketToAllUser(socketName: string, data: SocketData) {
    Socket.getIO().emit(socketName, data);
  }

  // ============== ROOM MANAGEMENT ==============

  /**
   * Tạo room mới hoặc join vào room có sẵn
   * @param roomId - ID của room
   * @param userId - ID của user
   * @returns true nếu thành công
   */
  static joinRoom(roomId: string, userId: string): boolean {
    const userSockets = Socket.getUserSocket(userId);
    if (!userSockets || userSockets.length === 0) {
      // console.warn(`User ${userId} has no active socket connections`);
      return false;
    }

    userSockets.forEach((socketId) => {
      const socket = Socket.getIO().sockets.sockets.get(socketId);
      if (socket) {
        socket.join(roomId);
        // console.log(`User ${userId} (socket: ${socketId}) joined room: ${roomId}`);
      }
    });

    return true;
  }

  /**
   * User rời khỏi room
   * @param roomId - ID của room
   * @param userId - ID của user
   */
  static leaveRoom(roomId: string, userId: string): boolean {
    const userSockets = Socket.getUserSocket(userId);
    if (!userSockets || userSockets.length === 0) {
      return false;
    }

    userSockets.forEach((socketId) => {
      const socket = Socket.getIO().sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(roomId);
        // console.log(`User ${userId} (socket: ${socketId}) left room: ${roomId}`);
      }
    });

    return true;
  }

  /**
   * Thêm nhiều users vào room
   * @param roomId - ID của room
   * @param userIds - Danh sách user IDs
   */
  static addUsersToRoom(roomId: string, userIds: string[]): void {
    userIds.forEach((userId) => {
      this.joinRoom(roomId, userId);
    });
    // console.log(`Added ${userIds.length} users to room: ${roomId}`);
  }

  /**
   * Remove nhiều users khỏi room
   * @param roomId - ID của room
   * @param userIds - Danh sách user IDs
   */
  static removeUsersFromRoom(roomId: string, userIds: string[]): void {
    userIds.forEach((userId) => {
      this.leaveRoom(roomId, userId);
    });
    // console.log(`Removed ${userIds.length} users from room: ${roomId}`);
  }

  /**
   * Gửi socket message đến một room cụ thể
   * @param socketName - Tên event socket
   * @param roomId - ID của room
   * @param data - Dữ liệu gửi đi
   */
  static sendSocketToRoom(socketName: string, roomId: string, data: any): void {
    Socket.getIO().to(roomId).emit(socketName, data);
    // console.log(`Sent socket "${socketName}" to room ${roomId} at ${dayjs().tz("Asia/Ho_Chi_Minh").format()}`);
  }

  /**
   * Gửi socket message đến nhiều rooms
   * @param socketName - Tên event socket
   * @param roomIds - Danh sách room IDs
   * @param data - Dữ liệu gửi đi
   */
  static sendSocketToMultipleRooms(socketName: string, roomIds: string[], data: any): void {
    roomIds.forEach((roomId) => {
      Socket.getIO().to(roomId).emit(socketName, data);
    });
    // console.log(`Sent socket "${socketName}" to ${roomIds.length} rooms at ${dayjs().tz("Asia/Ho_Chi_Minh").format()}`);
  }

  /**
   * Broadcast message đến room
   * - Nếu có senderId: gửi đến tất cả members trong room (trừ sender)
   * - Nếu không có senderId: gửi đến tất cả members trong room (hệ thống gửi)
   * @param socketName - Tên event socket
   * @param roomId - ID của room
   * @param data - Dữ liệu gửi đi
   * @param senderId - ID của người gửi (optional, sẽ không nhận message nếu có)
   */
  static broadcastToRoom(socketName: string, roomId: string, data: any, senderId?: string): void {
    if (senderId) {
      // Có senderId: broadcast loại trừ người gửi
      const senderSockets = Socket.getUserSocket(senderId);
      if (senderSockets && senderSockets.length > 0) {
        senderSockets.forEach((socketId) => {
          const socket = Socket.getIO().sockets.sockets.get(socketId);
          if (socket) {
            socket.to(roomId).emit(socketName, data);
          }
        });
        // console.log(`Broadcasted "${socketName}" to room ${roomId} (excluding sender ${senderId})`);
      }
    } else {
      // Không có senderId: gửi đến tất cả members (hệ thống gửi)
      Socket.getIO().to(roomId).emit(socketName, data);
      // console.log(`System broadcasted "${socketName}" to room ${roomId} at ${dayjs().tz("Asia/Ho_Chi_Minh").format()}`);
    }
  }

  /**
   * Lấy danh sách tất cả socket IDs trong room
   * @param roomId - ID của room
   * @returns Mảng socket IDs
   */
  static async getRoomMembers(roomId: string): Promise<string[]> {
    try {
      const sockets = await Socket.getIO().in(roomId).fetchSockets();
      return sockets.map((socket) => socket.id);
    } catch (error) {
      console.error(`Error fetching room members for ${roomId}:`, error);
      return [];
    }
  }

  /**
   * Lấy tất cả các user IDs trong room
   * @param roomId - ID của room
   * @returns Mảng user IDs
   */
  static async getRoomUserIds(roomId: string): Promise<string[]> {
    const sockets = await Socket.getIO().in(roomId).fetchSockets();
    console.log(sockets.length);
    sockets.forEach((socket) => {
      console.log("Socket in room:", socket.id, socket.handshake.query);
    });
    const userIds = sockets
      .map((socket) => socket.handshake.query.userId as string)
      .filter((userId, index, self) => userId && self.indexOf(userId) === index); // Lọc trùng lặp và loại bỏ undefined
    return userIds;
  }

  /**
   * Đếm số lượng members trong room
   * @param roomId - ID của room
   * @returns Số lượng members
   */
  static async getRoomMemberCount(roomId: string): Promise<number> {
    const members = await this.getRoomMembers(roomId);
    return members.length;
  }

  /**
   * Kiểm tra user có trong room không
   * @param roomId - ID của room
   * @param userId - ID của user
   * @returns true nếu user đang trong room
   */
  static async isUserInRoom(roomId: string, userId: string): Promise<boolean> {
    const userSockets = Socket.getUserSocket(userId);
    if (!userSockets || userSockets.length === 0) {
      return false;
    }

    const roomMembers = await this.getRoomMembers(roomId);
    return userSockets.some((socketId) => roomMembers.includes(socketId));
  }

  /**
   * Lấy danh sách tất cả rooms mà user đang join
   * @param userId - ID của user
   * @returns Mảng room IDs
   */
  static getUserRooms(userId: string): string[] {
    const userSockets = Socket.getUserSocket(userId);
    if (!userSockets || userSockets.length === 0) {
      return [];
    }

    const rooms = new Set<string>();
    userSockets.forEach((socketId) => {
      const socket = Socket.getIO().sockets.sockets.get(socketId);
      if (socket) {
        // Socket.io tự động add socket vào room có tên là socket.id
        // Chúng ta chỉ lấy các room khác
        socket.rooms.forEach((room) => {
          if (room !== socketId) {
            rooms.add(room);
          }
        });
      }
    });

    return Array.from(rooms);
  }

  /**
   * Xóa room (kick tất cả members)
   * @param roomId - ID của room
   */
  static async deleteRoom(roomId: string): Promise<void> {
    const sockets = await Socket.getIO().in(roomId).fetchSockets();
    sockets.forEach((socket) => {
      socket.leave(roomId);
    });
    console.log(`Deleted room: ${roomId} (removed ${sockets.length} members)`);
  }

  /**
   * Lấy thông tin chi tiết về room
   * @param roomId - ID của room
   * @returns Thông tin room
   */
  static async getRoomInfo(roomId: string): Promise<RoomData> {
    const members = await this.getRoomMembers(roomId);
    return {
      roomId,
      members,
      metadata: {
        memberCount: members.length,
        createdAt: new Date(),
      },
    };
  }

  /**
   * Lấy danh sách tất cả rooms đang active
   * @returns Mảng room IDs
   */
  static getAllRooms(): string[] {
    const rooms = new Set<string>();
    Socket.getIO().sockets.sockets.forEach((socket) => {
      socket.rooms.forEach((room) => {
        // Loại bỏ các room có tên là socket.id (default room)
        if (room !== socket.id) {
          rooms.add(room);
        }
      });
    });
    return Array.from(rooms);
  }
}
