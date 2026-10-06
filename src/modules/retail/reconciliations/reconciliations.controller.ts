import { injectable, inject } from "inversify";
import { RetailReconciliationsService } from "./reconciliations.service";
import { RETAIL_RECONCILIATIONS_TYPES } from "./reconciliations.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailReconciliationsController extends BaseController<RetailReconciliationsService> {
  constructor(@inject(RETAIL_RECONCILIATIONS_TYPES.Service) protected service: RetailReconciliationsService) {
    super(service);
  }
}
