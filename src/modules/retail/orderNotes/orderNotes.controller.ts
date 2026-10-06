import { injectable, inject } from "inversify";
import { RetailOrderNotesService } from "./orderNotes.service";
import { RETAIL_ORDER_NOTES_TYPES } from "./orderNotes.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailOrderNotesController extends BaseController<RetailOrderNotesService> {
  constructor(@inject(RETAIL_ORDER_NOTES_TYPES.Service) protected service: RetailOrderNotesService) {
    super(service);
  }
}
