import type {
  OrderCalculationJobData,
  OrderCalculationProcessorDeps,
} from "../orderCalculation.types";
import type { EntityManager } from "typeorm";

const ORDER_CALCULATION_LOCK_TIMEOUT_MS = 10_000;
const ORDER_CALCULATION_STATEMENT_TIMEOUT_MS = 90_000;
const ORDER_CALCULATION_IDLE_TRANSACTION_TIMEOUT_MS = 90_000;

export async function configureOrderCalculationTransaction(
  manager: Pick<EntityManager, "query">,
): Promise<void> {
  await manager.query(
    `SELECT
       set_config('lock_timeout', $1, true),
       set_config('statement_timeout', $2, true),
       set_config('idle_in_transaction_session_timeout', $3, true)`,
    [
      String(ORDER_CALCULATION_LOCK_TIMEOUT_MS),
      String(ORDER_CALCULATION_STATEMENT_TIMEOUT_MS),
      String(ORDER_CALCULATION_IDLE_TRANSACTION_TIMEOUT_MS),
    ],
  );
}

export type OrderCalculationJobResult = {
  status: "processed" | "skipped" | "missing";
  version: number;
};

export async function processOrderCalculationJob(
  data: OrderCalculationJobData,
  deps: OrderCalculationProcessorDeps,
): Promise<OrderCalculationJobResult> {
  return deps.withTransaction(async (manager) => {
    const order = await deps.getOrderVersion(data.orderId, manager);
    if (!order) {
      return { status: "missing", version: data.version };
    }

    if (order.calculatedVersion >= order.calculationVersion) {
      return { status: "skipped", version: order.calculationVersion };
    }

    // Luôn xử lý version mới nhất đang có trong DB; job cũ chỉ đóng vai trò đánh thức worker.
    await deps.processRelatedData(order.id, manager);
    await deps.markCalculated(order.id, order.calculationVersion, manager);

    return { status: "processed", version: order.calculationVersion };
  });
}
