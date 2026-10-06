import { injectable } from "inversify";
import { RetailCashbooks } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CASHBOOKS_RESOURCE } from "./cashbooks.types";

@injectable()
export class RetailCashbooksRepository extends BaseRepository<RetailCashbooks> {
  protected entityClass = RetailCashbooks;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CASHBOOKS_RESOURCE];
  }
}
