import logger from "@/shared/utils/logger";

logger.info("Kiot retail API has no background worker configured.");

const shutdown = () => process.exit(0);
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
