import { injectable, inject } from "inversify";
import { RetailCashSessionsService } from "./cashSessions.service";
import { RETAIL_CASH_SESSIONS_TYPES } from "./cashSessions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCashSessionsController extends BaseController<RetailCashSessionsService> {
  constructor(@inject(RETAIL_CASH_SESSIONS_TYPES.Service) protected service: RetailCashSessionsService) {
    super(service);
  }
}
