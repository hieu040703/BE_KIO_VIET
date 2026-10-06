import { redisConfig } from "@/shared/config/env";
import Queue, { Job, JobOptions } from "bull";

export interface QueueConfig {
  name: string;
  options?: Queue.QueueOptions;
  defaultJobOptions?: JobOptions;
  concurrency?: number;
}

export interface JobProcessor<T = any> {
  process(job: Job<T>): Promise<any>;
}

export abstract class BaseQueue<T = any> {
  protected queue: Queue.Queue<T>;
  protected processors: Map<string, JobProcessor<T>> = new Map();

  constructor(config: QueueConfig) {
    const defaultOptions: Queue.QueueOptions = {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
        ...config.defaultJobOptions,
      },
      ...config.options,
    };

    this.queue = new Queue(config.name, defaultOptions);
    this.setupEventHandlers();
  }

  /**
   * Add a job to the queue
   */
  async addJob(jobType: string, data: T, options?: JobOptions): Promise<Job<T>> {
    return this.queue.add(jobType, data, options);
  }

  /**
   * Register a job processor
   */
  registerProcessor(jobType: string, processor: JobProcessor<T>, concurrency: number = 3): void {
    // console.log(`🔧 Registering processor for job type: ${jobType} with concurrency: ${concurrency}`);
    this.processors.set(jobType, processor);
    this.queue.process(jobType, concurrency, async (job: Job<T>) => {
      // console.log(`🚀 Processing job ${job.id} of type ${jobType}`);
      try {
        const result = await processor.process(job);
        this.onJobSuccess(job, result);
        return result;
      } catch (error) {
        this.onJobError(job, error);
        throw error;
      }
    });
    // console.log(`✅ Processor registered successfully for: ${jobType} with concurrency: ${concurrency}`);
  }

  /**
   * Register multiple processors at once
   */
  registerProcessors(processors: Record<string, JobProcessor<T>>, concurrency: number = 3): void {
    Object.entries(processors).forEach(([jobType, processor]) => {
      this.registerProcessor(jobType, processor, concurrency);
    });
  }

  /**
   * Get queue instance
   */
  getQueue(): Queue.Queue<T> {
    return this.queue;
  }

  /**
   * Get queue name
   */
  getName(): string {
    return this.queue.name;
  }

  /**
   * Pause the queue
   */
  async pause(): Promise<void> {
    await this.queue.pause();
  }

  /**
   * Resume the queue
   */
  async resume(): Promise<void> {
    await this.queue.resume();
  }

  /**
   * Close the queue
   */
  async close(): Promise<void> {
    await this.queue.close();
  }

  /**
   * Get a specific job by ID
   */
  async getJob(jobId: string | number): Promise<Job<T> | null> {
    return this.queue.getJob(jobId);
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();
    const delayed = await this.queue.getDelayed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
    };
  }

  /**
   * Setup event handlers for the queue
   */
  private setupEventHandlers(): void {
    this.queue.on("completed", (job, result) => {
      this.onCompleted(job, result);
    });

    this.queue.on("failed", (job, err) => {
      this.onFailed(job, err);
    });

    this.queue.on("progress", (job, progress) => {
      this.onProgress(job, progress);
    });

    this.queue.on("stalled", (job) => {
      this.onStalled(job);
    });

    this.queue.on("waiting", (jobId) => {
      this.onWaiting(jobId);
    });
  }

  /**
   * Override these methods for custom behavior
   */
  protected onCompleted(job: Job<T>, result: any): void {
    console.log(`[${this.getName()}] Job completed: ${job.id}`, {
      jobType: job.name,
      duration: job.finishedOn ? job.finishedOn - job.processedOn! : 0,
    });
  }

  protected onFailed(job: Job<T>, err: Error): void {
    console.error(`[${this.getName()}] Job failed: ${job.id}`, {
      jobType: job.name,
      error: err.message,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts,
    });
  }

  protected onProgress(job: Job<T>, progress: number): void {
    console.log(`[${this.getName()}] Job progress: ${job.id} - ${progress}%`);
  }

  protected onStalled(job: Job<T>): void {
    console.warn(`[${this.getName()}] Job stalled: ${job.id}`);
  }

  protected onWaiting(jobId: string | number): void {
    console.log(`[${this.getName()}] Job waiting: ${jobId}`);
  }

  protected onJobSuccess(job: Job<T>, result: any): void {
    // Override for custom success handling
  }

  protected onJobError(job: Job<T>, error: any): void {
    // Override for custom error handling
  }
}
