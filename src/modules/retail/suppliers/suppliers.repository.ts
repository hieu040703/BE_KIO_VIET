import { injectable } from "inversify";
import { RetailSuppliers } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SUPPLIERS_RESOURCE } from "./suppliers.types";

@injectable()
export class RetailSuppliersRepository extends BaseRepository<RetailSuppliers> {
  protected entityClass = RetailSuppliers;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SUPPLIERS_RESOURCE];
  }
}
