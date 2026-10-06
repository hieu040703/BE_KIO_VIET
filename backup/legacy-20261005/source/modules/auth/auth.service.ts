import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { AuthRepository } from "./auth.repository";
import { User } from "@/database/models/User";
import {
  RegisterDto,
  LoginDto,
  VerifyPhoneDto,
  VerifyEmailDto,
  ForgetPasswordDto,
  ChangePasswordDto,
  UpdateInformationDto,
  UpdateSettingsDto,
  RegisterPhoneDto,
} from "./auth.validator";
import { AuthUtils } from "@/shared/utils/auth.utils";
import { ApiResponse, AuthTokens, JwtPayload } from "@/shared/types/interfaces";
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError, ForbiddenError } from "@/shared/types/errors";
import { AUTH_TYPES } from "./auth.types";
import { USER_TYPES } from "../user/user.types";
import { Request, Response } from "express";
import { DeepPartial, EntityManager } from "typeorm";
import { ErrorsMessages } from "@/shared/constants/errors";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { Utils } from "@/shared/utils/utils";
import { UserRepository } from "../user/user.repository";
import { EmailUtils } from "@/shared/utils/email/sendMail.utils";
import redisHelper from "@/shared/utils/redis.helper";
import { AuthSessionTypeEnum, UserRoleEnum } from "@/shared/constants/constance";
import { TOKEN_TYPES } from "../token/token.types";
import { ISetting } from "../common/common.validator";
import { config } from "@/shared/config/env";
import { TokenRepository } from "../token/token.repository";
import { EmployeeSelectBasic } from "../employee/employee.select";
import { UserRelations, UserSelectBasic } from "../user/user.select";
import { PermissionGroupSelectBasic } from "../permissionGroup/permissionGroup.select";
import { CustomerSelectBasic } from "../customer/customer.select";
import { COMMON_TYPES } from "../common/common.types";
import { CommonRepository } from "../common/common.repository";
import { CUSTOMER_TYPES } from "../customer/customer.types";
import { CustomerRepository } from "../customer/customer.repository";
import { CreateCustomerDto } from "../customer/customer.validator";
import { ORDER_TYPES } from "../order/order.types";
import { OrderRepository } from "../order/order.repository";
import { REWARD_POINT_TYPES } from "../rewardPoint/rewardPoint.types";
import { AdminRewardPointRepository } from "../rewardPoint/admin.rewardPoint.repository";
import { DEBT_TYPES } from "../accountant/debt/debt.types";
import { DebtRepository } from "../accountant/debt/debt.repository";
import { ClientOrderRepository } from "../order/client.order.repository";
import { ClientRewardPointRepository } from "../rewardPoint/client.rewardPoint.repository";

