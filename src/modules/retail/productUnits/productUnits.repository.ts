import { injectable } from "inversify";
import { RetailProductUnits } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PRODUCTUNITS_RESOURCE } from "./productUnits.types";

@injectable()
export class RetailProductUnitsRepository extends BaseRepository<RetailProductUnits> {
  protected entityClass = RetailProductUnits;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PRODUCTUNITS_RESOURCE];
  }
}
