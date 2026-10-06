import fs from "fs";
import path from "path";

describe("ExpenseApprovalRouter", () => {
  it("wraps every dynamic approval permission resolver with permissionMiddleware", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../expenseApproval.route.ts"), "utf8");
    const directResolverUsages = source.match(/^\s*approvalPermission\("(?:read|create|update|delete)"\),$/gm);
    const wrappedResolverUsages = source.match(
      /permissionMiddleware\(approvalPermission\("(?:read|create|update|delete)"\)\)/g,
    );

    expect(directResolverUsages).toBeNull();
    expect(wrappedResolverUsages).toHaveLength(6);
  });
});
