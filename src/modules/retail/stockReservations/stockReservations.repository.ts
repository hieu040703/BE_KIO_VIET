import { injectable } from "inversify";
import { RetailStockReservations } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { STOCKRESERVATIONS_RESOURCE } from "./stockReservations.types";

@injectable()
export class RetailStockReservationsRepository extends BaseRepository<RetailStockReservations> {
  protected entityClass = RetailStockReservations;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[STOCKRESERVATIONS_RESOURCE];
  }
}
