import { CreateExpenseApprovalRequestSchema } from "../expenseApproval.validator";

describe("CreateExpenseApprovalRequestSchema", () => {
  it("preserves salaryIds in the approval payload", () => {
    const result = CreateExpenseApprovalRequestSchema.parse({
      salaryIds: ["11111111-1111-4111-8111-111111111111"],
    });

    expect(result.salaryIds).toEqual(["11111111-1111-4111-8111-111111111111"]);
  });
});
