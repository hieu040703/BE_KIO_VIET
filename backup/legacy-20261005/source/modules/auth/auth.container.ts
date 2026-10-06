import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { AuthRouter } from "./auth.route";
import { AUTH_TYPES } from "./auth.types";

const authModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AuthController>(AUTH_TYPES.AuthController).to(AuthController);
  options.bind<AuthService>(AUTH_TYPES.AuthService).to(AuthService);
  options.bind<AuthRepository>(AUTH_TYPES.AuthRepository).to(AuthRepository);
  options.bind<AuthRouter>(AUTH_TYPES.AuthRouter).to(AuthRouter);
});

export { authModule };
