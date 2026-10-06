import { Router } from "express";
import { injectable, inject } from "inversify";
import { AuthController } from "./auth.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  LogoutSchema,
  RegisterPhoneSchema,
  VerifyPhoneSchema,
} from "./auth.validator";
import { authenticate } from "@/shared/middleware/auth.middleware";
import { otpMiddleware } from "@/shared/middleware/otp.middleware";
import { AUTH_TYPES } from "./auth.types";

@injectable()
export class AuthRouter {
  private router: Router;

  constructor(@inject(AUTH_TYPES.AuthController) private authController: AuthController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes
    this.router.post("/register", zodValidate(RegisterPhoneSchema, "body"), this.authController.registerPhone);
    // this.router.post("/register", zodValidate(RegisterSchema, "body"), this.authController.register);
    this.router.post("/login", zodValidate(LoginSchema, "body"), this.authController.login);
    this.router.post("/verify/phone", zodValidate(VerifyPhoneSchema, "body"), this.authController.verifyPhone);
    this.router.post("/verify/otp", otpMiddleware, this.authController.verifyOtp);
    this.router.post("/verify/email", zodValidate(VerifyEmailSchema, "body"), this.authController.verifyEmail);
    this.router.put("/forget-password", this.authController.forgetPassword);

    // Protected routes
    this.router.post("/logout", authenticate, zodValidate(LogoutSchema, "body"), this.authController.logout);
    this.router.get("/me", authenticate, this.authController.getCurrentUser);
    this.router.put("/change-password", authenticate, this.authController.changePassword);
    this.router.put("/settings", authenticate, this.authController.UpdateSettings);
    this.router.get("/settings", authenticate, this.authController.getSettings);
    this.router.post("/refresh-token", authenticate, this.authController.refreshToken);
  }

  public getRouter(): Router {
    return this.router;
  }
}
