import logger from "@/shared/utils/logger";
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer;
export let userSockets: { [userId: string]: string[] } = {}; // Lưu trữ socket.id theo userId

export default {
  init: (server: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(server, {
      pingTimeout: 60000,
      cors: {
        origin: "*", // Cho phép tất cả các nguồn
        methods: ["GET", "POST", "PUT", "DELETE"], // Cho phép phương thức GET và POST
        allowedHeaders: [], // Cho phép tiêu đề tùy chỉnh
        credentials: true, // Cho phép chứng thực
      },
    });

    logger.info("📲 Socket.io initialized");

    io.on("connection", (socket: Socket) => {
      io.emit("message", "Welcome to the chat room!");

      logger.info(`Client connected: ${socket.id}`);

      // Lắng nghe và xử lý sự kiện từ client
      socket.on("message", (message: string) => {
        io.emit("message", message);
      });

      socket.on("register", (userId: string) => {
        if (!userSockets[userId]) {
          userSockets[userId] = [];
        }

        if (!userSockets[userId].includes(socket.id)) {
          userSockets[userId].push(socket.id);
        }
        console.log(`User ${userId} is register with socket ID: ${socket.id}`);

        // console.table(userSockets);
      });

      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        // console.log(`Socket ${socket.id} joined room: ${roomId}`);
      });

      socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId);
        // console.log(`Socket ${socket.id} left room: ${roomId}`);
      });

      socket.on("disconnect", () => {
        // Xóa socket.id khi người dùng ngắt kết nối
        for (const userId in userSockets) {
          if (userSockets[userId].includes(socket.id)) {
            userSockets[userId] = userSockets[userId].filter((id) => id !== socket.id);
            // console.table(userSockets[userId]);
            break;
          }
        }
        console.log("Client disconnected");
      });
    });
    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },

  //? Get all data socket
  getAllSockets: (): { [userId: string]: string[] } => {
    return userSockets;
  },

  //? Get all sockets of a user
  getUserSocket: (userId: number | string): string[] => {
    return userSockets[userId] || [];
  },

  //? Get all sockets of all users
  getAllUserSockets: () => {
    return Object.values(userSockets).flat();
  },

  close: (callback?: () => void): void => {
    if (!io) {
      console.log("Socket.io not initialized, nothing to close");
      if (callback) callback();
      return;
    }

    console.log("Closing Socket.io connections...");

    // Ngắt kết nối tất cả clients
    io.disconnectSockets(true);

    // Đóng server socket
    io.close((err) => {
      if (err) {
        console.error("Error closing Socket.io:", err);
      } else {
        console.log("Socket.io server closed successfully");
      }

      // Xóa tất cả dữ liệu userSockets
      userSockets = {};

      // Gọi callback nếu được cung cấp
      if (callback) callback();
    });
  },
};
