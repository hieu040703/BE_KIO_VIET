import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailStores } from "@/database/models/retail/RetailGenericEntities";
import { RetailStoresRepository } from "./stores.repository";
import { RETAIL_STORES_TYPES } from "./stores.types";

@injectable()
export class RetailStoresService extends BaseService<RetailStores> {
  constructor(@inject(RETAIL_STORES_TYPES.Repository) repository: RetailStoresRepository) {
    super(repository);
  }
}
