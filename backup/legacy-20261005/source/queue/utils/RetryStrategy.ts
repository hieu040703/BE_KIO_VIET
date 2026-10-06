import { RetryStrategyOptions } from "../types";
import { RETRY_STRATEGIES } from "../constants";

/**
 * Retry strategy helper
 */
export class RetryStrategy {
  /**
   * Get retry strategy by name
   */
  static getStrategy(name: keyof typeof RETRY_STRATEGIES): RetryStrategyOptions {
    return RETRY_STRATEGIES[name];
  }

  /**
   * Create custom retry strategy
   */
  static createCustom(options: Partial<RetryStrategyOptions>): RetryStrategyOptions {
    return {
      maxAttempts: options.maxAttempts || 3,
      backoffType: options.backoffType || "exponential",
      backoffDelay: options.backoffDelay || 2000,
      shouldRetry: options.shouldRetry,
    };
  }

  /**
   * Convert retry strategy to Bull job options
   */
  static toJobOptions(strategy: RetryStrategyOptions) {
    return {
      attempts: strategy.maxAttempts,
      backoff: {
        type: strategy.backoffType,
        delay: strategy.backoffDelay,
      },
    };
  }

  /**
   * Check if job should retry based on error
   */
  static shouldRetry(error: Error, attemptsMade: number, strategy: RetryStrategyOptions): boolean {
    // Check max attempts
    if (attemptsMade >= strategy.maxAttempts) {
      return false;
    }

    // Custom retry logic
    if (strategy.shouldRetry) {
      return strategy.shouldRetry(error, attemptsMade);
    }

    // Default: retry on all errors except specific ones
    const noRetryErrors = ["ValidationError", "AuthenticationError", "NotFoundError"];
    return !noRetryErrors.includes(error.name);
  }

  /**
   * Calculate next retry delay
   */
  static calculateDelay(attemptsMade: number, strategy: RetryStrategyOptions): number {
    if (strategy.backoffType === "exponential") {
      return strategy.backoffDelay * Math.pow(2, attemptsMade - 1);
    }
    return strategy.backoffDelay;
  }
}
