import { injectable } from "inversify";
import { RetailCustomerNotes } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERNOTES_RESOURCE } from "./customerNotes.types";

@injectable()
export class RetailCustomerNotesRepository extends BaseRepository<RetailCustomerNotes> {
  protected entityClass = RetailCustomerNotes;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERNOTES_RESOURCE];
  }
}
