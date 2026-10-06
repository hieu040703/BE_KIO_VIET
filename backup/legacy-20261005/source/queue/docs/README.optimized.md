# 🚀 Optimized Queue System

Hệ thống queue được tối ưu hóa với cấu trúc rõ ràng, dễ bảo trì và mở rộng.

## 📁 Cấu trúc thư mục

```
src/queue/
├── base/                      # Base classes
│   ├── BaseQueue.ts          # Base queue implementation
│   ├── BaseProcessor.ts      # Base processor with common logic ⭐ NEW
│   └── QueueManager.ts       # Queue manager
│
├── configs/                   # Queue configurations ⭐ NEW
│   ├── QueueConfig.ts        # Configuration presets
│   └── index.ts
│
├── constants/                 # Constants and enums ⭐ NEW
│   └── index.ts              # Queue names, job types, retry strategies
│
├── types/                     # TypeScript types ⭐ NEW
│   └── index.ts              # Common interfaces and types
│
├── utils/                     # Utility classes ⭐ NEW
│   ├── ProgressHelper.ts     # SSE progress helper
│   ├── RetryStrategy.ts      # Retry logic helper
│   └── index.ts
│
├── processors/                # Job processors
│   ├── ImportOrder.processor.ts
│   ├── DeleteFileLog.processor.ts
│   ├── EmailJobProcessor.ts
│   └── ...
│
├── QueueFactory.ts           # Simplified factory ⭐ REFACTORED
├── index.ts                  # Main entry point
└── README.optimized.md       # This file
```

## 🎯 Cải tiến chính

### 1. **BaseProcessor - Giảm code duplication**

Trước đây mỗi processor phải tự implement:

- ✅ SSE progress tracking
- ✅ Logging
- ✅ Error handling
- ✅ Progress updates

**Giờ chỉ cần extend BaseProcessor:**

```typescript
import { BaseProcessor } from "@/queue/base/BaseProcessor";
import { Job } from "bull";
import { ProgressJobData } from "@/queue/types";

export class MyProcessor extends BaseProcessor<MyJobData> {
  async process(job: Job<MyJobData>): Promise<any> {
    const startTime = Date.now();
    const context = this.createContext(job);
    const progressHelper = this.getProgressHelper(job);

    try {
      this.logStart(job, `Processing file: ${job.data.path}`);

      // Your logic here
      context.progress(10, "Starting...");
      // ... do work
      context.progress(50, "Half way...");
      // ... do more work
      context.progress(100, "Done!");

      const result = { success: true };
      this.logComplete(job, Date.now() - startTime, result);

      return result;
    } catch (error: any) {
      await this.handleError(job, error, progressHelper);
    }
  }
}
```

### 2. **Configuration Presets - Dễ dàng config**

Trước đây mỗi queue phải copy/paste config:

```typescript
// ❌ Old way - 30+ dòng mỗi queue
static createImportOrderQueue(): BaseQueue {
  return this.createSimpleQueue("importOrder", {
    importOrder: new ImportOrderProcessor(),
  }, {
    options: {
      defaultJobOptions: {
        attempts: 1,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 20,
        timeout: 30 * 60 * 1000,
      },
      limiter: { max: 1, duration: 1000 },
      settings: {
        lockDuration: 1800000,
        lockRenewTime: 15000,
        stalledInterval: 30000,
        maxStalledCount: 1,
      },
    },
  });
}
```

**Giờ chỉ cần:**

```typescript
// ✅ New way - 4 dòng mỗi queue
static createImportOrderQueue(): BaseQueue {
  const { ImportOrderProcessor } = require("./processors/ImportOrder.processor");
  return this.createQueue(QUEUE_NAMES.IMPORT_ORDER, {
    importOrder: new ImportOrderProcessor(),
  }, "import"); // ⭐ Preset name
}
```

### 3. **Centralized Constants**

```typescript
// Import từ constants
import { QUEUE_NAMES, JOB_TYPES, RETRY_STRATEGIES } from "@/queue/constants";

// Sử dụng
const queue = QueueFactory.createQueue(QUEUE_NAMES.IMPORT_ORDER, processors, "import");

await queue.addJob(JOB_TYPES.IMPORT_ORDER, data);
```

### 4. **Type Safety**