@injectable()
export class AuthService extends BaseService<User> {
  protected relations = UserRelations;
  protected selectedFields = UserSelectBasic;
  constructor(
    @inject(AUTH_TYPES.AuthRepository) private authRepository: AuthRepository,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TOKEN_TYPES.TokenRepository) private tokenRepository: TokenRepository,
    @inject(COMMON_TYPES.CommonRepository) private commonRepository: CommonRepository,
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
    @inject(ORDER_TYPES.ClientOrderRepository) private orderRepository: ClientOrderRepository,
    @inject(REWARD_POINT_TYPES.ClientRewardPointRepository)
    private clientRewardPointRepository: ClientRewardPointRepository,
    @inject(DEBT_TYPES.DebtRepository) private debtRepository: DebtRepository,
  ) {
    super(authRepository);
  }

  private async cacheRefreshToken(userId: string, refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const tokenTtl = AuthUtils.getTokenRemainingTtlSeconds(refreshToken);
    const cacheTtl = Math.min(tokenTtl || 5 * 60, 5 * 60);
    if (cacheTtl > 0) {
      await redisHelper.set(AuthUtils.getRefreshTokenCacheKey(userId, refreshToken), "1", cacheTtl);
    }
  }

  private async revokeRefreshTokensByUserId(userId: string, manager?: EntityManager): Promise<void> {
    const refreshTokens = await this.tokenRepository.findRefreshTokensByUserId(userId, manager);

    await this.tokenRepository.deleteRefreshTokensByUserId(userId, manager);

    await Promise.all(
      refreshTokens
        .map((token) => token.refreshToken)
        .filter((refreshToken): refreshToken is string => !!refreshToken)
        .map((refreshToken) => redisHelper.del(AuthUtils.getRefreshTokenCacheKey(userId, refreshToken))),
    );
  }

  private async replaceRefreshTokenForSession(
    userId: string,
    refreshToken: string,
    sessionType: AuthSessionTypeEnum,
  ): Promise<void> {
    const revokedTokens = await this.authRepository.withTransaction(async (manager) => {
      const lockedUser = await manager.getRepository(User).findOne({
        where: { id: userId },
        select: { id: true },
        lock: { mode: "pessimistic_write" },
      });

      if (!lockedUser) {
        throw new NotFoundError("Người dùng không tồn tại");
      }

      const refreshTokens = await this.tokenRepository.findRefreshTokensByUserId(userId, manager, sessionType);
      await this.tokenRepository.deleteRefreshTokensByUserId(userId, manager, sessionType);
      await this.authRepository.updateRefreshToken(userId, refreshToken, sessionType, manager);

      return refreshTokens;
    });

    await Promise.all(
      revokedTokens
        .map((token) => token.refreshToken)
        .filter((token): token is string => !!token)
        .map((token) => redisHelper.del(AuthUtils.getRefreshTokenCacheKey(userId, token))),
    );

    await this.cacheRefreshToken(userId, refreshToken);
  }

  async checkPhone(data: VerifyPhoneDto): Promise<ApiResponse<User>> {
    // Check if user exists by phone number
    const user = await this.authRepository.findByPhone(data.phone);
    const verifyKey = Utils.generateRandomString(10);

    if (data.isForgotPassword) {
      if (user) {
        // If user exists, return success response with user data
        return ApiResponseHandler.getSuccess("OK", verifyKey);
      } else {
        // If user does not exist, return error response
        return ApiResponseHandler.error(404, `phone.${ErrorsMessages.not_found}`);
      }
    } else {
      if (!user) {
        return ApiResponseHandler.getSuccess("OK", verifyKey);
      }
      return ApiResponseHandler.error(409, `phone.${ErrorsMessages.already_exists}`);
    }
  }

  async checkEmail(data: VerifyEmailDto): Promise<ApiResponse<User>> {
    // Check if user exists by email
    const user = await this.authRepository.findByEmail(data.email);
    const verifyKey = Utils.generateRandomString(10);

    if (data.isForgotPassword) {
      if (user) {
        // If user exists, return success response with user data
        return ApiResponseHandler.getSuccess("OK", verifyKey);
      } else {
        // If user does not exist, return error response
        return ApiResponseHandler.error(404, `email.${ErrorsMessages.not_found}`);
      }
    } else {
      if (!user) {
        return ApiResponseHandler.getSuccess("OK", verifyKey);
      }
      return ApiResponseHandler.error(409, `email.${ErrorsMessages.already_exists}`);
    }
  }

  async verifyEmail(data: VerifyEmailDto): Promise<ApiResponse<User>> {
    // Check if user exists by email
    const user = await this.authRepository.findByEmail(data.email);
    const verifyKey = Utils.generateRandomString(10);
    const code = Utils.generateRandomString(6);

    if (data.isForgotPassword) {
      if (user) {
        // create to redis email with verify key and code with ttl 5 minutes
        await redisHelper.setJson(data.email, { verifyKey: verifyKey, verifyCode: code }, 5 * 60);

        // sent email with verify code
        await EmailUtils.sendEmail({
          to: data.email,
          subject: "Verify your email",
          content: `Your verification code is:  ${code}`,
        });

        // If user exists, return success response with user data
        return ApiResponseHandler.getSuccess("OK", {
          id: user.id,
          email: user.email,
          verifyKey: verifyKey,
          verifyCode: code,
        });
      } else {
        // If user does not exist, return error response
        return ApiResponseHandler.error(404, `email.${ErrorsMessages.not_found}`);
      }
    } else {
      if (!user) {
        // create to redis email with verify key and code with ttl 5 minutes
        await redisHelper.setJson(data.email, { verifyKey: verifyKey, verifyCode: code }, 5 * 60);

        // sent email with verify code
        await EmailUtils.sendEmail({
          to: data.email,
          subject: "Verify your email",
          content: `Your verification code is:  ${code}`,
        });

        return ApiResponseHandler.getSuccess("OK", {
          email: data.email,
          verifyKey: verifyKey,
          verifyCode: code,
        });
      }
      return ApiResponseHandler.error(409, `email.${ErrorsMessages.already_exists}`);
    }
  }

  async verifyPhone(data: VerifyPhoneDto, res: Response): Promise<ApiResponse<User>> {
    // Check if user exists by phone number
    const user = await this.authRepository.findByPhone(data.phone);
    const verifyKey = Utils.generateRandomString(30);

    console.log("user", user);

    if (data.isForgotPassword) {
      if (user) {
        // create to redis phone with verify key and code with ttl 5 minutes
        await redisHelper.set(data.phone, verifyKey, 5 * 60);

        // If user exists, return success response with user data
        return ApiResponseHandler.getSuccess("OK", {
          id: user.id,
          phone: user.phone,
          verifyKey: verifyKey,
        });
      } else {
        // If user does not exist, return error response
        return ApiResponseHandler.error(404, `phone.${ErrorsMessages.not_found}`);
      }
    } else {
      if (!user) {
        // create to redis phone with verify key and code with ttl 5 minutes
        await redisHelper.set(data.phone, verifyKey, 5 * 60);

        // set verifyKey vào cookies với tên là verifyKey và thời hạn 5 phút
        res.cookie("verifyKey", verifyKey, { maxAge: 5 * 60 * 1000, httpOnly: true });

        return ApiResponseHandler.getSuccess("OK", {
          phone: data.phone,
          verifyKey: verifyKey,
        });
      }
      return ApiResponseHandler.error(409, "Số điện thoại đã tồn tại");
    }
  }

  async registerPhone(data: RegisterPhoneDto, req: Request, res: Response): Promise<ApiResponse<any>> {
    // Rate limiting check for phone registration (5 attempts per hour)
    const rateLimitKey = `rate_limit:phone:${data.phone}`;
    const requestCount = await redisHelper.incr(rateLimitKey);

    if (requestCount > 5) {
      throw new BadRequestError("Quá nhiều yêu cầu, vui lòng thử lại sau");
    }

    // get verifyKey from cookies
    const verifyKey = req?.cookies["verifyKey"];

    if (!verifyKey) {
      throw new BadRequestError("Thất bại, vui lòng thử lại");
    }

    // get verifyKey and verifyCode from redis
    const redisData: string | null = await redisHelper.get(data.phone);

    // Check if verifyKey is valid
    if (!redisData || redisData !== verifyKey) {
      throw new UnauthorizedError("Thất bại, vui lòng thử lại");
    }

    const userExisting = await this.authRepository.findByPhone(data.phone);
    if (userExisting) {
      throw new ConflictError(`Số điện thoại đã tồn tại`);
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(data.password);
    const userCode = (await this.commonRepository.getCodeByUser()) || Utils.generateRandomString(10);
    const customerCode = (await this.commonRepository.getCodeByCustomer()) || Utils.generateRandomString(10);

    //$ create customer first
    const dataCreateCustomer: CreateCustomerDto = {
      code: customerCode,
      name: data.name || data.phone,
      phone: data.phone,
      email: data.email || null,
      taxCode: data.taxCode || null,
      businessCode: data.businessCode || null,
    };

    if (data.referralCode) {
      const referrer = await this.userRepository.findByOption({
        where: {
          referralCode: data.referralCode,
        },
      });

      if (referrer) {
        dataCreateCustomer.referralCode = data.referralCode;
        dataCreateCustomer.referralStaff = referrer.id;
      }
    }

    const customer = await this.customerRepository.create(dataCreateCustomer);

    // Create user
    const dataCreateUser: DeepPartial<User> = {
      customerId: customer.id,
      code: userCode,
      role: UserRoleEnum.USER, // Default role
      name: data.phone,
      phone: data.phone,
      username: data.phone,
      email: null,
      password: hashedPassword,
    };

    const user = await this.authRepository.create(dataCreateUser);

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username as string,
      role: user.role as UserRoleEnum,
      employeeId: user.employeeId,
      customerId: user.customerId,
    };
    const tokens = AuthUtils.generateTokens(payload);

    const sessionType = AuthUtils.getSessionType(undefined, req?.headers["x-platform"]);
    await this.replaceRefreshTokenForSession(user.id, tokens.refreshToken as string, sessionType);
    AuthUtils.setTokenCookies(res!, tokens);

    return ApiResponseHandler.createSuccess("OK");
  }

  async register(
    data: RegisterDto,
    sessionType: AuthSessionTypeEnum = AuthSessionTypeEnum.MOBILE,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user already exists
    let existingUser;
    let dataCheck = "";
    if (data.email) {
      existingUser = await this.authRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError(`email.${ErrorsMessages.already_exists}`);
      }
      dataCheck = data.email;
    }
    if (data.phone) {
      existingUser = await this.authRepository.findByPhone(data.phone);
      if (existingUser) {
        throw new ConflictError(`phone.${ErrorsMessages.already_exists}`);
      }
      dataCheck = data.phone;
    }

    // get verifyKey and verifyCode from redis
    const redisData: { verifyKey: string; verifyCode: string } | null = await redisHelper.getJson(dataCheck);

    // Check if verifyKey and verifyCode are valid
    if (!redisData || redisData.verifyKey !== data.verifyKey || redisData.verifyCode !== data.verifyCode) {
      throw new UnauthorizedError("verify.invalid");
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(data.password);

    // Create user
    const dataCreateUser: DeepPartial<User> = {
      ...data,
      role: UserRoleEnum.USER, // Default role
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      password: hashedPassword,
    };
    const user = await this.authRepository.create(dataCreateUser);

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username as string,
      role: user.role as UserRoleEnum,
      employeeId: user.employeeId,
      customerId: user.customerId,
    };
    const tokens = AuthUtils.generateTokens(payload);
    await this.replaceRefreshTokenForSession(user.id, tokens.refreshToken as string, sessionType);

    return { user, tokens };
  }

  async login(loginData: LoginDto, res: Response, req?: Request): Promise<{ user: User }> {
    // Rate limiting check for login attempts (10 attempts per session/username)
    const rateLimitKey = `rate_limit:login:${loginData.username}`;
    const requestCount = await redisHelper.incr(rateLimitKey);
    if (requestCount === 1) {
      await redisHelper.expire(rateLimitKey, 3 * 60); // 3 phút
    }

    if (requestCount > 10) {
      throw new BadRequestError("Quá nhiều lần đăng nhập, vui lòng thử lại sau");
    }

    if (!loginData.username) {
      throw new BadRequestError("email.required");
    }

    const sessionType = AuthUtils.getSessionType(loginData.clientType, req?.headers["x-platform"]);

    if (loginData.username === config.ROOT_USERNAME) {
      if (loginData.password !== config.ROOT_PASSWORD) {
        throw new BadRequestError("Mật khẩu không đúng");
      }

      //? find admin user in db
      const adminUser = await this.authRepository.findByOption({
        where: {
          role: UserRoleEnum.ADMIN,
        },
        select: {
          id: true,
          username: true,
          role: true,
        },
      });

      if (adminUser) {
        // Generate tokens
        const payload: JwtPayload = {
          userId: adminUser.id,
          role: adminUser.role,
          username: adminUser.username as string,
          employeeId: adminUser.employeeId,
          customerId: adminUser.customerId,
        };
        const tokens = AuthUtils.generateTokens(payload);

        await this.replaceRefreshTokenForSession(adminUser.id, tokens.refreshToken as string, sessionType);
        AuthUtils.setTokenCookies(res, tokens);

        return { user: adminUser };
      } else {
        //? create admin user
        throw new NotFoundError("Người dùng quản trị không tồn tại");
      }
    }

    const user = await this.authRepository.findByUsername(loginData.username);
    if (!user) {
      throw new BadRequestError("Người dùng không tồn tại");
    }

    // Check password
    const isPasswordValid = await AuthUtils.comparePassword(loginData.password, user.password as string);
    if (!isPasswordValid) {
      throw new BadRequestError("Mật khẩu không đúng");
    }

    if (user.isActive === false) {
      throw new BadRequestError("Người dùng đã bị khóa");
    }

    if (
      sessionType === AuthSessionTypeEnum.WEB &&
      user.role !== UserRoleEnum.ADMIN &&
      user.role !== UserRoleEnum.MANAGER
    ) {
      throw new ForbiddenError("Bạn không có quyền đăng nhập vào hệ thống");
    }

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      username: user.username as string,
      employeeId: user.employeeId,
      customerId: user.customerId,
    };
    const tokens = AuthUtils.generateTokens(payload);
    await this.replaceRefreshTokenForSession(user.id, tokens.refreshToken as string, sessionType);
    AuthUtils.setTokenCookies(res, tokens);

    // Clear rate limit key on successful login
    await redisHelper.del(rateLimitKey);

    // Save firebase token if exists
    if (loginData.token) {
      const check = await this.tokenRepository.findByOption({
        where: {
          firebaseToken: loginData.token,
          userId: user.id,
        },
      });
      if (!check) {
        await this.tokenRepository.create({
          firebaseToken: loginData.token,
          userId: user.id,
        });
      }
    }

    return { user };
  }

  async logout(userId: string, refreshToken: string, firebaseToken?: string): Promise<void> {
    //? clear token
    if (refreshToken) {
      const tokenInDb = await this.tokenRepository.findByOption({
        where: {
          userId,
          refreshToken: refreshToken,
        },
      });
      if (tokenInDb) {
        await redisHelper.del(AuthUtils.getRefreshTokenCacheKey(userId, refreshToken));
        await this.tokenRepository.delete(tokenInDb.id);
      }
    }

    if (firebaseToken) {
      await this.tokenRepository.deleteWithOption({
        userId,
        firebaseToken: firebaseToken,
      });
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.authRepository.findByOption({
      where: {
        id: userId,
      },
      relations: {
        permissionGroup: true,
        employee: true,
        customer: true,
      },
      select: {
        permissionGroup: PermissionGroupSelectBasic,
        employee: EmployeeSelectBasic,
        customer: CustomerSelectBasic,
      },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.customerId) {
      // tính tổng số đơn hàng của khách hàng
      const totalOrders = await this.orderRepository.getTotalOrdersByCustomer(user.customerId);

      // calculate total reward points
      const totalRewardPoints = await this.clientRewardPointRepository.getCurrentPoints(user.customerId);

      // calculate total debts
      const totalDebts = await this.debtRepository.calculateCustomerDebtAtTime(user.customerId, new Date());

      Object.assign(user, {
        totalOrders,
        totalRewardPoints,
        totalDebts,
      });
    }

    return user;
  }

  async forgetPassword(data: ForgetPasswordDto, manager?: EntityManager): Promise<ApiResponse<string>> {
    const user = await this.userRepository.findByOption({
      where: { email: data.email },
      select: ["id", "email"],
    });

    if (!user) {
      throw new NotFoundError(`email.${ErrorsMessages.not_found}`);
    }
    // get verifyKey and verifyCode from redis
    const redisData: { verifyKey: string; verifyCode: string } | null = await redisHelper.getJson(data.email);

    // Check if verifyKey and verifyCode are valid
    if (!redisData || redisData.verifyKey !== data.verifyKey || redisData.verifyCode !== data.verifyCode) {
      throw new UnauthorizedError("verify.invalid");
    }

    // Generate new password and hash it
    const hashedPassword = await AuthUtils.hashPassword(data.newPassword);

    // Update user password
    await this.userRepository.update(user.id, { password: hashedPassword });
    await this.revokeRefreshTokensByUserId(user.id, manager);

    return ApiResponseHandler.updateSuccess("OK", {
      userId: user.id,
      email: user.email,
    });
  }

  async changePassword(userId: string, data: ChangePasswordDto, manager?: EntityManager): Promise<ApiResponse<string>> {
    const user = await this.userRepository.findByOption({
      where: { id: userId },
      select: ["id", "email", "username", "password"],
    });

    if (!user) {
      throw new NotFoundError(`User with id ${userId} not found`);
    }

    // Check old password
    const isPasswordValid = await AuthUtils.comparePassword(data.oldPassword, user.password as string);
    if (!isPasswordValid) {
      throw new BadRequestError(`oldPassword.${ErrorsMessages.incorrect}`);
    }

    // Hash new password
    const hashedNewPassword = await AuthUtils.hashPassword(data.newPassword);

    // Update user password
    await this.userRepository.update(user.id, { password: hashedNewPassword });
    await this.revokeRefreshTokensByUserId(user.id, manager);

    return ApiResponseHandler.updateSuccess("OK", {
      userId: user.id,
      email: user.email,
    });
  }

  async UpdateInformation(userId: string, data: UpdateInformationDto): Promise<ApiResponse<User>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(`User with id ${userId} not found`);
    }

    // Update user information
    const updatedUser = await this.userRepository.update(user.id, data);

    return ApiResponseHandler.updateSuccess("OK", updatedUser);
  }

  async updateSettings(userId: string, data: UpdateSettingsDto): Promise<ApiResponse<ISetting>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(`User with id ${userId} not found`);
    }

    // Update user settings
    const updatedSettings = await this.userRepository.update(user.id, { setting: data });

    return ApiResponseHandler.updateSuccess("OK", updatedSettings?.setting || {});
  }

  async getSettings(userId: string): Promise<ApiResponse<ISetting>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(`User with id ${userId} not found`);
    }

    return ApiResponseHandler.getSuccess("OK", user.setting || {});
  }

  async verifyOtp(
    userId: string,
    otpCode: string,
    res: Response,
    req?: Request,
  ): Promise<ApiResponse<{ user: User }>> {
    // Find user by id
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("Người dùng không tồn tại");
    }

    // Check if OTP is valid
    if (user.otpCode !== otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestError("Mã OTP không đúng hoặc đã hết hạn");
    }

    // Clear OTP fields
    await this.userRepository.update(user.id, {
      otpCode: null,
      otpExpiresAt: null,
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      username: user.username as string,
      employeeId: user.employeeId,
      customerId: user.customerId,
    };
    const tokens = AuthUtils.generateTokens(payload);

    const sessionType = AuthUtils.getSessionType(undefined, req?.headers["x-platform"]);
    await this.replaceRefreshTokenForSession(user.id, tokens.refreshToken as string, sessionType);
    AuthUtils.setTokenCookies(res, tokens);

    return ApiResponseHandler.getSuccess("OTP verified successfully", { user });
  }

  //? tạo mới access token khi refresh token còn hạn
  async refreshToken(
    userId: string,
    refreshToken: string,
    res: Response,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("Người dùng không tồn tại");
    }

    const tokenInDb = await this.tokenRepository.findByOption({
      where: {
        userId,
        refreshToken,
      },
    });

    if (!tokenInDb) {
      throw new BadRequestError("Refresh token không hợp lệ");
    }

    // Generate new tokens
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      username: user.username as string,
      employeeId: user.employeeId,
      customerId: user.customerId,
    };
    const tokens = AuthUtils.generateTokens(payload);

    AuthUtils.setAccessTokenCookie(res, tokens.accessToken);

    return ApiResponseHandler.getSuccess("Access token refreshed successfully", { accessToken: tokens.accessToken });
  }
}
