import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { UserRepository } from "./user.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { User } from "@/database/models/User";
import { UserRelations, UserSelectFull } from "./user.select";
import { CreateUserDto, UpdateManagerDto, UserActionDto } from "./user.validator";
import { BadRequestError, ConflictError } from "@/shared/types/errors";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { ErrorsMessages } from "@/shared/constants/errors";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { DeepPartial, EntityManager } from "typeorm";
import { USER_TYPES } from "./user.types";
import { COMMON_TYPES } from "../common/common.types";
import { UserRoleEnum } from "@/shared/constants/constance";
import { moveFile } from "@/shared/utils/moveFile";
import { config } from "@/shared/config/env";
import { AuthUtils } from "@/shared/utils/auth.utils";
import { CodeService } from "../common/code.service";
import { Request } from "express";

const DEFAULT_USER_PASSWORD = "123456";

@injectable()
export class UserService extends BaseService<User> {
  protected relations = UserRelations;
  protected selectedFields = UserSelectFull;
  constructor(
    @inject(COMMON_TYPES.CodeService) private codeService: CodeService,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(userRepository);
  }

  async validateBeforeCreate(data: CreateUserDto, req?: Request, manager?: IEntityManager): Promise<void> {
    // Add your validation logic here
    if (!data.code) {
      const code = await this.codeService.getCode("User", manager);
      data.code = code.data.code || "";
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.userRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã hợp đồng đã tồn tại");
      }
    }
  }

  async createManager(data: CreateUserDto, manager?: EntityManager): Promise<ApiResponse<User>> {
    //? validate email unique
    const existingUser = await this.userRepository.findByOption(
      {
        where: {
          username: data.username,
        },
      },
      manager,
    );

    if (existingUser) {
      throw new ConflictError(`email.${ErrorsMessages.already_exists}`);
    }

    if (data.employeeId) {
      //? check employeeId unique
      const existingUserByEmployee = await this.userRepository.findByOption(
        {
          where: {
            employeeId: data.employeeId,
          },
        },
        manager,
      );

      if (existingUserByEmployee) {
        throw new ConflictError("Nhân sự này đã có tài khoản");
      }
    }

    if (data.code) {
      const codeExist = await this.userRepository.exists({
        code: data.code,
      });

      if (codeExist) {
        throw new ConflictError(`code.${ErrorsMessages.already_exists}`);
      }
    } else {
      const code = await this.codeService.getCode("User", manager);
      data.code = code.data.code || "";
    }

    const passwordHash = await AuthUtils.hashPassword(data.password);

    const role = data.role ?? UserRoleEnum.MANAGER;

    if (data.avatar) {
      const newPath = moveFile([data.avatar], config.AVATAR_DIR);
      data.avatar = newPath[0];
    }

    const user = await this.userRepository.create(
      {
        ...data,
        username: data.username || data.email,
        role,
        password: passwordHash,
        permissionGroupId: data.permissionGroupId,
      },
      manager,
    );
    return ApiResponseHandler.createSuccess("OK", user);
  }

  async updateManager(id: string, data: UpdateManagerDto, manager?: EntityManager): Promise<ApiResponse<User>> {
    //? validate user exists
    console.log("data", data);
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new BadRequestError(`id.${ErrorsMessages.not_found}`);
    }

    if (data.avatar) {
      const newPath = moveFile([data.avatar], config.AVATAR_DIR);
      data.avatar = newPath[0];
    }

    if (data.employeeId && data.employeeId !== user.employeeId) {
      //? check employeeId unique
      const existingUser = await this.userRepository.findByOption(
        {
          where: {
            employeeId: data.employeeId,
          },
        },
        manager,
      );

      if (existingUser) {
        throw new ConflictError("Nhân sự này đã có tài khoản");
      }
    }

    //? update user
    const updatedUser = await this.userRepository.update(user.id, data, manager);
    return ApiResponseHandler.updateSuccess("OK", updatedUser);
  }

  async activeUser(id: string, data: UserActionDto): Promise<ApiResponse<User>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new BadRequestError(`id.${ErrorsMessages.not_found}`);
    }

    if (data.action === "activate") {
      if (user.isActive) {
        throw new BadRequestError(`id.${ErrorsMessages.already_verified}`);
      }
      user.isActive = true;
    } else if (data.action === "deactivate") {
      if (!user.isActive) {
        throw new BadRequestError(`id.${ErrorsMessages.already_inactive}`);
      }
      user.isActive = false;
    }

    await this.userRepository.update(user.id, user);

    return ApiResponseHandler.updateSuccess("OK", user);
  }

  async resetPassword(id: string): Promise<ApiResponse<User>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new BadRequestError(`id.${ErrorsMessages.not_found}`);
    }

    const password = await AuthUtils.hashPassword(DEFAULT_USER_PASSWORD);
    const updatedUser = await this.userRepository.update(user.id, { password });

    return ApiResponseHandler.updateSuccess("OK", updatedUser || user);
  }

  async hardDeleteUser(id: string): Promise<ApiResponse<boolean>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new BadRequestError(`id.${ErrorsMessages.not_found}`);
    }

    await this.userRepository.delete(user.id);
    return ApiResponseHandler.deleteSuccess("OK", true);
  }
}
