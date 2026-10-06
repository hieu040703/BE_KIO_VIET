import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailReconciliations } from "@/database/models/retail/RetailGenericEntities";
import { RetailReconciliationsRepository } from "./reconciliations.repository";
import { RETAIL_RECONCILIATIONS_TYPES } from "./reconciliations.types";

@injectable()
export class RetailReconciliationsService extends BaseService<RetailReconciliations> {
  constructor(@inject(RETAIL_RECONCILIATIONS_TYPES.Repository) repository: RetailReconciliationsRepository) {
    super(repository);
  }
}
