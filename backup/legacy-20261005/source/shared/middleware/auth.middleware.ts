import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/shared/config/env";
import { UnauthorizedError } from "@/shared/types/errors";
import { JwtPayload } from "@/shared/types/interfaces";
import { AuthUtils } from "../utils/auth.utils";
import redisHelper from "@/shared/utils/redis.helper";
import { TokenRepository } from "@/modules/token/token.repository";

const tokenRepository = new TokenRepository();
const REFRESH_TOKEN_CACHE_TTL_SECONDS = 5 * 60;

export const jwtMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const refreshToken = (req as any).cookies?.refreshToken;

    if (!refreshToken) {
      next(new UnauthorizedError("Invalid or expired token"));
    } else {
      const accessToken = (req as any).cookies?.accessToken;

      if (accessToken) {
        const decoded = AuthUtils.verifyAccessToken(accessToken);
        req.user = decoded;
        // //? nếu giao thức là POST thì thêm createdBy: userId, PUT thì thêm updatedBy: userId
        // if (req.method === "POST") {
        //   (req as any).body.createdBy = decoded.userId;
        // } else if (req.method === "PUT" || req.method === "PATCH") {
        //   (req as any).body.updatedBy = decoded.userId;
        // }
        next();
      } else {
        const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as JwtPayload;

        const payload: JwtPayload = {
          userId: decoded.userId,
          role: decoded.role,
          username: decoded.username as string,
          employeeId: decoded.employeeId,
          customerId: decoded.customerId,
        };
        const accessToken = AuthUtils.generateAccessToken(payload);

        // set new access token in cookies
        AuthUtils.setAccessTokenCookie(res, accessToken);

        req.user = decoded;

        //? nếu giao thức là POST thì thêm createdBy: userId, PUT thì thêm updatedBy: userId
        // if (req.method === "POST") {
        //   (req as any).body.createdBy = decoded.userId;
        // } else if (req.method === "PUT" || req.method === "PATCH") {
        //   (req as any).body.updatedBy = decoded.userId;
        // }

        next();
      }
    }
  } catch (error) {
    // Continue without user for optional auth
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

export const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user;
    const refreshToken = (req as any).cookies?.refreshToken;

    if (!user || !refreshToken) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const decodedRefreshToken = AuthUtils.verifyRefreshToken(refreshToken);
    if (decodedRefreshToken.userId !== user.userId) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const cacheKey = AuthUtils.getRefreshTokenCacheKey(user.userId, refreshToken);
    const cachedToken = await redisHelper.get(cacheKey);
    if (cachedToken === "1") {
      next();
      return;
    }

    const tokenInDb = await tokenRepository.findByOption({
      where: {
        userId: user.userId,
        refreshToken,
      },
    });

    if (!tokenInDb) {
      await redisHelper.del(cacheKey);
      AuthUtils.clearTokenCookies(res);
      throw new UnauthorizedError("Invalid or expired token");
    }

    const tokenTtl = AuthUtils.getTokenRemainingTtlSeconds(refreshToken);
    const cacheTtl = Math.min(tokenTtl || REFRESH_TOKEN_CACHE_TTL_SECONDS, REFRESH_TOKEN_CACHE_TTL_SECONDS);
    if (cacheTtl > 0) {
      await redisHelper.set(cacheKey, "1", cacheTtl);
    }

    next();
  } catch (error) {
    AuthUtils.clearTokenCookies(res);
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

export const authenticate: RequestHandler[] = [jwtMiddleware, authMiddleware];
