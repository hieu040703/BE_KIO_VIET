import { JobOptions, QueueOptions } from "bull";
import {
  QUEUE_CONCURRENCY,
  QUEUE_TIMEOUTS,
  JOB_CLEANUP,
  RATE_LIMITS,
  QUEUE_SETTINGS,
  RETRY_STRATEGIES,
  JOB_TYPES,
} from "../constants";
import { RetryStrategy } from "../utils";

/**
 * Base queue configuration interface
 */
export interface QueueConfigOptions {
  concurrency?: number;
  timeout?: number;
  retryStrategy?: keyof typeof RETRY_STRATEGIES;
  removeOnComplete?: number;
  removeOnFail?: number;
  rateLimit?: keyof typeof RATE_LIMITS;
  settings?: keyof typeof QUEUE_SETTINGS;
}

/**
 * Queue configuration builder
 */
export class QueueConfig {
  /**
   * Build Bull Queue options
   */
  static buildOptions(options: QueueConfigOptions = {}): QueueOptions {
    const retryStrategy = options.retryStrategy
      ? RETRY_STRATEGIES[options.retryStrategy]
      : RETRY_STRATEGIES.STANDARD;

    const rateLimit = options.rateLimit
      ? RATE_LIMITS[options.rateLimit]
      : undefined;
    const settings = options.settings
      ? QUEUE_SETTINGS[options.settings]
      : QUEUE_SETTINGS.STANDARD;

    return {
      defaultJobOptions: {
        attempts: retryStrategy.maxAttempts,
        backoff: {
          type: retryStrategy.backoffType,
          delay: retryStrategy.backoffDelay,
        },
        removeOnComplete:
          options.removeOnComplete || JOB_CLEANUP.KEEP_COMPLETED,
        removeOnFail: options.removeOnFail || JOB_CLEANUP.KEEP_FAILED,
        timeout: options.timeout,
      },
      limiter: rateLimit,
      settings,
    };
  }

  /**
   * Import queue configuration
   */
  static import(
    customOptions?: Partial<QueueConfigOptions>,
  ): QueueConfigOptions {
    return {
      concurrency: QUEUE_CONCURRENCY.LOW,
      timeout: QUEUE_TIMEOUTS.LONG,
      retryStrategy: "NO_RETRY",
      removeOnComplete: JOB_CLEANUP.KEEP_COMPLETED,
      removeOnFail: JOB_CLEANUP.KEEP_FAILED,
      rateLimit: "STRICT",
      settings: "LONG_RUNNING",
      ...customOptions,
    };
  }

  /**
   * Export queue configuration
   */
  static export(
    customOptions?: Partial<QueueConfigOptions>,
  ): QueueConfigOptions {
    return {
      concurrency: QUEUE_CONCURRENCY.LOW,
      timeout: QUEUE_TIMEOUTS.LONG,
      retryStrategy: "NO_RETRY",
      removeOnComplete: JOB_CLEANUP.KEEP_COMPLETED,
      removeOnFail: JOB_CLEANUP.KEEP_FAILED,
      rateLimit: "STRICT",
      ...customOptions,
    };
  }

  /**
   * Email queue configuration
   */
  static email(
    customOptions?: Partial<QueueConfigOptions>,
  ): QueueConfigOptions {
    return {
      concurrency: QUEUE_CONCURRENCY.MEDIUM,
      timeout: QUEUE_TIMEOUTS.SHORT,
      retryStrategy: "STANDARD",
      removeOnComplete: JOB_CLEANUP.KEEP_COMPLETED,
      removeOnFail: JOB_CLEANUP.KEEP_FAILED,
      ...customOptions,
    };
  }

  /**
   * SMS queue configuration
   */
  static sms(customOptions?: Partial<QueueConfigOptions>): QueueConfigOptions {
    return {
      concurrency: QUEUE_CONCURRENCY.MEDIUM,
      timeout: QUEUE_TIMEOUTS.SHORT,
      retryStrategy: "CRITICAL",
      removeOnComplete: JOB_CLEANUP.KEEP_COMPLETED,
      removeOnFail: JOB_CLEANUP.KEEP_FAILED,
      ...customOptions,
    };
  }

  /**
   * Notification queue configuration
   */
  static notification(
    customOptions?: Partial<QueueConfigOptions>,
  ): QueueConfigOptions {
    return {
      concurrency: QUEUE_CONCURRENCY.MEDIUM,
      timeout: QUEUE_TIMEOUTS.SHORT,
      retryStrategy: "STANDARD",
      removeOnComplete: JOB_CLEANUP.KEEP_COMPLETED_SHORT,
      removeOnFail: JOB_CLEANUP.KEEP_FAILED_SHORT,
      ...customOptions,
    };
  }

  /**
   * File processing queue configuration
   */
  static fileProcessing(
    customOptions?: Partial<QueueConfigOptions>,
  ): QueueConfigOptions {
    return {
      concurrency: QUEUE_CONCURRENCY.MEDIUM,
      timeout: QUEUE_TIMEOUTS.MEDIUM,
      retryStrategy: "QUICK",
      removeOnComplete: JOB_CLEANUP.KEEP_FAILED_SHORT,
      removeOnFail: JOB_CLEANUP.KEEP_FAILED_SHORT,
      ...customOptions,
    };
  }

  /**
   * Delete queue configuration
   */
  static delete(
    customOptions?: Partial<QueueConfigOptions>,
  ): QueueConfigOptions {
    return {
      concurrency: QUEUE_CONCURRENCY.LOW,
      timeout: QUEUE_TIMEOUTS.MEDIUM,
      retryStrategy: "NO_RETRY",
      removeOnComplete: JOB_CLEANUP.KEEP_COMPLETED,
      removeOnFail: JOB_CLEANUP.KEEP_FAILED,
      rateLimit: "STRICT",
      ...customOptions,
    };
  }

  /**
   * Update queue configuration
   */
  static update(
    customOptions?: Partial<QueueConfigOptions>,
  ): QueueConfigOptions {
    return {
      concurrency: QUEUE_CONCURRENCY.LOW,
      timeout: QUEUE_TIMEOUTS.MEDIUM,
      retryStrategy: "NO_RETRY",
      removeOnComplete: JOB_CLEANUP.KEEP_COMPLETED,
      removeOnFail: JOB_CLEANUP.KEEP_FAILED,
      rateLimit: "STRICT",
      ...customOptions,
    };
  }

  static orderCalculation(
    customOptions?: Partial<QueueConfigOptions>,
  ): QueueConfigOptions {
    return {
      concurrency: 2,
      timeout: 2 * 60 * 1000,
      retryStrategy: "STANDARD",
      removeOnComplete: JOB_CLEANUP.KEEP_COMPLETED_SHORT,
      removeOnFail: JOB_CLEANUP.KEEP_FAILED,
      rateLimit: "MODERATE",
      ...customOptions,
    };
  }
}
