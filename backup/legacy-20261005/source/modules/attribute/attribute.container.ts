import { Container, ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AttributeController } from "./attribute.controller";
import { AttributeService } from "./attribute.service";
import { AttributeRepository } from "./attribute.repository";
import { AdminAttributeRouter } from "./admin.attribute.route";
import { ClientAttributeRouter } from "./client.attribute.route";
import { ATTRIBUTE_TYPES } from "./attribute.types";

// const attributeContainer = new Container();

// attributeContainer.bind<AttributeService>(ATTRIBUTE_TYPES.AttributeService).to(AttributeService);
// attributeContainer.bind<AttributeController>(ATTRIBUTE_TYPES.AttributeController).to(AttributeController);
// attributeContainer.bind<AttributeRepository>(ATTRIBUTE_TYPES.AttributeRepository).to(AttributeRepository);
// attributeContainer.bind<AdminAttributeRouter>(ATTRIBUTE_TYPES.AdminAttributeRouter).to(AdminAttributeRouter);
// attributeContainer.bind<ClientAttributeRouter>(ATTRIBUTE_TYPES.ClientAttributeRouter).to(ClientAttributeRouter);

// export { attributeContainer };

const attributeModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AttributeService>(ATTRIBUTE_TYPES.AttributeService).to(AttributeService);
  options.bind<AttributeController>(ATTRIBUTE_TYPES.AttributeController).to(AttributeController);
  options.bind<AttributeRepository>(ATTRIBUTE_TYPES.AttributeRepository).to(AttributeRepository);
  options.bind<AdminAttributeRouter>(ATTRIBUTE_TYPES.AdminAttributeRouter).to(AdminAttributeRouter);
  options.bind<ClientAttributeRouter>(ATTRIBUTE_TYPES.ClientAttributeRouter).to(ClientAttributeRouter);
});

export { attributeModule };
