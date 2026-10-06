import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Rate limiter chặn spam - dùng cho các action quan trọng (complete, cancel, confirm-payment...)
 * Mỗi IP chỉ được gọi cùng 1 endpoint 1 lần trong 2 giây
 */
export const strictActionLimiter = rateLimit({
  windowMs: 2 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => `${ipKeyGenerator(req.ip || "")}:${req.method}:${req.originalUrl}`,
  message: {
    statusCode: 429,
    message: "Bạn thao tác quá nhanh, vui lòng thử lại sau vài giây",
  },
});
