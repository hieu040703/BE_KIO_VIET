import { QueuePriority, RetryStrategyOptions } from "../types";

/**
 * Queue names
 */
export const QUEUE_NAMES = {
  SMS: "sms",
  EMAIL: "email",
  NOTIFICATION: "notification",
  FILE_PROCESSING: "fileProcessing",
  IMPORT_ORDER: "importOrder",
  IMPORT_ORDER_UPDATE: "importOrderUpdate",
  IMPORT_SHOP_RECONCILIATION: "importShopReconciliation",
  IMPORT_SHOP_RECONCILIATION_UPDATE: "importShopReconciliationUpdate",
  IMPORT_ORDER_RETURN: "importOrderReturn",
  DELETE_FILE_LOG: "deleteFileLog",
  EXPORT_SHOP_RECONCILIATION: "exportShopReconciliation",
  UPDATE_ORDER: "updateOrder",
  REWRITE_FILE_LOG: "rewriteFileLog",
  RESTORE_ORDER: "restoreOrder",
  ORDER_CALCULATION: "orderCalculation",
} as const;

/**
 * Job type names
 */
export const JOB_TYPES = {
  // Import operations
  IMPORT_ORDER: "importOrder",
  IMPORT_ORDER_UPDATE: "importOrderUpdate",
  IMPORT_SHOP_RECONCILIATION: "importShopReconciliation",
  IMPORT_SHOP_RECONCILIATION_UPDATE: "importShopReconciliationUpdate",
  IMPORT_ORDER_RETURN: "importOrderReturn",

  // Export operations
  EXPORT_SHOP_RECONCILIATION: "exportShopReconciliation",

  // File operations
  DELETE_FILE_LOG: "deleteFileLog",
  REWRITE_FILE_LOG: "rewriteFileLog",
  PROCESS_IMAGE: "processImage",
  PROCESS_DOCUMENT: "processDocument",

  // Update operations
  UPDATE_ORDER: "updateOrder",

  // Restore operations
  RESTORE_ORDER: "restoreOrder",
  ORDER_CALCULATION: "orderCalculation",

  // Communication
  SEND_EMAIL: "sendEmail",
  SEND_BULK_EMAIL: "sendBulkEmail",
  SEND_SMS: "sendSms",
  SEND_BULK_SMS: "sendBulkSms",
  SEND_NOTIFICATION: "sendNotification",
} as const;

/**
 * Default retry strategies
 */
export const RETRY_STRATEGIES: Record<string, RetryStrategyOptions> = {
  CRITICAL: {
    maxAttempts: 5,
    backoffType: "exponential",
    backoffDelay: 5000,
  },
  STANDARD: {
    maxAttempts: 3,
    backoffType: "exponential",
    backoffDelay: 2000,
  },
  QUICK: {
    maxAttempts: 2,
    backoffType: "fixed",
    backoffDelay: 1000,
  },
  NO_RETRY: {
    maxAttempts: 1,
    backoffType: "fixed",
    backoffDelay: 0,
  },
};

/**
 * Queue timeouts (in milliseconds)
 */
export const QUEUE_TIMEOUTS = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  EXTRA_LONG: 60 * 60 * 1000, // 1 hour
};

/**
 * Queue concurrency settings
 */
export const QUEUE_CONCURRENCY = {
  LOW: 1,
  MEDIUM: 3,
  HIGH: 5,
  VERY_HIGH: 10,
};

/**
 * Job cleanup settings
 */
export const JOB_CLEANUP = {
  KEEP_COMPLETED: 100,
  KEEP_FAILED: 20,
  KEEP_COMPLETED_SHORT: 50,
  KEEP_FAILED_SHORT: 10,
};

/**
 * Rate limiter settings
 */
export const RATE_LIMITS = {
  STRICT: {
    max: 1,
    duration: 1000,
  },
  MODERATE: {
    max: 5,
    duration: 1000,
  },
  RELAXED: {
    max: 10,
    duration: 1000,
  },
};

/**
 * Queue settings for lock and stalled jobs
 */
export const QUEUE_SETTINGS = {
  STANDARD: {
    lockDuration: 30000, // 30 seconds
    lockRenewTime: 15000, // 15 seconds
    stalledInterval: 30000, // 30 seconds
    maxStalledCount: 1,
  },
  LONG_RUNNING: {
    lockDuration: 1800000, // 30 minutes
    lockRenewTime: 15000, // 15 seconds
    stalledInterval: 30000, // 30 seconds
    maxStalledCount: 1,
  },
};
