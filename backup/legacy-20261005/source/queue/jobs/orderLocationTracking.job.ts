import { container } from "@/modules/container";
import { GOONG_MAP_TYPES } from "@/modules/goongMap/goongMap.types";
import { GoongMapService } from "@/modules/goongMap/goongMap.service";
import { config } from "@/shared/config/env";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";

export const buildCronExpression = (intervalSeconds: number): string => {
  const normalizedIntervalSeconds = Math.max(1, Math.floor(intervalSeconds));

  if (normalizedIntervalSeconds >= 60 && normalizedIntervalSeconds % 60 === 0) {
    return `0 */${normalizedIntervalSeconds / 60} * * * *`;
  }

  return `*/${Math.min(normalizedIntervalSeconds, 59)} * * * * *`;
};

async function processOrderLocationTrackingPings() {
  try {
    const goongMapService = container.get<GoongMapService>(GOONG_MAP_TYPES.GoongMapService);
    await goongMapService.sendPingRequestsForActiveOrders();
    logger.info("✅ Tracking Ping requests sent for active orders");
  } catch (error) {
    logger.error("Error in JobOrderLocationTracking:", error);
  }
}

let job: Cron | null = null;

export const JobOrderLocationTracking = {
  start: () => {
    if (!job) {
      job = new Cron(
        buildCronExpression(config.ORDER_TRACKING_PING_INTERVAL_SECONDS),
        { timezone: "Asia/Ho_Chi_Minh" },
        async () => {
          await processOrderLocationTrackingPings();
        },
      );
      logger.info("START JOB ORDER LOCATION TRACKING");
    }
  },
  stop: () => {
    if (job) {
      job.stop();
      job = null;
      logger.info("STOP JOB ORDER LOCATION TRACKING");
    }
  },
};
