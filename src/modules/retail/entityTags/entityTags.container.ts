import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEntityTagsController } from "./entityTags.controller";
import { RetailEntityTagsRepository } from "./entityTags.repository";
import { RetailEntityTagsRouter } from "./entityTags.route";
import { RetailEntityTagsService } from "./entityTags.service";
import { RETAIL_ENTITY_TAGS_TYPES } from "./entityTags.types";

export const entityTagsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEntityTagsRepository>(RETAIL_ENTITY_TAGS_TYPES.Repository).to(RetailEntityTagsRepository);
  options.bind<RetailEntityTagsService>(RETAIL_ENTITY_TAGS_TYPES.Service).to(RetailEntityTagsService);
  options.bind<RetailEntityTagsController>(RETAIL_ENTITY_TAGS_TYPES.Controller).to(RetailEntityTagsController);
  options.bind<RetailEntityTagsRouter>(RETAIL_ENTITY_TAGS_TYPES.Router).to(RetailEntityTagsRouter);
});
