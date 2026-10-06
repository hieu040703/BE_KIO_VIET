import DatabaseConfig from "@/database/database";
import { Order } from "@/database/models/Order";
import logger from "@/shared/utils/logger";
import type { JobOptions } from "bull";
import { Cron } from "croner";
import type { Repository } from "typeorm";
import type { BaseQueue } from "../base/BaseQueue";
import { JOB_TYPES } from "../constants";
import type {
  OrderCalculationJobData,
  PendingOrderCalculation,
} from "../orderCalculation.types";

interface DispatchJobLike {
  data: OrderCalculationJobData;
  finishedOn?: number;
  getState(): Promise<string>;
  remove(): Promise<void>;
}

export const FAILED_JOB_REQUEUE_COOLDOWN_MS = 60_000;

export interface OrderCalculationDispatchDeps {
  findPending(): Promise<PendingOrderCalculation[]>;
  getJob(jobId: string): Promise<DispatchJobLike | null>;
  addJob(data: OrderCalculationJobData, options: JobOptions): Promise<unknown>;
}

const optionsFor = (jobId: string): JobOptions => ({
  jobId,
  attempts: 3,
  backoff: { type: "exponential", delay: 2_000 },
  // Timeout PostgreSQL được cấu hình trong transaction worker. Đặt 0 để Bull
  // không chỉ reject Promise bên ngoài trong khi transaction gốc vẫn còn chạy.
  timeout: 0,
  removeOnComplete: true,
  removeOnFail: false,
});

export function findPendingOrderCalculations(
  repository: Pick<
    Repository<Order>,
    "createQueryBuilder"
  > = DatabaseConfig.getRepository(Order),
) {
  return repository
    .createQueryBuilder("pending_order")
    .select(["pending_order.id", "pending_order.calculationVersion"])
    .where("pending_order.deletedAt IS NULL")
    .andWhere(
      "pending_order.calculationVersion > pending_order.calculatedVersion",
    )
    .orderBy("pending_order.updatedAt", "ASC")
    .limit(100)
    .getMany();
}

export async function dispatchPendingOrderCalculations(
  deps: OrderCalculationDispatchDeps,
  now: number = Date.now(),
) {
  const pendingOrders = await deps.findPending();
  let enqueued = 0;
  let skipped = 0;

  for (const order of pendingOrders) {
    // Một job cố định cho mỗi Order ngăn hai version chạy song song mà không cần khóa Order lâu.
    const jobId = `order-calculation:${order.id}`;
    const existingJob = await deps.getJob(jobId);
    if (existingJob) {
      const state = await existingJob.getState();
      const failedForOlderVersion =
        state === "failed" &&
        existingJob.data.version < order.calculationVersion;
      const failedSameVersionAfterCooldown =
        state === "failed" &&
        existingJob.data.version === order.calculationVersion &&
        existingJob.finishedOn !== undefined &&
        now - existingJob.finishedOn >= FAILED_JOB_REQUEUE_COOLDOWN_MS;
      if (
        state === "completed" ||
        failedForOlderVersion ||
        failedSameVersionAfterCooldown
      ) {
        await existingJob.remove();
      } else {
        skipped += 1;
        continue;
      }
    }

    await deps.addJob(
      { orderId: order.id, version: order.calculationVersion },
      optionsFor(jobId),
    );
    enqueued += 1;
  }

  return { pending: pendingOrders.length, enqueued, skipped };
}

let job: Cron | null = null;
let isProcessing = false;

export const JobOrderCalculationDispatch = {
  start(queue: BaseQueue<OrderCalculationJobData>) {
    if (job) return;
    job = new Cron("*/2 * * * * *", async () => {
      if (isProcessing) return;
      isProcessing = true;
      try {
        await dispatchPendingOrderCalculations({
          findPending: () => findPendingOrderCalculations(),
          getJob: (jobId) => queue.getJob(jobId),
          addJob: (data, options) =>
            queue.addJob(JOB_TYPES.ORDER_CALCULATION, data, options),
        });
      } catch (error) {
        logger.error("Order calculation dispatcher failed", error);
      } finally {
        isProcessing = false;
      }
    });
  },
  stop() {
    job?.stop();
    job = null;
  },
};
