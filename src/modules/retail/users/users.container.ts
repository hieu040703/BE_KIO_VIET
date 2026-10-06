import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailUsersController } from "./users.controller";
import { RetailUsersRepository } from "./users.repository";
import { RetailUsersRouter } from "./users.route";
import { RetailUsersService } from "./users.service";
import { RETAIL_USERS_TYPES } from "./users.types";

export const usersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailUsersRepository>(RETAIL_USERS_TYPES.Repository).to(RetailUsersRepository);
  options.bind<RetailUsersService>(RETAIL_USERS_TYPES.Service).to(RetailUsersService);
  options.bind<RetailUsersController>(RETAIL_USERS_TYPES.Controller).to(RetailUsersController);
  options.bind<RetailUsersRouter>(RETAIL_USERS_TYPES.Router).to(RetailUsersRouter);
});
