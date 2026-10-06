import "reflect-metadata";

import { BaseRepository } from "@/shared/base/BaseRepository";
import { OrderRepository } from "../order.repository";

describe("OrderRepository delete", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deletes call navigations before deleting the order", async () => {
    const orderId = "order-1";
    const events: string[] = [];
    const query = jest.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('"call_navigations"')) {
        events.push("call-navigations-cleanup");
      }
    });
    const manager = { query } as any;
    const repository = Object.create(OrderRepository.prototype) as any;

    repository.getRepository = jest.fn().mockReturnValue({ manager });
    const baseDelete = jest
      .spyOn(BaseRepository.prototype, "delete")
      .mockImplementation(async () => {
        events.push("order-delete");
        return true;
      });

    await repository.delete(orderId, manager);

    expect(repository.getRepository).toHaveBeenCalledWith(manager);
    expect(query).toHaveBeenCalledWith(
      `DELETE FROM "call_navigations" WHERE "orderId" = $1`,
      [orderId],
    );
    expect(events).toEqual(["call-navigations-cleanup", "order-delete"]);
    expect(baseDelete).toHaveBeenCalledWith(orderId, manager, undefined);
  });
});
