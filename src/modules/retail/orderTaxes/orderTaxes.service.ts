import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailOrderTaxes } from "@/database/models/retail/RetailGenericEntities";
import { RetailOrderTaxesRepository } from "./orderTaxes.repository";
import { RETAIL_ORDER_TAXES_TYPES } from "./orderTaxes.types";

@injectable()
export class RetailOrderTaxesService extends BaseService<RetailOrderTaxes> {
  constructor(@inject(RETAIL_ORDER_TAXES_TYPES.Repository) repository: RetailOrderTaxesRepository) {
    super(repository);
  }
}
