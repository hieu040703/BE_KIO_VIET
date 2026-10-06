import { container } from "@/modules/container";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { ORDER_TYPES } from "@/modules/order/order.types";
import { CalculateOrderData } from "@/modules/order/handles/calculate.order";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { Order } from "@/database/models/Order";
import type { Job } from "bull";
import type { JobProcessor } from "../base/BaseQueue";
import type { OrderCalculationJobData } from "../orderCalculation.types";
import {
  configureOrderCalculationTransaction,
  processOrderCalculationJob,
} from "./orderCalculation.processor";

export class OrderCalculationJobProcessor implements JobProcessor<OrderCalculationJobData> {
  async process(job: Job<OrderCalculationJobData>) {
    const transactionManager = container.get<TransactionManager>(
      COMMON_TYPES.TransactionManager,
    );
    const calculateOrderData = container.get<CalculateOrderData>(
      ORDER_TYPES.CalculateOrderData,
    );

    return processOrderCalculationJob(job.data, {
      withTransaction: (callback) =>
        transactionManager.withTransaction(async (queryRunner) => {
          await configureOrderCalculationTransaction(queryRunner.manager);
          return callback(queryRunner.manager);
        }),
      getOrderVersion: async (orderId, manager) =>
        manager
          .getRepository(Order)
          .createQueryBuilder("order")
          .select([
            "order.id",
            "order.calculationVersion",
            "order.calculatedVersion",
          ])
          .where("order.id = :orderId", { orderId })
          .andWhere("order.deletedAt IS NULL")
          .getOne(),
      processRelatedData: (orderId, manager) =>
        calculateOrderData.processRelatedData(orderId, manager),
      markCalculated: async (orderId, version, manager) => {
        await manager
          .getRepository(Order)
          .createQueryBuilder()
          .update(Order)
          .set({
            calculatedVersion: () =>
              'GREATEST("calculatedVersion", :calculatedVersion)',
          })
          .where("id = :orderId", { orderId })
          .setParameter("calculatedVersion", version)
          .execute();
      },
    });
  }
}
