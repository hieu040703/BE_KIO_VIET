import { injectable } from "inversify";
import { RetailReceipts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { RECEIPTS_RESOURCE } from "./receipts.types";

@injectable()
export class RetailReceiptsRepository extends BaseRepository<RetailReceipts> {
  protected entityClass = RetailReceipts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[RECEIPTS_RESOURCE];
  }
}
