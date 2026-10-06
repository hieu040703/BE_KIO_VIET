import { injectable } from "inversify";
import { RetailOrderNotes } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ORDERNOTES_RESOURCE } from "./orderNotes.types";

@injectable()
export class RetailOrderNotesRepository extends BaseRepository<RetailOrderNotes> {
  protected entityClass = RetailOrderNotes;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ORDERNOTES_RESOURCE];
  }
}
