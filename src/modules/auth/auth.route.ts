import { Router } from "express";
import { inject, injectable } from "inversify";
import { AUTH_TYPES } from "./auth.types";
import { AuthController } from "./auth.controller";

@injectable()
export class AuthRouter {
  private readonly router = Router();

  constructor(@inject(AUTH_TYPES.Controller) controller: AuthController) {
    this.router.post("/login", controller.login);
    this.router.get("/me", controller.me);
  }

  getRouter(): Router {
    return this.router;
  }
}
