import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailInventory } from "@/database/models";
import { RetailInventoriesRepository } from "./inventories.repository";
import { RETAIL_INVENTORIES_TYPES } from "./inventories.types";

@injectable()
export class RetailInventoriesService extends BaseService<RetailInventory> {
  constructor(@inject(RETAIL_INVENTORIES_TYPES.Repository) repository: RetailInventoriesRepository) {
    super(repository);
  }
}
