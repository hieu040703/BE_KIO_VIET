import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { ANNOUNCEMENT_TYPES } from "./announcement.types";
import { AnnouncementRepository } from "./announcement.repository";
import { AnnouncementService } from "./announcement.service";
import { AnnouncementController } from "./announcement.controller";
import { AnnouncementRouter } from "./announcement.route";

const announcementModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AnnouncementRepository>(ANNOUNCEMENT_TYPES.AnnouncementRepository).to(AnnouncementRepository);
  options.bind<AnnouncementService>(ANNOUNCEMENT_TYPES.AnnouncementService).to(AnnouncementService);
  options.bind<AnnouncementController>(ANNOUNCEMENT_TYPES.AnnouncementController).to(AnnouncementController);
  options.bind<AnnouncementRouter>(ANNOUNCEMENT_TYPES.AnnouncementRouter).to(AnnouncementRouter);
});

export { announcementModule };
