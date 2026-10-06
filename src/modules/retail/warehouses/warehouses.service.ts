import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailWarehouse } from "@/database/models";
import { RetailWarehousesRepository } from "./warehouses.repository";
import { RETAIL_WAREHOUSES_TYPES } from "./warehouses.types";

@injectable()
export class RetailWarehousesService extends BaseService<RetailWarehouse> {
  constructor(@inject(RETAIL_WAREHOUSES_TYPES.Repository) repository: RetailWarehousesRepository) {
    super(repository);
  }
}
