import "reflect-metadata";
import { AuthService } from "../auth.service";
import { AuthUtils } from "@/shared/utils/auth.utils";
import redisHelper from "@/shared/utils/redis.helper";
import { UserRoleEnum } from "@/shared/constants/constance";

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

describe("AuthService.changePassword", () => {
  const userId = "11111111-1111-1111-1111-111111111111";
  const user = {
    id: userId,
    email: "user@example.com",
    username: "user",
    password: "old-hash",
    role: UserRoleEnum.USER,
  };

  const createService = () => {
    const authRepository = {};
    const userRepository = {
      findByOption: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockResolvedValue({ ...user, password: "new-hash" }),
    };
    const tokenRepository = {
      findRefreshTokensByUserId: jest.fn().mockResolvedValue([
        { id: "token-1", userId, refreshToken: "refresh-token-1" },
        { id: "token-2", userId, refreshToken: "refresh-token-2" },
      ]),
      deleteRefreshTokensByUserId: jest.fn().mockResolvedValue(2),
    };

    const service = new AuthService(
      authRepository as any,
      userRepository as any,
      tokenRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    return { service, userRepository, tokenRepository };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthUtils, "comparePassword").mockResolvedValue(true);
    jest.spyOn(AuthUtils, "hashPassword").mockResolvedValue("new-hash");
    jest.spyOn(AuthUtils, "getRefreshTokenCacheKey").mockImplementation((userIdArg, refreshToken) => {
      return `cache:${userIdArg}:${refreshToken}`;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("revokes all refresh-token sessions after changing password successfully", async () => {
    const { service, userRepository, tokenRepository } = createService();

    const result = await service.changePassword(userId, {
      oldPassword: "old-password",
      newPassword: "new-password",
      confirmNewPassword: "new-password",
    });

    expect(result.statusCode).toBe(200);
    expect(userRepository.update).toHaveBeenCalledWith(userId, { password: "new-hash" });
    expect(tokenRepository.findRefreshTokensByUserId).toHaveBeenCalledWith(userId, undefined);
    expect(tokenRepository.deleteRefreshTokensByUserId).toHaveBeenCalledWith(userId, undefined);
    expect(redisHelper.del).toHaveBeenCalledWith(`cache:${userId}:refresh-token-1`);
    expect(redisHelper.del).toHaveBeenCalledWith(`cache:${userId}:refresh-token-2`);
  });

  it("revokes all refresh-token sessions after resetting forgotten password successfully", async () => {
    const { service, userRepository, tokenRepository } = createService();
    (redisHelper.getJson as jest.Mock).mockResolvedValue({
      verifyKey: "verify-key",
      verifyCode: "123456",
    });

    const result = await service.forgetPassword({
      email: user.email,
      verifyKey: "verify-key",
      verifyCode: "123456",
      newPassword: "new-password",
    });

    expect(result.statusCode).toBe(200);
    expect(userRepository.update).toHaveBeenCalledWith(userId, { password: "new-hash" });
    expect(tokenRepository.findRefreshTokensByUserId).toHaveBeenCalledWith(userId, undefined);
    expect(tokenRepository.deleteRefreshTokensByUserId).toHaveBeenCalledWith(userId, undefined);
    expect(redisHelper.del).toHaveBeenCalledWith(`cache:${userId}:refresh-token-1`);
    expect(redisHelper.del).toHaveBeenCalledWith(`cache:${userId}:refresh-token-2`);
  });
});
