import { injectable } from "inversify";
import { RetailProductBarcodes } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PRODUCTBARCODES_RESOURCE } from "./productBarcodes.types";

@injectable()
export class RetailProductBarcodesRepository extends BaseRepository<RetailProductBarcodes> {
  protected entityClass = RetailProductBarcodes;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PRODUCTBARCODES_RESOURCE];
  }
}
