import { BaseQueue } from "./BaseQueue";

export interface QueueManagerConfig {
  concurrency?: number;
  enableMetrics?: boolean;
  healthCheckInterval?: number;
}

export class QueueManager {
  private static instance: QueueManager;
  private queues: Map<string, BaseQueue> = new Map();
  private config: QueueManagerConfig;
  private healthCheckInterval?: NodeJS.Timeout;

  private constructor(config: QueueManagerConfig = {}) {
    this.config = {
      concurrency: 5,
      enableMetrics: false,
      healthCheckInterval: 300000, // 30 seconds
      ...config,
    };

    // if (this.config.enableMetrics) {
    //   this.startHealthCheck();
    // }
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: QueueManagerConfig): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager(config);
    }
    return QueueManager.instance;
  }

  /**
   * Register a queue
   */
  registerQueue(queue: BaseQueue): void {
    const name = queue.getName();
    if (this.queues.has(name)) {
      console.warn(`Queue "${name}" is already registered. Overriding...`);
    } else {
      this.queues.set(name, queue);
      // Check if queue has processors
      const hasProcessors = (queue as any).processors.size > 0;
      if (hasProcessors) {
        console.log(`===> Queue "${name}" registered with ${(queue as any).processors.size} processor(s)`);
      } else {
        console.log(`===> Queue "${name}" registered (job submission only, no processor)`);
      }
    }
  }

  /**
   * Get a queue by name
   */
  getQueue<T extends BaseQueue = BaseQueue>(name: string): T | undefined {
    return this.queues.get(name) as T;
  }

  /**
   * Get all queues
   */
  getAllQueues(): Map<string, BaseQueue> {
    return new Map(this.queues);
  }

  /**
   * Remove a queue
   */
  async removeQueue(name: string): Promise<boolean> {
    const queue = this.queues.get(name);
    if (queue) {
      await queue.close();
      this.queues.delete(name);
      console.log(`Queue "${name}" removed successfully`);
      return true;
    }
    return false;
  }

  /**
   * Pause all queues
   */
  async pauseAll(): Promise<void> {
    const promises = Array.from(this.queues.values()).map((queue) => queue.pause());
    await Promise.all(promises);
    console.log("All queues paused");
  }

  /**
   * Resume all queues
   */
  async resumeAll(): Promise<void> {
    const promises = Array.from(this.queues.values()).map((queue) => queue.resume());
    await Promise.all(promises);
    console.log("All queues resumed");
  }

  /**
   * Close all queues
   */
  async closeAll(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    const promises = Array.from(this.queues.values()).map((queue) => queue.close());
    await Promise.all(promises);
    this.queues.clear();
    console.log("All queues closed");
  }

  /**
   * Get overall statistics
   */
  async getOverallStats() {
    const queueStats = await Promise.all(
      Array.from(this.queues.entries()).map(async ([name, queue]) => {
        const stats = await queue.getStats();
        return { name, ...stats };
      })
    );

    const overall = queueStats.reduce(
      (acc, stats) => ({
        waiting: acc.waiting + stats.waiting,
        active: acc.active + stats.active,
        completed: acc.completed + stats.completed,
        failed: acc.failed + stats.failed,
        delayed: acc.delayed + stats.delayed,
        total: acc.total + stats.total,
      }),
      { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, total: 0 }
    );

    return {
      overall,
      queues: queueStats,
      totalQueues: this.queues.size,
    };
  }

  /**
   * Health check for all queues
   */
  async healthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    let healthy = true;

    try {
      const stats = await this.getOverallStats();

      // Check for too many failed jobs
      if (stats.overall.failed > 100) {
        issues.push(`High number of failed jobs: ${stats.overall.failed}`);
        healthy = false;
      }

      // Check for stalled jobs (active jobs that might be stuck)
      for (const queueStat of stats.queues) {
        if (queueStat.active > 10) {
          issues.push(`Queue "${queueStat.name}" has too many active jobs: ${queueStat.active}`);
          healthy = false;
        }
      }

      // Check if Redis is accessible
      for (const [name, queue] of this.queues) {
        try {
          await queue.getStats();
        } catch (error) {
          issues.push(`Queue "${name}" is not accessible: ${error}`);
          healthy = false;
        }
      }
    } catch (error) {
      issues.push(`Health check failed: ${error}`);
      healthy = false;
    }

    return { healthy, issues };
  }

  /**
   * Start periodic health check
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.healthCheck();
      if (!health.healthy) {
        console.warn("Queue Manager Health Issues:", health.issues);
      } else {
        console.log("Queue Manager: All systems healthy");
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Get configuration
   */
  getConfig(): QueueManagerConfig {
    return { ...this.config };
  }
}
