import { injectable } from "inversify";
import { RetailWarehouse } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { WAREHOUSES_RESOURCE } from "./warehouses.types";

@injectable()
export class RetailWarehousesRepository extends BaseRepository<RetailWarehouse> {
  protected entityClass = RetailWarehouse;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[WAREHOUSES_RESOURCE];
  }
}
