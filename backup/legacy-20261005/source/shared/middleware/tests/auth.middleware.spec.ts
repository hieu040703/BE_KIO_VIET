import "reflect-metadata";
import { Response } from "express";
import { AuthUtils } from "@/shared/utils/auth.utils";
import redisHelper from "@/shared/utils/redis.helper";
import { TokenRepository } from "@/modules/token/token.repository";
import { authMiddleware, jwtMiddleware } from "../auth.middleware";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/modules/token/token.repository", () => ({
  TokenRepository: jest.fn().mockImplementation(() => ({
    findByOption: jest.fn(),
  })),
}));

jest.mock("@/shared/utils/redis.helper", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

const mockedRedisHelper = redisHelper as jest.Mocked<typeof redisHelper>;
const mockedTokenRepository = TokenRepository as jest.MockedClass<typeof TokenRepository>;
const mockFindByOption = mockedTokenRepository.mock.results[0].value.findByOption as jest.Mock;

const payload = {
  userId: "11111111-1111-1111-1111-111111111111",
  username: "tester",
  role: "USER",
  employeeId: null,
  customerId: "22222222-2222-2222-2222-222222222222",
};

const createResponse = () =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }) as unknown as Response;

describe("auth middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("jwtMiddleware sets req.user from a valid access token", () => {
    const tokens = AuthUtils.generateTokens(payload);
    const req = {
      cookies: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    } as any;
    const res = createResponse();
    const next = jest.fn();

    jwtMiddleware(req, res, next);

    expect(req.user.userId).toBe(payload.userId);
    expect(next).toHaveBeenCalledWith();
  });

  it("authMiddleware allows cached refresh token without querying database", async () => {
    const tokens = AuthUtils.generateTokens(payload);
    const req = {
      user: payload,
      cookies: {
        refreshToken: tokens.refreshToken,
      },
    } as any;
    const res = createResponse();
    const next = jest.fn();

    mockedRedisHelper.get.mockResolvedValue("1");

    await authMiddleware(req, res, next);

    expect(mockFindByOption).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it("authMiddleware clears token cookies when refresh token is missing from database", async () => {
    const tokens = AuthUtils.generateTokens(payload);
    const req = {
      user: payload,
      cookies: {
        refreshToken: tokens.refreshToken,
      },
    } as any;
    const res = createResponse();
    const next = jest.fn();

    mockedRedisHelper.get.mockResolvedValue(null);
    mockFindByOption.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith("accessToken");
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});