```typescript
import { ProgressJobData, JobResult, QueuePriority, RetryStrategyOptions } from "@/queue/types";

// Strongly typed job data
interface MyJobData extends ProgressJobData {
  filePath: string;
  shopId: string;
}

// Type-safe result
const result: JobResult<MyData> = {
  success: true,
  data: myData,
  timestamp: new Date(),
};
```

### 5. **Retry Strategies**

```typescript
import { RetryStrategy } from "@/queue/utils";

// Sử dụng preset
const strategy = RetryStrategy.getStrategy("CRITICAL");
// { maxAttempts: 5, backoffType: "exponential", backoffDelay: 5000 }

// Hoặc tạo custom
const custom = RetryStrategy.createCustom({
  maxAttempts: 10,
  backoffType: "exponential",
  backoffDelay: 1000,
  shouldRetry: (error, attempts) => {
    // Custom logic
    return error.message !== "ValidationError";
  },
});
```

### 6. **Progress Helper - SSE đơn giản**

```typescript
import { ProgressHelper } from "@/queue/utils";

// Trong processor
const progressHelper = new ProgressHelper(job.data.userId);

// Tự động gửi SSE name cho client
// Client nhận được: { sseName: "abc123", message: "Job started" }

// Gửi progress
progressHelper.sendProgress(50, "Processing...", {
  total: 100,
  success: 45,
  failed: 5,
});

// Gửi completion
progressHelper.sendCompleted({ result: "Success!" });

// Gửi error
progressHelper.sendError(new Error("Something failed"));
```

## 📊 Configuration Presets

### Available Presets:

| Preset           | Concurrency | Timeout | Retry    | Rate Limit | Use Case           |
| ---------------- | ----------- | ------- | -------- | ---------- | ------------------ |
| `import`         | 1           | 30 min  | NO_RETRY | STRICT     | File imports       |
| `export`         | 1           | 30 min  | NO_RETRY | STRICT     | File exports       |
| `email`          | 3           | 5 min   | STANDARD | -          | Email sending      |
| `sms`            | 3           | 5 min   | CRITICAL | -          | SMS sending        |
| `notification`   | 3           | 5 min   | STANDARD | -          | Push notifications |
| `fileProcessing` | 3           | 15 min  | QUICK    | -          | File processing    |
| `delete`         | 1           | 15 min  | NO_RETRY | STRICT     | Delete operations  |
| `update`         | 1           | 15 min  | NO_RETRY | STRICT     | Update operations  |

### Retry Strategies:

| Strategy   | Max Attempts | Backoff     | Delay |
| ---------- | ------------ | ----------- | ----- |
| `CRITICAL` | 5            | Exponential | 5s    |
| `STANDARD` | 3            | Exponential | 2s    |
| `QUICK`    | 2            | Fixed       | 1s    |
| `NO_RETRY` | 1            | Fixed       | 0s    |

## 🔧 Cách sử dụng

### 1. Tạo Processor mới

```typescript
// src/queue/processors/MyJob.processor.ts
import { BaseProcessor } from "@/queue/base/BaseProcessor";
import { Job } from "bull";
import { ProgressJobData } from "@/queue/types";

interface MyJobData extends ProgressJobData {
  filePath: string;
  options: Record<string, any>;
}

export class MyJobProcessor extends BaseProcessor<MyJobData> {
  async process(job: Job<MyJobData>): Promise<any> {
    const startTime = Date.now();
    const context = this.createContext(job);

    try {
      this.logStart(job, `Processing: ${job.data.filePath}`);

      // Step 1
      context.progress(10, "Loading file...");
      const data = await this.loadFile(job.data.filePath);

      // Step 2
      context.progress(50, "Processing data...", {
        total: data.length,
      });
      const result = await this.processData(data);

      // Step 3
      context.progress(90, "Saving results...");
      await this.saveResults(result);

      context.progress(100, "Completed!");

      this.logComplete(job, Date.now() - startTime, result);
      return result;
    } catch (error: any) {
      await this.handleError(job, error, this.getProgressHelper(job));
    }
  }

  private async loadFile(path: string) {
    // Implementation
  }

  private async processData(data: any[]) {
    // Implementation
  }

  private async saveResults(result: any) {
    // Implementation
  }
}
```

### 2. Đăng ký Queue trong Factory

