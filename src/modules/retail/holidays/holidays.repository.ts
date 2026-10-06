import { injectable } from "inversify";
import { RetailHolidays } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { HOLIDAYS_RESOURCE } from "./holidays.types";

@injectable()
export class RetailHolidaysRepository extends BaseRepository<RetailHolidays> {
  protected entityClass = RetailHolidays;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[HOLIDAYS_RESOURCE];
  }
}
