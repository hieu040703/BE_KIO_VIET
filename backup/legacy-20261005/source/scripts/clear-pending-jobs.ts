import "reflect-metadata";
import { QueueFactory } from "../queue/QueueFactory";
import logger from "../shared/utils/logger";
import { queueManager } from "../queue";

async function clearPendingJobs() {
    logger.info("🚀 Starting to clear pending jobs from all queues...");

    // Initialize all queues
    const queues = QueueFactory.initializeDefaultQueues(false);
    const queueList = Object.values(queues);

    logger.info(`Found ${queueList.length} queues.`);

    for (const queue of queueList) {
        if (!queue) continue;

        const qName = queue.getName();
        const bullQueue = queue.getQueue();

        try {
            // Get counts before cleaning
            const counts = await bullQueue.getJobCounts();
            logger.info(`[${qName}] Before: Waiting: ${counts.waiting}, Active: ${counts.active}, Delayed: ${counts.delayed}, Failed: ${counts.failed}`);

            // Empty waiting jobs (pending)
            await bullQueue.empty();

            // Clean failed jobs (older than 0ms)
            await bullQueue.clean(0, "failed");

            // Note: We generally don't want to kill active jobs unless requested, as it might leave data in inconsistent state.
            // But if "pending" implies stuck jobs, users sometimes want 'active' cleared too.
            // For now, let's stick to waiting and failed.

            // Get counts after cleaning
            const newCounts = await bullQueue.getJobCounts();
            logger.info(`[${qName}] After: Waiting: ${newCounts.waiting}, Active: ${newCounts.active}, Delayed: ${newCounts.delayed}, Failed: ${newCounts.failed}`);
            logger.info(`✅ Cleared queue: ${qName}`);
        } catch (error: any) {
            logger.error(`❌ Failed to clear queue ${qName}: ${error.message}`);
        }
    }

    logger.info("🎉 Finished clearing all queues.");

    // Close connections
    await queueManager.closeAll();
    process.exit(0);
}

clearPendingJobs().catch((err) => {
    logger.error("❌ Fatal error:", err);
    process.exit(1);
});
