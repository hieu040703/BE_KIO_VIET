export const AUTH_TYPES = {
  Repository: Symbol.for("RetailAuthRepository"),
  Service: Symbol.for("RetailAuthService"),
  Controller: Symbol.for("RetailAuthController"),
  Router: Symbol.for("RetailAuthRouter"),
} as const;

export interface AuthTokenPayload {
  sub: string;
  tenantId: string;
  email: string | null;
  role: "ADMIN";
}
