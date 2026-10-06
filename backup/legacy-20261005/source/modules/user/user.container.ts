import { Container, ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { AdminUserRouter } from "./admin.user.route";
import { ClientUserRouter } from "./client.user.route";
import { USER_TYPES } from "./user.types";

const userModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<UserController>(USER_TYPES.UserController).to(UserController);
  options.bind<UserService>(USER_TYPES.UserService).to(UserService);
  options.bind<UserRepository>(USER_TYPES.UserRepository).to(UserRepository);
  options.bind<AdminUserRouter>(USER_TYPES.AdminUserRouter).to(AdminUserRouter);
  options.bind<ClientUserRouter>(USER_TYPES.ClientUserRouter).to(ClientUserRouter);
});

export { userModule };
