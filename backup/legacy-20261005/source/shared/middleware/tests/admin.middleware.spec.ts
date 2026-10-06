import "reflect-metadata";
import { Request, Response } from "express";
import { adminMiddleware } from "../admin.middleware";

describe("adminMiddleware", () => {
  const response = {} as Response;

  it.each(["SUPPORT", "EMPLOYEE", "USER"])("rejects %s with HTTP 403", async (role) => {
    const next = jest.fn();

    await adminMiddleware(
      { user: { userId: "user-id", username: "user", role } } as Request & { user: any },
      response,
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it.each(["ADMIN", "MANAGER"])("allows %s", async (role) => {
    const next = jest.fn();

    await adminMiddleware(
      { user: { userId: "user-id", username: "user", role } } as Request & { user: any },
      response,
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });
});
