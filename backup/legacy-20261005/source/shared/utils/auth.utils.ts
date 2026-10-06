import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AuthTokens, JwtPayload } from "@/shared/types/interfaces";
import { CookieOptions, Request, Response } from "express";
import { config } from "../config/env";
import { AuthSessionTypeEnum } from "@/shared/constants/constance";

export class AuthUtils {
  static getSessionType(
    clientType?: AuthSessionTypeEnum,
    platformHeader?: string | string[],
  ): AuthSessionTypeEnum {
    if (clientType) {
      return clientType;
    }

    const platform = Array.isArray(platformHeader) ? platformHeader[0] : platformHeader;
    return platform === AuthSessionTypeEnum.WEB ? AuthSessionTypeEnum.WEB : AuthSessionTypeEnum.MOBILE;
  }

  static getRefreshTokenCacheKey(userId: string, refreshToken: string): string {
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    return `auth:refresh-token:${userId}:${tokenHash}`;
  }

  static getTokenRemainingTtlSeconds(token: string): number | undefined {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== "object" || typeof decoded.exp !== "number") {
      return undefined;
    }

    return Math.max(decoded.exp - Math.floor(Date.now() / 1000), 0);
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateOTP(length: number = 6): string {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  static generateOtpTokens(payload: JwtPayload): string {
    const otpTokenOptions = { expiresIn: config.JWT_OTP_EXPIRES_IN };

    const otpToken = jwt.sign(payload as any, config.JWT_OTP_SECRET as any, otpTokenOptions as any) as string;

    return otpToken;
  }

  static setOtpTokenCookie(res: Response, otpToken: string): void {
    const isLocal = process.env.NODE_ENV === "development";

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isLocal ? false : true, // Set true only for HTTPS
      sameSite: isLocal ? "lax" : "none",
      path: "/",
      // Don't set domain for IP addresses
      ...(isLocal ? {} : { domain: process.env.COOKIE_DOMAIN }),
    };
    // OTP token
    res.cookie("otpToken", otpToken, {
      ...cookieOptions,
      maxAge: 10 * 60 * 1000, // 10 minutes
    });
  }

  static generateTokens(payload: JwtPayload): AuthTokens {
    const accessTokenOptions = { expiresIn: config.JWT_ACCESS_EXPIRES_IN };
    const refreshTokenOptions = { expiresIn: config.JWT_REFRESH_EXPIRES_IN };

    const accessToken = jwt.sign(payload as any, config.JWT_ACCESS_SECRET as any, accessTokenOptions as any) as string;
    const refreshToken = jwt.sign(
      payload as any,
      config.JWT_REFRESH_SECRET as any,
      refreshTokenOptions as any,
    ) as string;

    return { accessToken, refreshToken };
  }

  static generateAccessToken(payload: JwtPayload): string {
    const accessTokenOptions = { expiresIn: config.JWT_ACCESS_EXPIRES_IN };
    return jwt.sign(payload as any, config.JWT_ACCESS_SECRET as any, accessTokenOptions as any) as string;
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;
  }

  static setTokenCookies(res: Response, tokens: AuthTokens): void {
    const isLocal = process.env.NODE_ENV === "development";

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true, // Set true only for HTTPS
      sameSite: "none",
      path: "/",
      // Don't set domain for IP addresses
      ...(isLocal ? {} : { domain: process.env.COOKIE_DOMAIN }),
    };

    // Access token
    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: config.COOKIE_ACCESS_EXPIRES_IN || 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Refresh token
    if (tokens.refreshToken) {
      res.cookie("refreshToken", tokens.refreshToken, {
        ...cookieOptions,
        maxAge: config.COOKIE_REFRESH_EXPIRES_IN || 180 * 24 * 60 * 60 * 1000, // 180 day
      });
    }
  }

  static setAccessTokenCookie(res: Response, accessToken: string): void {
    const isLocal = process.env.NODE_ENV === "development";

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true, // Set true only for HTTPS
      sameSite: "none",
      path: "/",
      // Don't set domain for IP addresses
      ...(isLocal ? {} : { domain: process.env.COOKIE_DOMAIN }),
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: config.COOKIE_ACCESS_EXPIRES_IN || 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  static clearTokenCookies(res: any): void {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }
}
