import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCashSessions } from "@/database/models/retail/RetailGenericEntities";
import { RetailCashSessionsRepository } from "./cashSessions.repository";
import { RETAIL_CASH_SESSIONS_TYPES } from "./cashSessions.types";

@injectable()
export class RetailCashSessionsService extends BaseService<RetailCashSessions> {
  constructor(@inject(RETAIL_CASH_SESSIONS_TYPES.Repository) repository: RetailCashSessionsRepository) {
    super(repository);
  }
}
