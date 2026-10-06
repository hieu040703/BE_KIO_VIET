import fs from "node:fs";
import path from "node:path";

describe("OrderRouter branch manager confirmation", () => {
  it("declares confirm and reject POST routes with order id validation", () => {
    const routeSource = fs.readFileSync(
      path.resolve(__dirname, "../order.route.ts"),
      "utf8",
    );

    expect(routeSource).toContain('"/:id/branch-manager/confirm"');
    expect(routeSource).toContain('"/:id/branch-manager/reject"');
    expect(routeSource).toContain(
      "this.orderController.confirmBranchManager.bind(this.orderController)",
    );
    expect(routeSource).toContain(
      "this.orderController.rejectBranchManager.bind(this.orderController)",
    );
    expect(routeSource).toContain('zodValidate(OrderParamsSchema, "params")');
  });
});
