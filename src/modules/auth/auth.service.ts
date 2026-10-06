import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { inject, injectable } from "inversify";
import { config } from "@/shared/config/env";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { UnauthorizedError } from "@/shared/types/errors";
import { AUTH_TYPES, AuthTokenPayload } from "./auth.types";
import { AuthRepository } from "./auth.repository";

@injectable()
export class AuthService {
  constructor(@inject(AUTH_TYPES.Repository) private readonly repository: AuthRepository) {}

  async login(email: string, password: string, tenantId?: string) {
    const user = await this.repository.findByCredentials(email, tenantId);
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedError("Email or password is incorrect");
    }

    const payload: AuthTokenPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: "ADMIN",
    };
    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
    });

    return ApiResponseHandler.getSuccess("Login successful", {
      accessToken,
      tokenType: "Bearer",
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
      tenantId: user.tenantId,
      user: this.publicUser(user),
    });
  }

  async me(accessToken: string) {
    let payload: AuthTokenPayload;
    try {
      payload = jwt.verify(accessToken, config.JWT_ACCESS_SECRET) as AuthTokenPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    const user = await this.repository.findById(payload.sub);
    if (!user) throw new UnauthorizedError("User is no longer active");
    return ApiResponseHandler.getSuccess("OK", {
      tenantId: user.tenantId,
      user: this.publicUser(user),
      role: payload.role,
    });
  }

  private publicUser(user: { id: string; tenantId: string; email: string | null; phone: string | null; status: string }) {
    return { id: user.id, tenantId: user.tenantId, email: user.email, phone: user.phone, status: user.status };
  }
}
