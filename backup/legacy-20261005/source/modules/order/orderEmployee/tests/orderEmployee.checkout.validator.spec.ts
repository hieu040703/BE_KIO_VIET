import { OrderEmployeeCheckoutSchema } from "../orderEmployee.validator";

describe("OrderEmployeeCheckoutSchema", () => {
  it("requires a non-negative breakTime in hours", () => {
    expect(OrderEmployeeCheckoutSchema.parse({ breakTime: 1.5 })).toEqual({ breakTime: 1.5 });
    expect(OrderEmployeeCheckoutSchema.parse({ breakTime: 0 })).toEqual({ breakTime: 0 });
  });

  it("rejects a missing or negative breakTime", () => {
    expect(() => OrderEmployeeCheckoutSchema.parse({})).toThrow();
    expect(() => OrderEmployeeCheckoutSchema.parse({ breakTime: -0.5 })).toThrow();
  });
});
