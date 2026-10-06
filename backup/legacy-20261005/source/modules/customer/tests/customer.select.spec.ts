import { CustomerSelectBasic } from "../customer.select";

describe("CustomerSelectBasic", () => {
  it("includes customName and gender for customer-facing responses", () => {
    expect(CustomerSelectBasic.customName).toBe(true);
    expect(CustomerSelectBasic.gender).toBe(true);
  });
});
