import { CreateOrderCommentReadStates1779500000000 } from "../../database/migrations/1779500000000-CreateOrderCommentReadStates";

describe("CreateOrderCommentReadStates migration", () => {
  it("skips existing order-user checkpoints during the legacy backfill", async () => {
    const queryRunner = {
      query: jest.fn().mockResolvedValue(undefined),
    };

    await new CreateOrderCommentReadStates1779500000000().up(queryRunner as any);

    const backfillQuery = queryRunner.query.mock.calls.find(([query]) =>
      query.includes('INSERT INTO "order_comment_read_states"'),
    )?.[0];

    expect(backfillQuery).toContain(
      'ON CONFLICT ("orderId", "userId") WHERE "deletedAt" IS NULL DO NOTHING',
    );
  });
});
