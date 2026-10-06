import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdminServiceOrderController } from "./admin.serviceOrder.controller";
import { ClientServiceOrderController } from "./client.serviceOrder.controller";
import { AdminServiceOrderService } from "./admin.serviceOrder.service";
import { ClientServiceOrderService } from "./client.serviceOrder.service";
import { AdminServiceOrderRepository } from "./admin.serviceOrder.repository";
import { ClientServiceOrderRepository } from "./client.serviceOrder.repository";
import { AdminServiceOrderRouter } from "./admin.serviceOrder.route";
import { ClientServiceOrderRouter } from "./client.serviceOrder.route";
import { SERVICE_ORDER_TYPES } from "./serviceOrder.types";
import { SERVICE_ORDER_CHAT_TYPES } from "./chat/serviceOrderChat.types";
import { ServiceOrderChatRepository } from "./chat/serviceOrderChat.repository";
import { ServiceOrderChatParticipantRepository } from "./chat/serviceOrderChatParticipant.repository";
import { ServiceOrderChatService } from "./chat/serviceOrderChat.service";
import { ServiceOrderChatController } from "./chat/serviceOrderChat.controller";
import { ServiceOrderChatRouter } from "./chat/serviceOrderChat.route";

const serviceOrderModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options
    .bind<AdminServiceOrderRepository>(SERVICE_ORDER_TYPES.AdminServiceOrderRepository)
    .to(AdminServiceOrderRepository);
  options.bind<AdminServiceOrderService>(SERVICE_ORDER_TYPES.AdminServiceOrderService).to(AdminServiceOrderService);
  options
    .bind<AdminServiceOrderController>(SERVICE_ORDER_TYPES.AdminServiceOrderController)
    .to(AdminServiceOrderController);
  options.bind<AdminServiceOrderRouter>(SERVICE_ORDER_TYPES.AdminServiceOrderRouter).to(AdminServiceOrderRouter);

  options.bind<ClientServiceOrderService>(SERVICE_ORDER_TYPES.ClientServiceOrderService).to(ClientServiceOrderService);
  options
    .bind<ClientServiceOrderController>(SERVICE_ORDER_TYPES.ClientServiceOrderController)
    .to(ClientServiceOrderController);
  options.bind<ClientServiceOrderRouter>(SERVICE_ORDER_TYPES.ClientServiceOrderRouter).to(ClientServiceOrderRouter);
  options
    .bind<ClientServiceOrderRepository>(SERVICE_ORDER_TYPES.ClientServiceOrderRepository)
    .to(ClientServiceOrderRepository);
  options
    .bind<ServiceOrderChatRepository>(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatRepository)
    .to(ServiceOrderChatRepository);
  options
    .bind<ServiceOrderChatParticipantRepository>(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatParticipantRepository)
    .to(ServiceOrderChatParticipantRepository);
  options.bind<ServiceOrderChatService>(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatService).to(ServiceOrderChatService);
  options
    .bind<ServiceOrderChatController>(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatController)
    .to(ServiceOrderChatController);
  options.bind<ServiceOrderChatRouter>(SERVICE_ORDER_CHAT_TYPES.ServiceOrderChatRouter).to(ServiceOrderChatRouter);
});

export { serviceOrderModule };
