import { BaseRepository } from "@/shared/base/BaseRepository";
import { NotificationDetail } from "@/database/models/NotificationDetail";
import { EntityManager, FindOptionsSelect } from "typeorm";
import { NotificationDetailSelectFull, NotificationDetailRelations } from "./notificationDetail.select";
import { injectable, inject } from "inversify";

@injectable()
export class NotificationDetailRepository extends BaseRepository<NotificationDetail> {
  protected entityClass = NotificationDetail;
  protected selectedFields = NotificationDetailSelectFull;
  protected relations = NotificationDetailRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<NotificationDetail> | undefined): void {
    this.selectedFields = selectedFields || NotificationDetailSelectFull;
    this.relations = NotificationDetailRelations;
  }
}
