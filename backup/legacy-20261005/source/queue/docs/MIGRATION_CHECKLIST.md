# 📋 Migration Checklist

## ✅ Completed

- [x] Created `types/` directory with centralized type definitions
- [x] Created `constants/` directory with queue names, job types, retry strategies
- [x] Created `configs/` directory with configuration presets
- [x] Created `utils/` directory with ProgressHelper and RetryStrategy
- [x] Created `base/BaseProcessor.ts` with common processor logic
- [x] Refactored `QueueFactory.ts` (535 → 180 lines)
- [x] Backed up original `QueueFactory.ts` → `QueueFactory.backup.ts`
- [x] Updated exports in `index.ts`
- [x] Created comprehensive documentation:
  - [x] `README.optimized.md` - Complete guide
  - [x] `OPTIMIZATION_SUMMARY.md` - Summary of changes
  - [x] `EmailJobProcessor.example.ts` - Migration example
- [x] Verified no TypeScript errors

## 🔄 Optional: Migrate Existing Processors

Để migrate các processor hiện tại sang BaseProcessor:

### High Priority (Import/Export processors)

- [ ] `ImportOrder.processor.ts`
- [ ] `ImportOrderUpdate.processor.ts`
- [ ] `ImportShopReconciliation.processor.ts`
- [ ] `ImportShopReconciliationUpdate.processor.ts`
- [ ] `ImportOrderReturn.processor.ts`
- [ ] `ExportShopReconciliation.processor.ts`

### Medium Priority

- [ ] `DeleteFileLog.processor.ts`
- [ ] `UpdateOrder.processor.ts`
- [ ] `RewriteFileLogResult.processor.ts`

### Low Priority (Simple processors)

- [ ] `EmailJobProcessor.ts`
- [ ] `SmsJobProcessor.ts`
- [ ] `NotificationJobProcessor.ts`

## 📝 Migration Steps (Per Processor)

### 1. Backup original file

```bash
cp ImportOrder.processor.ts ImportOrder.processor.backup.ts
```

### 2. Update imports

```typescript
// Add new imports
import { BaseProcessor } from "../base/BaseProcessor";
import { ProgressJobData, JobContext } from "../types";
```

### 3. Update interface (if needed)

```typescript
// Extend ProgressJobData instead of creating from scratch
export interface OrderImportJobData extends ProgressJobData {
  path: string;
  // ... other fields
}
```

### 4. Extend BaseProcessor

```typescript
// Change from:
export class ImportOrderProcessor {
  async process(job: Job<OrderImportJobData>): Promise<any> {

// To:
export class ImportOrderProcessor extends BaseProcessor<OrderImportJobData> {
  async process(job: Job<OrderImportJobData>): Promise<any> {
```

### 5. Replace SSE setup

```typescript
// Remove:
const sseName = Utils.generateRandomString(8);
const sendProgress = (message, progress, ...) => {
  sseService.sendToUser(userId, sseName, {...});
};
sseService.sendToUser(userId, "job-started", {...});

// Replace with:
const context = this.createContext(job);
const progressHelper = this.getProgressHelper(job);
```

### 6. Replace logging

```typescript
// Remove:
logger.info(`Starting job ${job.id}`);
logger.info(`Job completed`);
logger.error(`Job failed`);

// Replace with:
this.logStart(job, "Description");
context.logger.info("Message");
this.logComplete(job, duration, result);
```

### 7. Replace progress calls

```typescript
// Remove:
sendProgress("Message", 50, totalOrders, totalSuccess, totalErrors);

// Replace with:
context.progress(50, "Message", {
  total: totalOrders,
  success: totalSuccess,
  failed: totalErrors,
});
```

### 8. Update error handling

```typescript
// Remove:
catch (error: any) {
  logger.error(`Error:`, error);
  sendProgress("Error", 0);
  throw error;
}

// Replace with:
catch (error: any) {
  await this.handleError(job, error, progressHelper);
}
```

### 9. Test the processor

```bash
# Start worker
yarn worker

# Test with API call
# Verify:
# - SSE messages are received
# - Progress updates work
# - Error handling works
# - Logging is correct
```

### 10. Remove backup if successful

```bash
rm ImportOrder.processor.backup.ts
```

## 🧪 Testing Checklist

For each migrated processor:

- [ ] Job starts successfully
- [ ] SSE `job-started` event is sent
- [ ] Progress updates are sent at correct intervals
- [ ] Job completes successfully
- [ ] Result is returned correctly
- [ ] Errors are handled properly
- [ ] SSE error messages are sent
- [ ] Logging is consistent
- [ ] Retry logic works (if applicable)
- [ ] Database transactions work correctly

## 📊 Expected Results

After migration:

| Metric         | Before            | After              |
| -------------- | ----------------- | ------------------ |
| Lines of code  | ~150              | ~50                |
| Boilerplate    | ~50 lines         | 0 lines            |
| SSE setup      | Manual (15 lines) | Auto (0 lines)     |
| Logging        | Manual (10 lines) | Built-in (0 lines) |
| Error handling | Manual (10 lines) | Built-in (1 line)  |

## 🎯 Success Criteria

Migration is successful when:

1. ✅ All tests pass
2. ✅ No TypeScript errors
3. ✅ SSE messages work correctly
4. ✅ Progress tracking works
5. ✅ Error handling works
6. ✅ Logging is consistent
7. ✅ Code is ~67% shorter
8. ✅ Logic is clearer and easier to read

## 🚨 Rollback Plan

If issues occur:

1. Stop worker: `Ctrl+C`
2. Restore backup:
   ```bash
   cp ImportOrder.processor.backup.ts ImportOrder.processor.ts
   ```
3. Restart worker: `yarn worker`
4. Investigate issue
5. Try again with fixes

## 💡 Tips

1. **Migrate one processor at a time** - Easier to debug
2. **Test thoroughly** - Don't migrate all at once
3. **Keep backups** - Until confirmed working
4. **Use example** - Refer to `EmailJobProcessor.example.ts`
5. **Ask for help** - If stuck, review documentation

## 📞 Support

If you encounter issues:

1. Check `README.optimized.md` for detailed guide
2. Review `EmailJobProcessor.example.ts` for working example
3. Check `OPTIMIZATION_SUMMARY.md` for comparison
4. Review error logs
5. Test with simple processor first (Email/SMS/Notification)

---

**Note:** Migration is OPTIONAL. The system works with both old and new processor styles. Migrate when you have time and need to update the processor anyway.
