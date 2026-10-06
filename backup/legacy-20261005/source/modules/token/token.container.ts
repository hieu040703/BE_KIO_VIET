import { Container, ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { TokenController } from "./token.controller";
import { TokenService } from "./token.service";
import { TokenRepository } from "./token.repository";
import { TokenRouter } from "./token.route";
import { TOKEN_TYPES } from "./token.types";

// export const tokenContainer = new Container();

// // Bind token dependencies
// tokenContainer.bind<TokenController>(TOKEN_TYPES.TokenController).to(TokenController);
// tokenContainer.bind<TokenService>(TOKEN_TYPES.TokenService).to(TokenService);
// tokenContainer.bind<TokenRepository>(TOKEN_TYPES.TokenRepository).to(TokenRepository);
// tokenContainer.bind<TokenRouter>(TOKEN_TYPES.TokenRouter).to(TokenRouter);

// // export { TOKEN_TYPES };

const tokenModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<TokenController>(TOKEN_TYPES.TokenController).to(TokenController);
  options.bind<TokenService>(TOKEN_TYPES.TokenService).to(TokenService);
  options.bind<TokenRepository>(TOKEN_TYPES.TokenRepository).to(TokenRepository);
  options.bind<TokenRouter>(TOKEN_TYPES.TokenRouter).to(TokenRouter);
});

export { tokenModule };
