import { injectable } from "inversify";
import { RetailNumberSequences } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { NUMBERSEQUENCES_RESOURCE } from "./numberSequences.types";

@injectable()
export class RetailNumberSequencesRepository extends BaseRepository<RetailNumberSequences> {
  protected entityClass = RetailNumberSequences;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[NUMBERSEQUENCES_RESOURCE];
  }
}
