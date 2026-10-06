import { Container, ContainerModule, ContainerModuleLoadOptions } from "inversify";

import { SSE_TYPES } from "./sse.types";
import { SSEService } from "./sse.service";
import { SSEController } from "./sse.controller";
import { ClientSSERouter } from "./client.sse.route";

// const sseContainer = new Container();

// sseContainer.bind<SSEService>(SSE_TYPES.SSEService).to(SSEService).inSingletonScope();
// sseContainer.bind<SSEController>(SSE_TYPES.SSEController).to(SSEController).inSingletonScope();
// sseContainer.bind<ClientSSERouter>(SSE_TYPES.ClientSSERouter).to(ClientSSERouter).inSingletonScope();

// export { sseContainer };

const sseModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<SSEService>(SSE_TYPES.SSEService).to(SSEService).inSingletonScope();
  options.bind<SSEController>(SSE_TYPES.SSEController).to(SSEController).inSingletonScope();
  options.bind<ClientSSERouter>(SSE_TYPES.ClientSSERouter).to(ClientSSERouter).inSingletonScope();
});

export { sseModule };
