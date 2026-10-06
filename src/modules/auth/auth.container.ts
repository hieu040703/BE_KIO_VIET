import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthRouter } from "./auth.route";
import { AuthService } from "./auth.service";
import { AUTH_TYPES } from "./auth.types";

export const authModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AuthRepository>(AUTH_TYPES.Repository).to(AuthRepository);
  options.bind<AuthService>(AUTH_TYPES.Service).to(AuthService);
  options.bind<AuthController>(AUTH_TYPES.Controller).to(AuthController);
  options.bind<AuthRouter>(AUTH_TYPES.Router).to(AuthRouter);
});
