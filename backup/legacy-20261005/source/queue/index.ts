import { config } from "@/shared/config/env";
import { QueueFactory } from "./QueueFactory";
import { QueueManager } from "./base/QueueManager";
import logger from "@/shared/utils/logger";

// Initialize queue manager with configuration
const queueManager = QueueManager.getInstance({
  concurrency: 5,
  enableMetrics: true,
  healthCheckInterval: 30000,
});

// Khởi tạo queues dựa trên mode
// - Main Process: Khởi tạo tất cả queues KHÔNG có processor (chỉ add jobs)
// - Worker: Không khởi tạo ở đây, worker sẽ tự khởi tạo queue riêng
let queues: any;
if (!config.IS_WORKER_MODE) {
  // Main process: tất cả queues nhưng không register processor
  queues = QueueFactory.initializeDefaultQueues(false);
  logger.info("🌐 Main Process Mode: All queues available for job submission");
} else {
  // Worker mode: không khởi tạo queues ở đây
  queues = {};
  logger.info("🔧 Worker Mode: Skipping auto-initialization");
}

export const orderImportQueue = queues.importOrder || null;
export const orderImportUpdateQueue = queues.importOrderUpdate || null;
export const shopReconciliationQueue = queues.importShopReconciliation || null;
export const shopReconciliationUpdateQueue =
  queues.importShopReconciliationUpdate || null;
export const orderReturnQueue = queues.importOrderReturn || null;
export const fileLogDeletionQueue = queues.deleteFileLog || null;
export const sendEmailQueue = queues.createEmailQueue || null;
export const exportShopReconciliationQueue =
  queues.exportShopReconciliationQueue || null;
export const updateOrderQueue = queues.updateOrderQueue || null;
export const rewriteFileLogQueue = queues.rewriteFileLog || null;
export const restoreOrderQueue = queues.restoreOrder || null;
export const orderCalculationQueue = queues.orderCalculation || null;

// Export queue manager for advanced operations
export { queueManager };

// Export factory for creating new queues
export { QueueFactory };

// Export base classes for custom implementations
export { BaseQueue, JobProcessor } from "./base/BaseQueue";
export { QueueManager } from "./base/QueueManager";
export { BaseProcessor } from "./base/BaseProcessor";

// Export utilities
export * from "./utils";
export * from "./types";
export * from "./constants";
export * from "./configs";

// Graceful shutdown handler
process.on("SIGINT", async () => {
  console.log("Shutting down queues gracefully...");
  await queueManager.closeAll();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down queues gracefully...");
  await queueManager.closeAll();
  process.exit(0);
});

logger.info("Queue system initialized successfully!");
