import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BadRequestError } from "@/shared/types/errors";
import { AUTH_TYPES } from "./auth.types";
import { AuthService } from "./auth.service";
import { AuthLoginSchema } from "./auth.validator";

@injectable()
export class AuthController {
  constructor(@inject(AUTH_TYPES.Service) private readonly service: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = AuthLoginSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);
      res.status(200).json(await this.service.login(parsed.data.email, parsed.data.password, parsed.data.tenantId));
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.header("authorization");
      if (!header?.startsWith("Bearer ")) throw new BadRequestError("Bearer access token is required");
      res.status(200).json(await this.service.me(header.slice("Bearer ".length).trim()));
    } catch (error) {
      next(error);
    }
  };
}
