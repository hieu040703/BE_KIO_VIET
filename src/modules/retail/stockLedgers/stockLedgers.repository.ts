import { injectable } from "inversify";
import { RetailStockLedger } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { STOCKLEDGERS_RESOURCE } from "./stockLedgers.types";

@injectable()
export class RetailStockLedgersRepository extends BaseRepository<RetailStockLedger> {
  protected entityClass = RetailStockLedger;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[STOCKLEDGERS_RESOURCE];
  }
}
