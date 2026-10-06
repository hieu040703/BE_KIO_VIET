import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, RegisterPhoneDto } from "./auth.validator";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { AUTH_TYPES } from "./auth.types";

@injectable()
export class AuthController {
  constructor(@inject(AUTH_TYPES.AuthService) private authService: AuthService) {}

  registerPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: RegisterPhoneDto = req.body;

      const result = await this.authService.registerPhone(userData, req, res);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: RegisterDto = req.body;

      const result = await this.authService.register(userData);

      // Set cookies
      res.cookie("accessToken", result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove sensitive data
      const { password, ...userResponse } = result.user;

      return res.status(201).json(ApiResponseHandler.getSuccess("User registered successfully", userResponse));
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginDto = req.body;

      const result = await this.authService.login(loginData, res, req);

      // Remove sensitive data
      const { password, ...userResponse } = result.user;

      return res.status(200).json(ApiResponseHandler.getSuccess("OK", userResponse));
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const firebaseToken = req.body?.firebaseToken;
      const refreshToken = req.cookies["refreshToken"];

      await this.authService.logout(userId, refreshToken, firebaseToken);

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.status(200).json(ApiResponseHandler.getSuccess("Logout successful"));
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const Request = req as Request;
      const userId = Request.user!.userId;

      const user = await this.authService.getCurrentUser(userId);

      // Remove sensitive data
      const { password, ...userResponse } = user;

      return res.status(200).json(ApiResponseHandler.getSuccess("Current user retrieved successfully", userResponse));
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.authService.verifyEmail(req.body);
    return res.status(result.statusCode).json(result);
  };

  verifyPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.verifyPhone(req.body, res);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.forgetPassword(req.body);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId as string;
      const result = await this.authService.changePassword(userId, req.body);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateInformation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId as string;
      const result = await this.authService.UpdateInformation(userId, req.body);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  UpdateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId as string;
      const result = await this.authService.updateSettings(userId, req.body);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId as string;
      const result = await this.authService.getSettings(userId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId as string;
      const { otpCode } = req.body;
      const result = await this.authService.verifyOtp(userId, otpCode, res, req);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId as string;
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(400).json(ApiResponseHandler.error(404, "Refresh token is not provided"));
      }
      const result = await this.authService.refreshToken(userId, refreshToken, res);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };
}