```typescript
// src/queue/QueueFactory.ts
static createMyJobQueue(): BaseQueue {
  const { MyJobProcessor } = require("./processors/MyJob.processor");
  return this.createQueue(
    "myJob",
    { processMyJob: new MyJobProcessor() },
    "import" // or "export", "email", etc.
  );
}

// Add to initializeDefaultQueues
static initializeDefaultQueues(isWorkerMode: boolean = false) {
  return {
    // ... existing queues
    myJobQueue: this.createMyJobQueue(),
  };
}
```

### 3. Sử dụng trong Controller

```typescript
import { myJobQueue } from "@/queue";
import { JOB_TYPES } from "@/queue/constants";

// Add job
await myJobQueue.addJob(JOB_TYPES.PROCESS_MY_JOB, {
  userId: req.user.id,
  filePath: "/path/to/file",
  options: { optimize: true },
});
```

### 4. Client-side SSE listener

```typescript
// Lắng nghe job started để nhận sseName
eventSource.addEventListener("job-started", (event) => {
  const data = JSON.parse(event.data);
  const sseName = data.sseName;

  // Đăng ký listener cho job cụ thể
  eventSource.addEventListener(sseName, (event) => {
    const progress = JSON.parse(event.data);
    console.log(`Progress: ${progress.progress}%`);
    console.log(`Message: ${progress.message}`);

    if (progress.completed) {
      console.log("Job completed!");
    }

    if (progress.error) {
      console.error("Job failed:", progress.errorMessage);
    }
  });
});
```

## 🎨 Best Practices

### 1. **Sử dụng BaseProcessor**

- Extend BaseProcessor cho tất cả processors
- Sử dụng `createContext()` để có logger và progress
- Sử dụng `logStart()`, `logComplete()`, `logError()` cho logging

### 2. **Progress Updates**

- Cập nhật progress thường xuyên (mỗi 10-20%)
- Gửi thông tin hữu ích: `{ total, success, failed }`
- Luôn gửi 100% khi hoàn thành

### 3. **Error Handling**

- Sử dụng `handleError()` để xử lý lỗi thống nhất
- Re-throw error để Bull xử lý retry
- Log chi tiết error với context

### 4. **Configuration**

- Sử dụng presets có sẵn
- Chỉ tạo custom config khi thực sự cần
- Document custom config rõ ràng

### 5. **Constants**

- Luôn sử dụng constants cho queue names và job types
- Không hardcode strings
- Centralize magic numbers

## 📈 Performance Tips

1. **Chunk large data**: Process data in chunks
2. **Update progress**: Prevent stalled jobs
3. **Use concurrency wisely**: Don't overload
4. **Clean up**: Configure removeOnComplete/removeOnFail
5. **Monitor**: Use QueueManager.getOverallStats()

## 🔍 Debugging

```typescript
// Get queue statistics
const stats = await queueManager.getOverallStats();
console.log(stats);

// Health check
const health = await queueManager.healthCheck();
console.log(health);

// Get specific queue
const queue = queueManager.getQueue("importOrder");
const queueStats = await queue.getStats();
```

## 📝 Migration Guide

Để migrate processor cũ sang BaseProcessor:

1. **Thay đổi class declaration:**

```typescript
// Before
export class MyProcessor {
  async process(job: Job<MyJobData>): Promise<any> {

// After
export class MyProcessor extends BaseProcessor<MyJobData> {
  async process(job: Job<MyJobData>): Promise<any> {
```

2. **Sử dụng context và helpers:**

```typescript
// Before
const sseName = Utils.generateRandomString(8);
const sendProgress = (progress, message) => {
  sseService.sendToUser(userId, sseName, { progress, message });
};

// After
const context = this.createContext(job);
const progressHelper = this.getProgressHelper(job);
context.progress(50, "Processing...");
```

3. **Sử dụng logging methods:**

```typescript
// Before
logger.info(`Starting job ${job.id}`);

// After
this.logStart(job, "Processing file");
context.logger.info("Custom log message");
```

## 🚀 Coming Soon

- [ ] Dead Letter Queue (DLQ)
- [ ] Job Priority System
- [ ] Advanced Metrics Dashboard
- [ ] Job Scheduling (Cron)
- [ ] Distributed Tracing

---

**Tác giả:** Queue System Optimization Team  
**Ngày cập nhật:** December 1, 2025
