import { injectable, inject } from "inversify";
import { RetailPenaltiesService } from "./penalties.service";
import { RETAIL_PENALTIES_TYPES } from "./penalties.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPenaltiesController extends BaseController<RetailPenaltiesService> {
  constructor(@inject(RETAIL_PENALTIES_TYPES.Service) protected service: RetailPenaltiesService) {
    super(service);
  }
}
