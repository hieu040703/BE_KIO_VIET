import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { authMiddleware, jwtMiddleware } from "@/shared/middleware/auth.middleware";
import { clientMiddleware } from "@/shared/middleware/client.middleware";
import { ClientCustomerRouter } from "../client.customer.route";

describe("ClientCustomerRouter", () => {
  it("protects the profile update route with auth and client middleware", () => {
    const customerController = {
      getAttachmentInOrders: jest.fn(),
      getDebts: jest.fn(),
      updateProfile: jest.fn(),
    } as any;

    const router = new ClientCustomerRouter(customerController).getRouter() as any;
    const profileRoute = router.stack.find(
      (layer: any) => layer.route?.path === "/profile" && layer.route.methods?.put,
    );

    expect(profileRoute).toBeDefined();

    const handlers = profileRoute.route.stack.map((layer: any) => layer.handle);

    expect(handlers[0]).toBe(jwtMiddleware);
    expect(handlers[1]).toBe(authMiddleware);
    expect(handlers[2]).toBe(clientMiddleware);
    expect(handlers).toHaveLength(5);
  });
});
