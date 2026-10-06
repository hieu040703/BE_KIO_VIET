import { injectable } from "inversify";
import { RetailGoodsReceiptItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { GOODSRECEIPTITEMS_RESOURCE } from "./goodsReceiptItems.types";

@injectable()
export class RetailGoodsReceiptItemsRepository extends BaseRepository<RetailGoodsReceiptItems> {
  protected entityClass = RetailGoodsReceiptItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[GOODSRECEIPTITEMS_RESOURCE];
  }
}
