import { injectable } from "inversify";
import { FindOptionsSelect } from "typeorm";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { Announcement } from "@/database/models/Announcement";
import { AnnouncementRelations, AnnouncementSelectFull } from "./announcement.select";

@injectable()
export class AnnouncementRepository extends BaseRepository<Announcement> {
  protected entityClass = Announcement;
  protected selectedFields = AnnouncementSelectFull;
  protected relations = AnnouncementRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Announcement> | undefined): void {
    this.selectedFields = selectedFields || AnnouncementSelectFull;
    this.relations = AnnouncementRelations;
  }
}
