import { Response, Request } from "express";
import { PriceUpdate, SSEClient } from "../../shared/types/interfaces";
import { injectable } from "inversify";
import { Utils } from "@/shared/utils/utils";
import { RedisSSEBroadcaster } from "@/shared/utils/redis-sse.utils";
import logger from "@/shared/utils/logger";

@injectable()
export class SSEService {
  private clients = new Map<string, SSEClient>();
  private userClients = new Map<string, Set<string>>(); // userId -> Set of clientIds
  private currentPrices = new Map<string, PriceUpdate>();
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private redisUnsubscribe: (() => Promise<void>) | null = null;

  constructor() {
    // Không subscribe Redis ở đây vì Redis chưa connect
    // Sẽ gọi initializeRedisSubscription() từ index.ts sau khi Redis connect
  }

  /**
   * Subscribe tới Redis để nhận SSE events từ Worker hoặc các processes khác
   * CHÚ Ý: Phải gọi sau khi Redis đã connect xong
   */
  async initializeRedisSubscription(): Promise<void> {
    try {
      this.redisUnsubscribe = await RedisSSEBroadcaster.subscribeToAllUserEvents(
        (userId: string, event: string, data: any) => {
          // Khi nhận được event từ Redis, gửi tới SSE clients
          this.sendToUser(userId, event, data);
          logger.info(`📨 [SSE] Received event "${event}" from Redis for user ${userId}`);
        },
      );
      logger.info("✅ [SSE Service] Subscribed to Redis SSE events");
    } catch (error) {
      logger.error("❌ [SSE Service] Failed to subscribe to Redis:", error);
    }
  }

  getClientIdsByUserId(userId: string): string[] {
    const clientIds = this.userClients.get(String(userId));
    return clientIds ? Array.from(clientIds) : [];
  }

  getClientIdByUserId(userId: string): string | null {
    const clientIds = this.getClientIdsByUserId(userId);
    return clientIds.length > 0 ? clientIds[0] : null;
  }

  // Thêm client mới
  addClient(clientId: string, response: Response, userId?: string): void {
    const client: SSEClient = {
      id: clientId,
      response,
      userId,
      connectedAt: Date.now(),
    };

    this.clients.set(clientId, client);

    // Thêm vào userClients map nếu có userId
    if (userId) {
      if (!this.userClients.has(userId)) {
        this.userClients.set(userId, new Set());
      }
      this.userClients.get(userId)!.add(clientId);
    }

    logger.info(
      `✅ Client ${clientId} connected. Total clients: ${this.clients.size}${userId ? ` (User: ${userId})` : ""}`,
    );
  }

  // Xóa client
  removeClient(clientId: string): Promise<any> {
    const client = this.clients.get(clientId);

    // Xóa khỏi userClients map
    if (client?.userId) {
      const userClientSet = this.userClients.get(client.userId);
      if (userClientSet) {
        userClientSet.delete(clientId);
        // Nếu user không còn client nào, xóa entry trong map
        if (userClientSet.size === 0) {
          this.userClients.delete(client.userId);
        }
      }
    }

    this.clients.delete(clientId);
    console.log(`❌ Client ${clientId} disconnected. Total clients: ${this.clients.size}`);
    return Promise.resolve();
  }

  // Broadcast tin nhắn tới tất cả clients
  broadcast(event: string, data: any): void {
    const message = JSON.stringify(data);

    this.clients.forEach((client, clientId) => {
      try {
        client.response.write(`event: ${event}\ndata: ${message}\n\n`);
      } catch (error) {
        console.error(`❌ Error sending to client ${clientId}:`, error);
        this.removeClient(clientId);
      }
    });

    console.log(`📡 Broadcasted ${event} to ${this.clients.size} clients`);
  }

