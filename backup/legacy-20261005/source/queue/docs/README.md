# Optimized Queue System

Hệ thống queue được tối ưu hóa cho phép tạo và quản lý nhiều queue khác nhau một cách dễ dàng mà không cần viết lại code.

## 🚀 Tính năng chính

- **BaseQueue**: Class cơ sở có thể tái sử dụng cho tất cả queue
- **QueueManager**: Quản lý tập trung tất cả queue
- **JobProcessor**: Interface chuẩn cho xử lý job
- **QueueFactory**: Tạo queue mới một cách nhanh chóng
- **Auto-scaling**: Tự động điều chỉnh số lượng worker
- **Health monitoring**: Giám sát sức khỏe của các queue
- **Graceful shutdown**: Tắt ứng dụng một cách an toàn

## 📁 Cấu trúc thư mục

```
src/queue/
├── base/
│   ├── BaseQueue.ts          # Class cơ sở cho tất cả queue
│   └── QueueManager.ts       # Quản lý tất cả queue
├── processors/
│   ├── NotificationJobProcessor.ts  # Xử lý job notification
│   ├── EmailJobProcessor.ts        # Xử lý job email
│   └── SmsJobProcessor.ts          # Xử lý job SMS
├── QueueFactory.ts           # Factory tạo queue
├── index.ts                  # Entry point
├── demo.ts                   # Demo cách sử dụng
└── notification.queue.ts     # Queue notification (refactored)
```

## 🎯 Cách sử dụng

### 1. Khởi tạo hệ thống queue

```typescript
import { QueueFactory, queueManager } from "@/queue";

// Khởi tạo tất cả queue mặc định
const queues = QueueFactory.initializeDefaultQueues();
```

### 2. Sử dụng queue có sẵn

```typescript
import { notificationQueue, emailQueue, smsQueue } from "@/queue";

// Gửi notification
await notificationQueue.addJob("sendNotification", {
  type: "FEEDBACK",
  userId: 1,
  title: "New Feedback",
  content: "You have new feedback",
});

// Gửi email
await emailQueue.addJob("sendEmail", {
  to: "user@example.com",
  subject: "Welcome!",
  content: "<h1>Welcome to our platform!</h1>",
});

// Gửi SMS
await smsQueue.addJob("sendSms", {
  phone: "+1234567890",
  message: "Your verification code is 123456",
});
```

### 3. Tạo queue mới

```typescript
import { QueueFactory } from "@/queue";

// Tạo queue đơn giản
const myQueue = QueueFactory.createSimpleQueue("my-custom-queue", {
  processData: {
    async process(job) {
      console.log("Processing:", job.data);
      // Xử lý logic ở đây
      return { success: true };
    },
  },
});

// Tạo queue với cấu hình nâng cao
const advancedQueue = QueueFactory.createCustomQueue(
  "advanced-queue",
  {
    complexTask: new MyCustomProcessor(),
  },
  {
    options: {
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 10000 },
        removeOnComplete: 100,
        removeOnFail: 20,
      },
    },
  }
);
```

### 4. Tạo Job Processor tùy chỉnh

```typescript
import { JobProcessor } from "@/queue";

export class MyCustomProcessor implements JobProcessor<MyDataType> {
  async process(job: Job<MyDataType>): Promise<any> {
    const data = job.data;

    // Xử lý logic của bạn
    console.log(`Processing job ${job.id}:`, data);

    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { processed: true, jobId: job.id };
  }
}
```

### 5. Giám sát và quản lý

```typescript
import { queueManager } from "@/queue";

// Xem thống kê tổng quan
const stats = await queueManager.getOverallStats();
console.log("Queue Stats:", stats);

// Kiểm tra sức khỏe
const health = await queueManager.healthCheck();
console.log("Health:", health);

// Tạm dừng tất cả queue
await queueManager.pauseAll();

// Tiếp tục tất cả queue
await queueManager.resumeAll();

// Đóng tất cả queue
await queueManager.closeAll();
```

## 📊 Monitoring Dashboard

Để xem dashboard monitoring, bạn có thể sử dụng:

```typescript
// Lấy thống kê chi tiết
const detailedStats = await queueManager.getOverallStats();

// Format cho dashboard
const dashboardData = {
  totalQueues: detailedStats.totalQueues,
  overall: detailedStats.overall,
  queues: detailedStats.queues.map((q) => ({
    name: q.name,
    status: q.active > 0 ? "active" : "idle",
    waiting: q.waiting,
    active: q.active,
    completed: q.completed,
    failed: q.failed,
  })),
};
```

## 🔧 Cấu hình

### Cấu hình QueueManager

```typescript
const queueManager = QueueManager.getInstance({
  concurrency: 10, // Số lượng job xử lý đồng thời
  enableMetrics: true, // Bật thu thập metrics
  healthCheckInterval: 30000, // Kiểm tra sức khỏe mỗi 30 giây
});
```

### Cấu hình Queue

```typescript
const myQueue = QueueFactory.createCustomQueue("my-queue", processors, {
  options: {
    defaultJobOptions: {
      attempts: 3, // Số lần thử lại
      backoff: {
        type: "exponential", // Loại backoff
        delay: 2000, // Delay giữa các lần thử
      },
      removeOnComplete: 50, // Giữ lại 50 job thành công
      removeOnFail: 10, // Giữ lại 10 job thất bại
      delay: 1000, // Delay trước khi chạy job
    },
  },
});
```

## 🚨 Error Handling

```typescript
// Xử lý lỗi trong processor
export class SafeProcessor implements JobProcessor {
  async process(job: Job): Promise<any> {
    try {
      // Logic xử lý
      return await this.doWork(job.data);
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);

      // Log lỗi, gửi alert, etc.
      await this.handleError(job, error);

      // Re-throw để Bull retry job
      throw error;
    }
  }

  private async handleError(job: Job, error: Error) {
    // Custom error handling logic
  }
}
```

## 🔄 Migration từ queue cũ

Nếu bạn đang sử dụng queue cũ, chỉ cần thay đổi:

```typescript
// Cũ
SentNotificationQueue.add("sendNotification", data);

// Mới
SentNotificationQueue.addJob("sendNotification", data);
```

## 📈 Performance Tips

1. **Concurrency**: Điều chỉnh số lượng worker phù hợp
2. **Cleanup**: Cấu hình `removeOnComplete` và `removeOnFail`
3. **Monitoring**: Bật metrics để theo dõi performance
4. **Graceful shutdown**: Luôn đóng queue khi tắt ứng dụng

## 🎮 Demo

Chạy demo để xem các tính năng:

```typescript
import { QueueDemo } from "@/queue/demo";

// Chạy tất cả demo
await QueueDemo.runAllDemos();

// Hoặc chạy từng demo riêng
await QueueDemo.basicDemo();
await QueueDemo.customQueueDemo();
await QueueDemo.monitoringDemo();
```
