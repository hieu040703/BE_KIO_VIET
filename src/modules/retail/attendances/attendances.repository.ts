import { injectable } from "inversify";
import { RetailAttendance } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ATTENDANCES_RESOURCE } from "./attendances.types";

@injectable()
export class RetailAttendancesRepository extends BaseRepository<RetailAttendance> {
  protected entityClass = RetailAttendance;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ATTENDANCES_RESOURCE];
  }
}
