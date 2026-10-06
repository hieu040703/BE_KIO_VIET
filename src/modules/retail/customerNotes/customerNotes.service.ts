import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerNotes } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerNotesRepository } from "./customerNotes.repository";
import { RETAIL_CUSTOMER_NOTES_TYPES } from "./customerNotes.types";

@injectable()
export class RetailCustomerNotesService extends BaseService<RetailCustomerNotes> {
  constructor(@inject(RETAIL_CUSTOMER_NOTES_TYPES.Repository) repository: RetailCustomerNotesRepository) {
    super(repository);
  }
}
