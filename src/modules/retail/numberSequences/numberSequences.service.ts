import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailNumberSequences } from "@/database/models/retail/RetailGenericEntities";
import { RetailNumberSequencesRepository } from "./numberSequences.repository";
import { RETAIL_NUMBER_SEQUENCES_TYPES } from "./numberSequences.types";

@injectable()
export class RetailNumberSequencesService extends BaseService<RetailNumberSequences> {
  constructor(@inject(RETAIL_NUMBER_SEQUENCES_TYPES.Repository) repository: RetailNumberSequencesRepository) {
    super(repository);
  }
}
