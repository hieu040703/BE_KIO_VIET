import RedisConfig from "@/shared/config/redis";
import logger from "@/shared/utils/logger";

/**
 * Redis SSE Broadcaster
 * Cho phép gửi SSE events từ bất kỳ process nào (Worker, API)
 * Sử dụng Redis Pub/Sub để broadcast events tới tất cả API instances
 */
export class RedisSSEBroadcaster {
  private static readonly CHANNEL_PREFIX = "sse:";
  private static readonly USER_CHANNEL_PREFIX = "sse:user:";
  private static readonly BROADCAST_CHANNEL = "sse:broadcast";

  /**
   * Gửi SSE event tới một user cụ thể
   * Worker/API publish message, Main API subscribers sẽ emit tới SSE clients
   */
  static async sendToUser(userId: string, event: string, data: any): Promise<void> {
    try {
      const channel = `${this.USER_CHANNEL_PREFIX}${userId}`;
      const message = JSON.stringify({
        event,
        userId,
        data,
        timestamp: Date.now(),
      });

      const redis = RedisConfig.getClient();
      if (!redis) {
        logger.warn("⚠️ Redis not available for SSE broadcast");
        return;
      }

      await redis.publish(channel, message);
      logger.info(`📡 [Redis SSE] Published event "${event}" for user ${userId}`);
    } catch (error: any) {
      logger.error(`❌ [Redis SSE] Failed to send to user ${userId}:`, error);
    }
  }

  /**
   * Broadcast SSE event tới tất cả clients
   */
  static async broadcast(event: string, data: any): Promise<void> {
    try {
      const message = JSON.stringify({
        event,
        data,
        timestamp: Date.now(),
      });

      const redis = RedisConfig.getClient();
      if (!redis) {
        logger.warn("⚠️ Redis not available for SSE broadcast");
        return;
      }

      await redis.publish(this.BROADCAST_CHANNEL, message);
      logger.info(`📡 [Redis SSE] Broadcasted event "${event}"`);
    } catch (error: any) {
      logger.error(`❌ [Redis SSE] Failed to broadcast:`, error);
    }
  }

  /**
   * Subscribe to user-specific SSE events
   * Main API process gọi để nhận events và emit tới SSE clients
   */
  static async subscribeToUserEvents(userId: string, callback: (event: string, data: any) => void): Promise<void> {
    try {
      const channel = `${this.USER_CHANNEL_PREFIX}${userId}`;
      const redisClient = RedisConfig.getClient();

      if (!redisClient) {
        logger.warn("⚠️ Redis client not available for subscription");
        return;
      }

      const subscriber = redisClient.duplicate();
      await subscriber.connect();
      await subscriber.subscribe(channel, (message) => {
        try {
          if (typeof message === "string") {
            const parsed = JSON.parse(message);
            callback(parsed.event, parsed.data);
          }
        } catch (error) {
          logger.error(`❌ [Redis SSE] Failed to parse message:`, error);
        }
      });

      logger.info(`👂 [Redis SSE] Subscribed to user ${userId} events`);
    } catch (error: any) {
      logger.error(`❌ [Redis SSE] Failed to subscribe to user ${userId}:`, error);
    }
  }

  /**
   * Subscribe to broadcast SSE events
   */
  static async subscribeToBroadcast(callback: (event: string, data: any) => void): Promise<void> {
    try {
      const redisClient = RedisConfig.getClient();

      if (!redisClient) {
        logger.warn("⚠️ Redis client not available for broadcast subscription");
        return;
      }

      const subscriber = redisClient.duplicate();
      await subscriber.connect();
      await subscriber.subscribe(this.BROADCAST_CHANNEL, (message) => {
        try {
          if (typeof message === "string") {
            const parsed = JSON.parse(message);
            callback(parsed.event, parsed.data);
          }
        } catch (error) {
          logger.error(`❌ [Redis SSE] Failed to parse broadcast message:`, error);
        }
      });

      logger.info(`👂 [Redis SSE] Subscribed to broadcast events`);
    } catch (error: any) {
      logger.error(`❌ [Redis SSE] Failed to subscribe to broadcast:`, error);
    }
  }

  /**
   * Subscribe tới tất cả user events
   * Main API process sẽ dùng để nhận tất cả SSE events và emit tới clients
   */
  static async subscribeToAllUserEvents(
    callback: (userId: string, event: string, data: any) => void,
  ): Promise<() => Promise<void>> {
    try {
      // Đảm bảo Redis đã connect trước khi duplicate
      const redisClient = RedisConfig.getClient();
      if (!redisClient) {
        logger.warn("⚠️ Redis client not available, waiting for connection...");
        return async () => {};
      }

      const subscriber = redisClient.duplicate();
      await subscriber.connect();

      // Lắng nghe message event cho pattern matching
      subscriber.on("pmessage", (pattern: string, channel: string, message: string) => {
        try {
          const parsed = JSON.parse(message);
          // Extract userId from channel name: sse:user:123 -> 123
          const userIdMatch = channel.match(/sse:user:(\d+)/);
          if (userIdMatch) {
            const userId = userIdMatch[1];
            callback(userId, parsed.event, parsed.data);
          }
        } catch (error) {
          logger.error(`❌ [Redis SSE] Failed to parse user event:`, error);
        }
      });

      // Subscribe to pattern: sse:user:*
      await subscriber.psubscribe(`${this.USER_CHANNEL_PREFIX}*`);

      logger.info(`👂 [Redis SSE] Subscribed to all user events`);

      // Return unsubscribe function
      return async () => {
        await subscriber.punsubscribe(`${this.USER_CHANNEL_PREFIX}*`);
        await subscriber.quit();
        logger.info(`🔌 [Redis SSE] Unsubscribed from all user events`);
      };
    } catch (error: any) {
      logger.error(`❌ [Redis SSE] Failed to subscribe to all user events:`, error);
      return async () => {};
    }
  }
}
