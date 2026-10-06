import "reflect-metadata";

import {
  configureOrderCalculationTransaction,
  processOrderCalculationJob,
} from "../orderCalculation.processor";

describe("processOrderCalculationJob", () => {
  it("cấu hình timeout PostgreSQL ngắn hơn timeout nghiệp vụ của worker", async () => {
    const manager = { query: jest.fn().mockResolvedValue(undefined) } as any;

    await configureOrderCalculationTransaction(manager);

    expect(manager.query).toHaveBeenCalledWith(
      expect.stringContaining("idle_in_transaction_session_timeout"),
      ["10000", "90000", "90000"],
    );
  });

  it("chốt version hiện tại, xử lý dữ liệu và đánh dấu đúng version", async () => {
    const manager = {} as any;
    const sequence: string[] = [];
    const deps = {
      withTransaction: jest.fn(
        async (callback: (manager: any) => Promise<unknown>) =>
          callback(manager),
      ),
      getOrderVersion: jest.fn(async () => {
        sequence.push("read");
        return { id: "order-1", calculationVersion: 4, calculatedVersion: 2 };
      }),
      processRelatedData: jest.fn(async () => {
        sequence.push("process");
      }),
      markCalculated: jest.fn(async () => {
        sequence.push("mark");
      }),
    };

    const result = await processOrderCalculationJob(
      { orderId: "order-1", version: 3 },
      deps,
    );

    expect(result).toEqual({ status: "processed", version: 4 });
    expect(sequence).toEqual(["read", "process", "mark"]);
    expect(deps.processRelatedData).toHaveBeenCalledWith("order-1", manager);
    expect(deps.markCalculated).toHaveBeenCalledWith("order-1", 4, manager);
  });

  it("bỏ qua job khi version hiện tại đã được xử lý", async () => {
    const deps = {
      withTransaction: jest.fn(
        async (callback: (manager: any) => Promise<unknown>) => callback({}),
      ),
      getOrderVersion: jest.fn().mockResolvedValue({
        id: "order-1",
        calculationVersion: 5,
        calculatedVersion: 5,
      }),
      processRelatedData: jest.fn(),
      markCalculated: jest.fn(),
    };

    const result = await processOrderCalculationJob(
      { orderId: "order-1", version: 5 },
      deps,
    );

    expect(result).toEqual({ status: "skipped", version: 5 });
    expect(deps.processRelatedData).not.toHaveBeenCalled();
    expect(deps.markCalculated).not.toHaveBeenCalled();
  });
});
