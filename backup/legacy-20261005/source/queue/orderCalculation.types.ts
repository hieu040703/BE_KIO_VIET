import type { EntityManager } from "typeorm";

export interface OrderCalculationJobData {
  orderId: string;
  version: number;
}

export interface PendingOrderCalculation {
  id: string;
  calculationVersion: number;
}

export interface OrderCalculationVersion extends PendingOrderCalculation {
  calculatedVersion: number;
}

export interface OrderCalculationProcessorDeps {
  withTransaction(
    callback: (manager: EntityManager) => Promise<unknown>,
  ): Promise<any>;
  getOrderVersion(
    orderId: string,
    manager: EntityManager,
  ): Promise<OrderCalculationVersion | null>;
  processRelatedData(orderId: string, manager: EntityManager): Promise<void>;
  markCalculated(
    orderId: string,
    version: number,
    manager: EntityManager,
  ): Promise<void>;
}
