import "reflect-metadata";
import { UserRoleEnum } from "@/shared/constants/constance";
import { AuthUtils } from "@/shared/utils/auth.utils";
import { UserService } from "../user.service";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe("UserService.createManager", () => {
  const createService = () => {
    const userRepository = {
      findByOption: jest.fn().mockResolvedValue(null),
      exists: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue({ id: "user-id" }),
    };
    const codeService = {
      getCode: jest.fn(),
    };

    const service = new UserService(codeService as any, userRepository as any, {} as any);

    return { service, userRepository };
  };

  beforeEach(() => {
    jest.spyOn(AuthUtils, "hashPassword").mockResolvedValue("hashed-password");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("persists EMPLOYEE when the create request explicitly selects EMPLOYEE", async () => {
    const { service, userRepository } = createService();

    await service.createManager({
      code: "USR001",
      username: "employee",
      password: "password",
      employeeId: "11111111-1111-1111-1111-111111111111",
      role: UserRoleEnum.EMPLOYEE,
    });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: UserRoleEnum.EMPLOYEE,
        password: "hashed-password",
      }),
      undefined,
    );
  });

  it("keeps MANAGER as the backward-compatible default when role is omitted", async () => {
    const { service, userRepository } = createService();

    await service.createManager({
      code: "USR002",
      username: "manager",
      password: "password",
      employeeId: "22222222-2222-2222-2222-222222222222",
    });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRoleEnum.MANAGER }),
      undefined,
    );
  });
});

describe("UserService.resetPassword", () => {
  const userId = "11111111-1111-1111-1111-111111111111";

  const createService = () => {
    const userRepository = {
      findById: jest.fn().mockResolvedValue({ id: userId }),
      update: jest.fn().mockResolvedValue({ id: userId }),
    };
    const service = new UserService({} as any, userRepository as any, {} as any);

    return { service, userRepository };
  };

  beforeEach(() => {
    jest.spyOn(AuthUtils, "hashPassword").mockResolvedValue("hashed-default-password");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("hashes 123456 and updates the selected user password", async () => {
    const { service, userRepository } = createService();

    const result = await service.resetPassword(userId);

    expect(AuthUtils.hashPassword).toHaveBeenCalledWith("123456");
    expect(userRepository.update).toHaveBeenCalledWith(userId, {
      password: "hashed-default-password",
    });
    expect(result.statusCode).toBe(200);
  });

  it("rejects reset when the user does not exist", async () => {
    const { service, userRepository } = createService();
    userRepository.findById.mockResolvedValue(null);

    await expect(service.resetPassword(userId)).rejects.toThrow("id.not_found");
    expect(AuthUtils.hashPassword).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
