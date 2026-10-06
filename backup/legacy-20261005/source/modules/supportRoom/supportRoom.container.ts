import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdminSupportRoomController } from "./admin.supportRoom.controller";
import { ClientSupportRoomController } from "./client.supportRoom.controller";
import { AdminSupportRoomService } from "./admin.supportRoom.service";
import { ClientSupportRoomService } from "./client.supportRoom.service";
import { AdminSupportRoomRepository } from "./admin.supportRoom.repository";
import { ClientSupportRoomRepository } from "./client.supportRoom.repository";
import { AdminSupportRoomRouter } from "./admin.supportRoom.route";
import { ClientSupportRoomRouter } from "./client.supportRoom.route";
import { SUPPORT_ROOM_TYPES } from "./supportRoom.types";

const supportRoomModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AdminSupportRoomService>(SUPPORT_ROOM_TYPES.AdminSupportRoomService).to(AdminSupportRoomService);
  options
    .bind<AdminSupportRoomController>(SUPPORT_ROOM_TYPES.AdminSupportRoomController)
    .to(AdminSupportRoomController);
  options.bind<AdminSupportRoomRouter>(SUPPORT_ROOM_TYPES.AdminSupportRoomRouter).to(AdminSupportRoomRouter);
  options
    .bind<AdminSupportRoomRepository>(SUPPORT_ROOM_TYPES.AdminSupportRoomRepository)
    .to(AdminSupportRoomRepository);

  options.bind<ClientSupportRoomService>(SUPPORT_ROOM_TYPES.ClientSupportRoomService).to(ClientSupportRoomService);
  options
    .bind<ClientSupportRoomController>(SUPPORT_ROOM_TYPES.ClientSupportRoomController)
    .to(ClientSupportRoomController);
  options.bind<ClientSupportRoomRouter>(SUPPORT_ROOM_TYPES.ClientSupportRoomRouter).to(ClientSupportRoomRouter);
  options
    .bind<ClientSupportRoomRepository>(SUPPORT_ROOM_TYPES.ClientSupportRoomRepository)
    .to(ClientSupportRoomRepository);
});

export { supportRoomModule };
