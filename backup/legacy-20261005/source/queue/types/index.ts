import { Job, JobOptions } from "bull";

/**
 * Base job data interface
 */
export interface BaseJobData {
  userId?: string;
  timestamp?: Date;
}

/**
 * Job with progress tracking
 */
export interface ProgressJobData extends BaseJobData {
  sseName?: string;
}

/**
 * Import job data
 */
export interface ImportJobData extends ProgressJobData {
  path: string;
  timeAt: Date;
}

/**
 * Export job data
 */
export interface ExportJobData extends ProgressJobData {
  filters?: Record<string, any>;
  outputPath?: string;
}

/**
 * Progress callback function
 */
export type ProgressCallback = (
  progress: number,
  message: string,
  data?: {
    total?: number;
    success?: number;
    failed?: number;
    [key: string]: any;
  },
) => void;

/**
 * Job result interface
 */
export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

/**
 * Queue priority levels
 */
export enum QueuePriority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
}

/**
 * Retry strategy options
 */
export interface RetryStrategyOptions {
  maxAttempts: number;
  backoffType: "fixed" | "exponential";
  backoffDelay: number;
  shouldRetry?: (error: Error, attemptsMade: number) => boolean;
}

/**
 * Queue metrics
 */
export interface QueueMetrics {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  health: "healthy" | "warning" | "critical";
}

/**
 * Job context for processors
 */
export interface JobContext<T = any> {
  job: Job<T>;
  progress: ProgressCallback;
  logger: {
    info: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    error: (message: string, meta?: any) => void;
  };
}
