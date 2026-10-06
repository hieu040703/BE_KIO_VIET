import { injectable } from "inversify";
import { RetailCashMovements } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CASHMOVEMENTS_RESOURCE } from "./cashMovements.types";

@injectable()
export class RetailCashMovementsRepository extends BaseRepository<RetailCashMovements> {
  protected entityClass = RetailCashMovements;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CASHMOVEMENTS_RESOURCE];
  }
}