  // Gửi tin nhắn tới một client cụ thể
  sendToClient(clientId: string, event: string, data: any): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    try {
      const message = JSON.stringify(data);
      client.response.write(`event: ${event}\ndata: ${message}\n\n`);
      return true;
    } catch (error) {
      console.error(`❌ Error sending to client ${clientId}:`, error);
      this.removeClient(clientId);
      return false;
    }
  }

  // Gửi tin nhắn tới người dùng cụ thể (gửi tới tất cả clients của user)
  sendToUser(userId: string, event: string, data: any): boolean {
    const clientIds = this.userClients.get(String(userId));

    if (!clientIds || clientIds.size === 0) {
      console.log(`⚠️ No clients found for user ${userId}`);
      return false;
    }

    let successCount = 0;
    const message = JSON.stringify(data);
    const clientIdsToRemove: string[] = [];

    clientIds.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client) {
        try {
          client.response.write(`event: ${event}\ndata: ${message}\n\n`);
          successCount++;
          // console.log(`📨 Sent to client: ${clientId} for user ${userId}`);
        } catch (error) {
          console.error(`❌ Error sending to client ${clientId} for user ${userId}:`, error);
          clientIdsToRemove.push(clientId);
        }
      }
    });

    // Xóa các clients bị lỗi
    clientIdsToRemove.forEach((clientId) => this.removeClient(clientId));

    // console.log(`📡 Sent to ${successCount}/${clientIds.size} clients for user ${userId}`);
    return successCount > 0;
  }

  // Gửi giá hiện tại cho client mới
  private sendCurrentPricesToClient(clientId: string): void {
    const prices = Array.from(this.currentPrices.values());
    if (prices.length > 0) {
      this.sendToClient(clientId, "initial-prices", prices);
    }
  }

  // Tạo dữ liệu giá ngẫu nhiên
  private generateRandomPrice(): PriceUpdate {
    const products = ["Bitcoin", "Ethereum", "Cardano", "Solana", "Polkadot"];
    const product = products[Math.floor(Math.random() * products.length)];

    const basePrice = this.currentPrices.get(product)?.price || Math.random() * 50000;
    const change = (Math.random() - 0.5) * 0.1; // ±10% change
    const newPrice = Math.max(basePrice * (1 + change), 1);

    return {
      id: `${product.toLowerCase()}-${Date.now()}`,
      product,
      price: Math.round(newPrice * 100) / 100,
      currency: "USD",
      timestamp: Date.now(),
    };
  }

  // Bắt đầu cập nhật giá tự động
  private startPriceUpdates(): void {
    // Khởi tạo giá ban đầu
    const initialProducts = ["Bitcoin", "Ethereum", "Cardano", "Solana", "Polkadot"];
    initialProducts.forEach((product) => {
      const initialPrice: PriceUpdate = {
        id: `${product.toLowerCase()}-initial`,
        product,
        price: Math.round(Math.random() * 50000 * 100) / 100,
        currency: "USD",
        timestamp: Date.now(),
      };
      this.currentPrices.set(product, initialPrice);
    });

    // Cập nhật giá mỗi 3 giây
    this.priceUpdateInterval = setInterval(() => {
      const priceUpdate = this.generateRandomPrice();
      this.currentPrices.set(priceUpdate.product, priceUpdate);
      this.broadcast("price-updates", priceUpdate);
    }, 3000);

    console.log("💰 Price update service started");
  }

  // Dừng cập nhật giá
  stopPriceUpdates(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
      console.log("💰 Price update service stopped");
    }
  }

  // Lấy thông tin tất cả clients
  getClientsInfo() {
    return Array.from(this.clients.values()).map((client) => ({
      id: client.id,
      userId: client.userId,
      connectedAt: new Date(client.connectedAt).toISOString(),
      duration: Date.now() - client.connectedAt,
    }));
  }

  // Lấy giá hiện tại
  getCurrentPrices(): PriceUpdate[] {
    return Array.from(this.currentPrices.values());
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.stopPriceUpdates();

    // Unsubscribe from Redis
    if (this.redisUnsubscribe) {
      await this.redisUnsubscribe();
      this.redisUnsubscribe = null;
    }

    this.clients.clear();
    this.userClients.clear();
  }
}
