import { FinanceQuerySchema } from "../finance.validator";

describe("FinanceQuerySchema", () => {
  it("accepts SALARY as an explicit finance filter", () => {
    const result = FinanceQuerySchema.parse({ type: "SALARY" });

    expect(result.type).toBe("SALARY");
  });

  it("parses the salary exclusion query flag", () => {
    expect(FinanceQuerySchema.parse({ excludeSalary: "true" }).excludeSalary).toBe(true);
    expect(FinanceQuerySchema.parse({ excludeSalary: "false" }).excludeSalary).toBe(false);
  });
});
