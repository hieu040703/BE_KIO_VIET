import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailSuppliers } from "@/database/models/retail/RetailGenericEntities";
import { RetailSuppliersRepository } from "./suppliers.repository";
import { RETAIL_SUPPLIERS_TYPES } from "./suppliers.types";

@injectable()
export class RetailSuppliersService extends BaseService<RetailSuppliers> {
  constructor(@inject(RETAIL_SUPPLIERS_TYPES.Repository) repository: RetailSuppliersRepository) {
    super(repository);
  }
}
