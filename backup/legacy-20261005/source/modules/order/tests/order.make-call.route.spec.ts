import "reflect-metadata";

import fs from "node:fs";
import path from "node:path";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe("OrderRouter.makeCallToCustomer", () => {
  it("declares a POST route with validation, permission, and controller delegation", () => {
    const routeSource = fs.readFileSync(
      path.resolve(__dirname, "../order.route.ts"),
      "utf8",
    );

    expect(routeSource).toContain('"/:id/make-call-to-customer"');
    expect(routeSource).toContain('permissionMiddleware({ order: ["read"] })');
    expect(routeSource).toContain('zodValidate(OrderParamsSchema, "params")');
    expect(routeSource).toContain(
      "this.orderController.makeCallToCustomer.bind(this.orderController)",
    );
  });
});
