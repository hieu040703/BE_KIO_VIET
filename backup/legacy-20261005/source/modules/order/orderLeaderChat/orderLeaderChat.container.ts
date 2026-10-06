import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { OrderLeaderChatController } from "./orderLeaderChat.controller";
import { OrderLeaderChatRepository } from "./orderLeaderChat.repository";
import { OrderLeaderChatReadStateRepository } from "./orderLeaderChatReadState.repository";
import { OrderLeaderChatRouter } from "./orderLeaderChat.route";
import { OrderLeaderChatService } from "./orderLeaderChat.service";
import { ORDER_LEADER_CHAT_TYPES } from "./orderLeaderChat.types";

const orderLeaderChatModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<OrderLeaderChatService>(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatService).to(OrderLeaderChatService);
  options
    .bind<OrderLeaderChatController>(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatController)
    .to(OrderLeaderChatController);
  options
    .bind<OrderLeaderChatRepository>(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatRepository)
    .to(OrderLeaderChatRepository);
  options
    .bind<OrderLeaderChatReadStateRepository>(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatReadStateRepository)
    .to(OrderLeaderChatReadStateRepository);
  options.bind<OrderLeaderChatRouter>(ORDER_LEADER_CHAT_TYPES.OrderLeaderChatRouter).to(OrderLeaderChatRouter);
});

export { orderLeaderChatModule };
