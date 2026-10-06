import "reflect-metadata";

import { AdminCallHistoryRepository } from "../admin.callHistory.repository";
import { CallHistoryQuerySchema } from "../callHistory.validator";
import { ClientCallHistoryRepository } from "../client.callHistory.repository";

const orderId = "11111111-1111-4111-8111-111111111111";

describe("CallHistory order filter", () => {
  it.each([AdminCallHistoryRepository, ClientCallHistoryRepository])(
    "adds orderId constraint to %p",
    async (RepositoryClass) => {
      const queryBuilder = { andWhere: jest.fn() };
      const repository = Object.create(RepositoryClass.prototype);

      await repository.extendQueryBuilder(queryBuilder, { orderId } as any);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith("entity.orderId = :orderId", { orderId });
    },
  );

  it("accepts orderId in the list query schema", () => {
    expect(CallHistoryQuerySchema.parse({ orderId }).orderId).toBe(orderId);
  });
});
