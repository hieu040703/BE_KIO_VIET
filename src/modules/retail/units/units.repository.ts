import { injectable } from "inversify";
import { RetailUnits } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { UNITS_RESOURCE } from "./units.types";

@injectable()
export class RetailUnitsRepository extends BaseRepository<RetailUnits> {
  protected entityClass = RetailUnits;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[UNITS_RESOURCE];
  }
}
