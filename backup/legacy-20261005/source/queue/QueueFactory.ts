import {
  BaseQueue,
  QueueConfig as BaseQueueConfig,
  JobProcessor,
} from "./base/BaseQueue";
import { QueueManager } from "./base/QueueManager";
import { QueueConfig } from "./configs/QueueConfig";
import { QUEUE_NAMES } from "./constants";
import type { OrderCalculationJobData } from "./orderCalculation.types";

/**
 * Simplified QueueFactory with configuration-based approach
 */
export class QueueFactory {
  /**
   * Create a queue with configuration preset
   */
  static createQueue<T = any>(
    name: string,
    processors: Record<string, JobProcessor<T>>,
    configPreset: keyof typeof QueueConfig | "custom" = "custom",
    customConfig?: any,
  ): BaseQueue<T> {
    // Get configuration preset
    let queueOptions: any;
    if (configPreset === "custom") {
      queueOptions = customConfig || {};
    } else {
      const configMethod =
        QueueConfig[configPreset as keyof typeof QueueConfig];
      if (typeof configMethod === "function") {
        const options = configMethod();
        queueOptions = QueueConfig.buildOptions(options);
      }
    }

    const config: BaseQueueConfig = {
      name,
      options: queueOptions,
    };

    const queue = new (class extends BaseQueue<T> {})(config);

    // Get concurrency from preset or default to 3
    let concurrency = 3;
    if (configPreset !== "custom") {
      const configMethod =
        QueueConfig[configPreset as keyof typeof QueueConfig];
      if (typeof configMethod === "function") {
        const options = configMethod();
        concurrency = (options as any).concurrency || 3;
      }
    }

    queue.registerProcessors(processors, concurrency);

    // Auto-register with QueueManager
    const queueManager = QueueManager.getInstance();
    queueManager.registerQueue(queue);

    return queue;
  }

  /**
   * Create email queue
   */
  static createEmailQueue(): BaseQueue {
    const { EmailJobProcessor } = require("./processors/EmailJobProcessor");
    return this.createQueue(
      QUEUE_NAMES.EMAIL,
      {
        sendEmail: new EmailJobProcessor(),
        sendBulkEmail: new EmailJobProcessor(),
      },
      "email",
    );
  }

  /**
   * Create SMS queue
   */
  static createSmsQueue(isWorkerMode: boolean = false): BaseQueue {
    const processors: Record<string, JobProcessor> = {};

    if (isWorkerMode) {
      const { SmsJobProcessor } = require("./processors/SmsJobProcessor");
      processors.sendSms = new SmsJobProcessor();
    }

    return this.createQueue(QUEUE_NAMES.SMS, processors, "sms");
  }

  /**
   * Create notification queue
   */
  static createNotificationQueue(): BaseQueue {
    const {
      NotificationJobProcessor,
    } = require("./processors/NotificationJobProcessor");
    return this.createQueue(
      QUEUE_NAMES.NOTIFICATION,
      {
        sendNotification: new NotificationJobProcessor(),
      },
      "notification",
    );
  }

  /**
   * Create file processing queue
   */
  static createFileProcessingQueue(): BaseQueue {
    return this.createQueue(
      QUEUE_NAMES.FILE_PROCESSING,
      {
        processImage: {
          async process(job) {
            console.log(`Processing image: ${job.data.filename}`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return { processed: true, filename: job.data.filename };
          },
        },
        processDocument: {
          async process(job) {
            console.log(`Processing document: ${job.data.filename}`);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            return { processed: true, filename: job.data.filename };
          },
        },
      },
      "fileProcessing",
    );
  }

  static createOrderCalculationQueue(
    isWorkerMode: boolean = false,
  ): BaseQueue<OrderCalculationJobData> {
    const processors: Record<
      string,
      JobProcessor<OrderCalculationJobData>
    > = {};
    if (isWorkerMode) {
      const {
        OrderCalculationJobProcessor,
      } = require("./processors/OrderCalculationJobProcessor");
      processors.orderCalculation = new OrderCalculationJobProcessor();
    }

    return this.createQueue(
      QUEUE_NAMES.ORDER_CALCULATION,
      processors,
      "orderCalculation",
    );
  }

  /**
   * Initialize all default queues
   */
  static initializeDefaultQueues(isWorkerMode: boolean = false) {
    return {
      createSmsQueue: this.createSmsQueue(),
      createNotificationQueue: this.createNotificationQueue(),
      createEmailQueue: this.createEmailQueue(),
      createFileProcessingQueue: this.createFileProcessingQueue(),
      orderCalculation: this.createOrderCalculationQueue(isWorkerMode),
    };
  }
}
