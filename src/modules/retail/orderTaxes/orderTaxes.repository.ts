import { injectable } from "inversify";
import { RetailOrderTaxes } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ORDERTAXES_RESOURCE } from "./orderTaxes.types";

@injectable()
export class RetailOrderTaxesRepository extends BaseRepository<RetailOrderTaxes> {
  protected entityClass = RetailOrderTaxes;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ORDERTAXES_RESOURCE];
  }
}
