
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {SupportRoomChatMessageController} from "./supportRoomChatMessage.controller";
    import {SupportRoomChatMessageService} from "./supportRoomChatMessage.service";
    import {SupportRoomChatMessageRepository} from "./supportRoomChatMessage.repository";
    import {SupportRoomChatMessageRouter} from "./supportRoomChatMessage.route";
    import {SUPPORT_ROOM_CHAT_MESSAGE_TYPES } from "./supportRoomChatMessage.types";



    const supportRoomChatMessageModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<SupportRoomChatMessageService>(SUPPORT_ROOM_CHAT_MESSAGE_TYPES.SupportRoomChatMessageService).to(SupportRoomChatMessageService);
      options.bind<SupportRoomChatMessageController>(SUPPORT_ROOM_CHAT_MESSAGE_TYPES.SupportRoomChatMessageController).to(SupportRoomChatMessageController);
      options.bind<SupportRoomChatMessageRepository>(SUPPORT_ROOM_CHAT_MESSAGE_TYPES.SupportRoomChatMessageRepository).to(SupportRoomChatMessageRepository);
      options.bind<SupportRoomChatMessageRouter>(SUPPORT_ROOM_CHAT_MESSAGE_TYPES.SupportRoomChatMessageRouter).to(SupportRoomChatMessageRouter);
    });

    export { supportRoomChatMessageModule };