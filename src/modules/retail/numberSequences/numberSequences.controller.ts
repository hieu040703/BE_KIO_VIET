import { injectable, inject } from "inversify";
import { RetailNumberSequencesService } from "./numberSequences.service";
import { RETAIL_NUMBER_SEQUENCES_TYPES } from "./numberSequences.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailNumberSequencesController extends BaseController<RetailNumberSequencesService> {
  constructor(@inject(RETAIL_NUMBER_SEQUENCES_TYPES.Service) protected service: RetailNumberSequencesService) {
    super(service);
  }
}
