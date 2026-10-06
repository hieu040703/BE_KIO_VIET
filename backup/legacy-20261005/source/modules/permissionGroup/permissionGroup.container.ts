import { Container, ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { PermissionGroupController } from "./permissionGroup.controller";
import { PermissionGroupService } from "./permissionGroup.service";
import { PermissionGroupRepository } from "./permissionGroup.repository";
import { PermissionGroupRouter } from "./permissionGroup.route";
import { PERMISSION_GROUP_TYPES } from "./permissionGroup.types";

// const permissionGroupContainer = new Container();

// permissionGroupContainer.bind<PermissionGroupService>(PERMISSION_GROUP_TYPES.PermissionGroupService).to(PermissionGroupService);
// permissionGroupContainer.bind<PermissionGroupController>(PERMISSION_GROUP_TYPES.PermissionGroupController).to(PermissionGroupController);
// permissionGroupContainer.bind<PermissionGroupRepository>(PERMISSION_GROUP_TYPES.PermissionGroupRepository).to(PermissionGroupRepository);
// permissionGroupContainer.bind<PermissionGroupRouter>(PERMISSION_GROUP_TYPES.PermissionGroupRouter).to(PermissionGroupRouter);

// export { permissionGroupContainer };

const permissionGroupModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<PermissionGroupService>(PERMISSION_GROUP_TYPES.PermissionGroupService).to(PermissionGroupService);
  options
    .bind<PermissionGroupController>(PERMISSION_GROUP_TYPES.PermissionGroupController)
    .to(PermissionGroupController);
  options
    .bind<PermissionGroupRepository>(PERMISSION_GROUP_TYPES.PermissionGroupRepository)
    .to(PermissionGroupRepository);
  options.bind<PermissionGroupRouter>(PERMISSION_GROUP_TYPES.PermissionGroupRouter).to(PermissionGroupRouter);
});

export { permissionGroupModule };
