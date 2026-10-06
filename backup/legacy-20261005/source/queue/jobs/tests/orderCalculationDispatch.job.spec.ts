jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import {
  FAILED_JOB_REQUEUE_COOLDOWN_MS,
  dispatchPendingOrderCalculations,
  findPendingOrderCalculations,
} from "../orderCalculationDispatch.job";

describe("dispatchPendingOrderCalculations", () => {
  it("dùng alias PostgreSQL không trùng từ khóa ORDER khi quét dữ liệu chờ", async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    await findPendingOrderCalculations(repository as any);

    expect(repository.createQueryBuilder).toHaveBeenCalledWith("pending_order");
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      "pending_order.calculationVersion > pending_order.calculatedVersion",
    );
  });

  it("không requeue ngay job failed cùng version nhưng vẫn thay job cũ hoặc đã hết cooldown", async () => {
    const now = Date.parse("2026-08-21T04:00:00.000Z");
    const failedJob = {
      data: { orderId: "order-2", version: 4 },
      getState: jest.fn().mockResolvedValue("failed"),
      remove: jest.fn(),
      finishedOn: now,
    };
    const activeJob = {
      data: { orderId: "order-3", version: 1 },
      getState: jest.fn().mockResolvedValue("active"),
      remove: jest.fn(),
    };
    const staleFailedJob = {
      data: { orderId: "order-4", version: 3 },
      getState: jest.fn().mockResolvedValue("failed"),
      remove: jest.fn(),
      finishedOn: now,
    };
    const cooledDownFailedJob = {
      data: { orderId: "order-5", version: 6 },
      getState: jest.fn().mockResolvedValue("failed"),
      remove: jest.fn(),
      finishedOn: now - FAILED_JOB_REQUEUE_COOLDOWN_MS,
    };
    const deps = {
      findPending: jest.fn().mockResolvedValue([
        { id: "order-1", calculationVersion: 2 },
        { id: "order-2", calculationVersion: 4 },
        { id: "order-3", calculationVersion: 2 },
        { id: "order-4", calculationVersion: 5 },
        { id: "order-5", calculationVersion: 6 },
      ]),
      getJob: jest.fn(async (jobId: string) => {
        if (jobId === "order-calculation:order-1") return null;
        if (jobId === "order-calculation:order-2") return failedJob;
        if (jobId === "order-calculation:order-3") return activeJob;
        if (jobId === "order-calculation:order-4") return staleFailedJob;
        return cooledDownFailedJob;
      }),
      addJob: jest.fn(),
    };

    const result = await dispatchPendingOrderCalculations(deps, now);

    expect(result).toEqual({ pending: 5, enqueued: 3, skipped: 2 });
    expect(failedJob.remove).not.toHaveBeenCalled();
    expect(activeJob.remove).not.toHaveBeenCalled();
    expect(staleFailedJob.remove).toHaveBeenCalledTimes(1);
    expect(cooledDownFailedJob.remove).toHaveBeenCalledTimes(1);
    expect(deps.addJob).toHaveBeenNthCalledWith(
      1,
      { orderId: "order-1", version: 2 },
      expect.objectContaining({
        jobId: "order-calculation:order-1",
        attempts: 3,
        timeout: 0,
      }),
    );
    expect(deps.addJob).toHaveBeenNthCalledWith(
      2,
      { orderId: "order-4", version: 5 },
      expect.objectContaining({ jobId: "order-calculation:order-4" }),
    );
    expect(deps.addJob).toHaveBeenNthCalledWith(
      3,
      { orderId: "order-5", version: 6 },
      expect.objectContaining({ jobId: "order-calculation:order-5" }),
    );
    expect(deps.addJob).toHaveBeenCalledTimes(3);
  });
});
