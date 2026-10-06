import { BaseRepository } from "@/shared/base/BaseRepository";
import { SupportRoom } from "@/database/models/SupportRoom";
import { FindOptionsSelect } from "typeorm";
import { SupportRoomSelectFull, SupportRoomRelations } from "./supportRoom.select";
import { injectable, inject } from "inversify";

@injectable()
export class AdminSupportRoomRepository extends BaseRepository<SupportRoom> {
  protected entityClass = SupportRoom;
  protected selectedFields = SupportRoomSelectFull;
  protected relations = SupportRoomRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<SupportRoom> | undefined): void {
    this.selectedFields = selectedFields || SupportRoomSelectFull;
    this.relations = SupportRoomRelations;
  }
}
