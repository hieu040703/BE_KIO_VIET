import { Job } from "bull";
import logger from "@/shared/utils/logger";
import { JobProcessor } from "./BaseQueue";
import { JobContext, ProgressCallback, ProgressJobData } from "../types";
import { ProgressHelper } from "../utils";

/**
 * Abstract base processor with common functionality
 */
export abstract class BaseProcessor<T extends ProgressJobData = ProgressJobData> implements JobProcessor<T> {
  /**
   * Main process method - must be implemented by subclasses
   */
  abstract process(job: Job<T>): Promise<any>;

  /**
   * Create job context with helpers
   */
  protected createContext(job: Job<T>): JobContext<T> {
    let progressHelper: ProgressHelper | null = null;

    // Create progress helper if userId exists
    if (job.data.userId) {
      progressHelper = new ProgressHelper(job.data.userId);
    }

    const progress: ProgressCallback = (progressValue, message, data) => {
      if (progressHelper) {
        progressHelper.sendProgress(progressValue, message, data);
      }
      // Update job progress
      job.progress(progressValue);
    };

    return {
      job,
      progress,
      logger: {
        info: (message: string, meta?: any) => {
          logger.info(`[${job.queue.name}][${job.id}] ${message}`, meta);
        },
        warn: (message: string, meta?: any) => {
          logger.warn(`[${job.queue.name}][${job.id}] ${message}`, meta);
        },
        error: (message: string, meta?: any) => {
          logger.error(`[${job.queue.name}][${job.id}] ${message}`, meta);
        },
      },
    };
  }

  /**
   * Get progress helper for SSE updates
   */
  protected getProgressHelper(job: Job<T>): ProgressHelper | null {
    if (job.data.userId) {
      return new ProgressHelper(job.data.userId);
    }
    return null;
  }

  /**
   * Send progress update
   */
  protected sendProgress(context: JobContext<T>, progress: number, message: string, data?: Record<string, any>): void {
    context.progress(progress, message, data);
  }

  /**
   * Log job start
   */
  protected logStart(job: Job<T>, additionalInfo?: string): void {
    const info = additionalInfo ? ` - ${additionalInfo}` : "";
    logger.info(`🚀 Starting job ${job.id}${info}`);
  }

  /**
   * Log job completion
   */
  protected logComplete(job: Job<T>, duration: number, result?: any): void {
    logger.info(`✅ Job ${job.id} completed in ${duration}ms`, {
      jobType: job.name,
      result,
    });
  }

  /**
   * Log job error
   */
  protected logError(job: Job<T>, error: Error): void {
    logger.error(`❌ Job ${job.id} failed:`, {
      jobType: job.name,
      error: error.message,
      stack: error.stack,
      attempts: job.attemptsMade,
    });
  }

  /**
   * Measure execution time
   */
  protected async measureTime<R>(fn: () => Promise<R>): Promise<{ result: R; duration: number }> {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    return { result, duration };
  }

  /**
   * Handle errors with proper logging and notification
   */
  protected async handleError(job: Job<T>, error: Error, progressHelper?: ProgressHelper | null): Promise<void> {
    this.logError(job, error);

    if (progressHelper) {
      progressHelper.sendError(error);
    }

    // Re-throw to let Bull handle retry logic
    throw error;
  }
}
