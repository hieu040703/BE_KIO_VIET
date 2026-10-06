import { injectable, inject } from "inversify";
import { RetailCustomerNotesService } from "./customerNotes.service";
import { RETAIL_CUSTOMER_NOTES_TYPES } from "./customerNotes.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerNotesController extends BaseController<RetailCustomerNotesService> {
  constructor(@inject(RETAIL_CUSTOMER_NOTES_TYPES.Service) protected service: RetailCustomerNotesService) {
    super(service);
  }
}
