import { CreateServiceSchema, UpdateServiceSchema } from "../service.validator";

describe("service.validator service price fields", () => {
  it("preserves required unit, quantity, and excessUnitPrice in create payloads", () => {
    const parsed = CreateServiceSchema.parse({
      name: "Boc xep theo ca",
      type: "BOC_XEP_THEO_CA",
      prices: [
        {
          category: "Nhan cong",
          unit: "gio",
          quantity: 8,
          price: 500000,
          excessUnitPrice: 70000,
          note: "Ca ngay",
        },
      ],
    });

    expect(parsed.prices?.[0]).toMatchObject({
      category: "Nhan cong",
      unit: "gio",
      quantity: 8,
      price: 500000,
      excessUnitPrice: 70000,
      note: "Ca ngay",
    });
  });

  it("preserves required unit, quantity, and excessUnitPrice in update payloads", () => {
    const parsed = UpdateServiceSchema.parse({
      prices: [
        {
          category: "Van chuyen",
          unit: "km",
          quantity: 10,
          price: 1200000,
          excessUnitPrice: 15000,
        },
      ],
    });

    expect(parsed.prices?.[0]).toMatchObject({
      category: "Van chuyen",
      unit: "km",
      quantity: 10,
      price: 1200000,
      excessUnitPrice: 15000,
    });
  });
});
