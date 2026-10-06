import { injectable } from "inversify";
import { RetailGoodsReceipts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { GOODSRECEIPTS_RESOURCE } from "./goodsReceipts.types";

@injectable()
export class RetailGoodsReceiptsRepository extends BaseRepository<RetailGoodsReceipts> {
  protected entityClass = RetailGoodsReceipts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[GOODSRECEIPTS_RESOURCE];
  }
}
