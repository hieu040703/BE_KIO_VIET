import "reflect-metadata";
import { Response } from "express";
import { AuthService } from "../auth.service";
import { AuthUtils } from "@/shared/utils/auth.utils";
import redisHelper from "@/shared/utils/redis.helper";
import { AuthSessionTypeEnum, UserRoleEnum } from "@/shared/constants/constance";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/shared/utils/redis.helper", () => ({
  __esModule: true,
  default: {
    del: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    getJson: jest.fn(),
    setJson: jest.fn(),
  },
}));

const userId = "11111111-1111-1111-1111-111111111111";
const createResponse = () =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }) as unknown as Response;

const createService = (role: UserRoleEnum = UserRoleEnum.MANAGER) => {
  const sessions = [
    { id: "web-old", userId, refreshToken: "web-refresh-old", sessionType: AuthSessionTypeEnum.WEB },
    { id: "mobile-old", userId, refreshToken: "mobile-refresh-old", sessionType: AuthSessionTypeEnum.MOBILE },
  ];
  const user = {
    id: userId,
    username: "manager",
    password: "password-hash",
    role,
    employeeId: null,
    customerId: null,
    isActive: true,
  };
  const lockedUserRepository = {
    findOne: jest.fn().mockResolvedValue({ id: userId }),
  };
  const transactionManager = {
    getRepository: jest.fn().mockReturnValue(lockedUserRepository),
  };
  const tokenRepository = {
    findRefreshTokensByUserId: jest.fn((_id, _manager, sessionType) =>
      sessions.filter((session) => session.sessionType === sessionType),
    ),
    deleteRefreshTokensByUserId: jest.fn((_id, _manager, sessionType) => {
      const before = sessions.length;
      for (let index = sessions.length - 1; index >= 0; index -= 1) {
        if (sessions[index].sessionType === sessionType) {
          sessions.splice(index, 1);
        }
      }
      return before - sessions.length;
    }),
    create: jest.fn(),
  };
  const authRepository = {
    findByUsername: jest.fn().mockResolvedValue(user),
    withTransaction: jest.fn(async (callback) => callback(transactionManager)),
    updateRefreshToken: jest.fn((_id, refreshToken, sessionType) => {
      sessions.push({ id: "web-new", userId, refreshToken, sessionType });
    }),
  };

  const service = new AuthService(
    authRepository as any,
    {} as any,
    tokenRepository as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );

  return { service, authRepository, tokenRepository, transactionManager, sessions, user };
};

describe("AuthService session management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(redisHelper, "incr").mockResolvedValue(1);
    jest.spyOn(redisHelper, "expire").mockResolvedValue(true);
    jest.spyOn(redisHelper, "del").mockResolvedValue(true);
    jest.spyOn(redisHelper, "set").mockResolvedValue(true);
    jest.spyOn(AuthUtils, "comparePassword").mockResolvedValue(true);
    jest.spyOn(AuthUtils, "generateTokens").mockReturnValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
    jest.spyOn(AuthUtils, "setTokenCookies").mockImplementation(() => undefined);
    jest.spyOn(AuthUtils, "getRefreshTokenCacheKey").mockImplementation((id, token) => `cache:${id}:${token}`);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("replaces only the web session and keeps the mobile session active", async () => {
    const { service, authRepository, tokenRepository, transactionManager, sessions } = createService();

    await service.login(
      { username: "manager", password: "password", clientType: AuthSessionTypeEnum.WEB },
      createResponse(),
      { headers: {} } as any,
    );

    expect(transactionManager.getRepository).toHaveBeenCalled();
    expect(tokenRepository.findRefreshTokensByUserId).toHaveBeenCalledWith(
      userId,
      transactionManager,
      AuthSessionTypeEnum.WEB,
    );
    expect(tokenRepository.deleteRefreshTokensByUserId).toHaveBeenCalledWith(
      userId,
      transactionManager,
      AuthSessionTypeEnum.WEB,
    );
    expect(authRepository.updateRefreshToken).toHaveBeenCalledWith(
      userId,
      "new-refresh-token",
      AuthSessionTypeEnum.WEB,
      transactionManager,
    );
    expect(sessions).toEqual([
      { id: "mobile-old", userId, refreshToken: "mobile-refresh-old", sessionType: AuthSessionTypeEnum.MOBILE },
      { id: "web-new", userId, refreshToken: "new-refresh-token", sessionType: AuthSessionTypeEnum.WEB },
    ]);
    expect(redisHelper.del).toHaveBeenCalledWith(`cache:${userId}:web-refresh-old`);
    expect(redisHelper.del).not.toHaveBeenCalledWith(`cache:${userId}:mobile-refresh-old`);
  });

  it.each([UserRoleEnum.SUPPORT, UserRoleEnum.EMPLOYEE, UserRoleEnum.USER])(
    "rejects %s from web login with HTTP 403",
    async (role) => {
      const { service } = createService(role);

      await expect(
        service.login(
          { username: "manager", password: "password", clientType: AuthSessionTypeEnum.WEB },
          createResponse(),
          { headers: {} } as any,
        ),
      ).rejects.toEqual(expect.objectContaining({ statusCode: 403 }));
    },
  );
  it("uses x-platform as the web-session fallback", async () => {
    const { service } = createService(UserRoleEnum.USER);

    await expect(
      service.login(
        { username: "manager", password: "password" },
        createResponse(),
        { headers: { "x-platform": AuthSessionTypeEnum.WEB } } as any,
      ),
    ).rejects.toEqual(expect.objectContaining({ statusCode: 403 }));
  });

  it.each([UserRoleEnum.SUPPORT, UserRoleEnum.EMPLOYEE, UserRoleEnum.USER])(
    "allows %s to login on mobile",
    async (role) => {
      const { service, sessions } = createService(role);

      await service.login(
        { username: "manager", password: "password", clientType: AuthSessionTypeEnum.MOBILE },
        createResponse(),
        { headers: {} } as any,
      );

      expect(sessions).toEqual([
        { id: "web-old", userId, refreshToken: "web-refresh-old", sessionType: AuthSessionTypeEnum.WEB },
        { id: "web-new", userId, refreshToken: "new-refresh-token", sessionType: AuthSessionTypeEnum.MOBILE },
      ]);
    },
  );
});
