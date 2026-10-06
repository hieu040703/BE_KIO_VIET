import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailOrderNotes } from "@/database/models/retail/RetailGenericEntities";
import { RetailOrderNotesRepository } from "./orderNotes.repository";
import { RETAIL_ORDER_NOTES_TYPES } from "./orderNotes.types";

@injectable()
export class RetailOrderNotesService extends BaseService<RetailOrderNotes> {
  constructor(@inject(RETAIL_ORDER_NOTES_TYPES.Repository) repository: RetailOrderNotesRepository) {
    super(repository);
  }
}
