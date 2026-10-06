import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailTagsController } from "./tags.controller";
import { RetailTagsRepository } from "./tags.repository";
import { RetailTagsRouter } from "./tags.route";
import { RetailTagsService } from "./tags.service";
import { RETAIL_TAGS_TYPES } from "./tags.types";

export const tagsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailTagsRepository>(RETAIL_TAGS_TYPES.Repository).to(RetailTagsRepository);
  options.bind<RetailTagsService>(RETAIL_TAGS_TYPES.Service).to(RetailTagsService);
  options.bind<RetailTagsController>(RETAIL_TAGS_TYPES.Controller).to(RetailTagsController);
  options.bind<RetailTagsRouter>(RETAIL_TAGS_TYPES.Router).to(RetailTagsRouter);
});
