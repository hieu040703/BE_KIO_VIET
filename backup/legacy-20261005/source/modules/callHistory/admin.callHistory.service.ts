import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { AdminCallHistoryRepository } from "./admin.callHistory.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { CALL_HISTORY_TYPES } from "./callHistory.types";
import { COMMON_TYPES } from "../common/common.types";
import { CallHistory } from "@/database/models/CallHistory";
import { CallHistoryRelations, CallHistorySelectFull } from "./callHistory.select";

@injectable()
export class AdminCallHistoryService extends BaseService<CallHistory> {
  protected relations = CallHistoryRelations;
  protected selectedFields = CallHistorySelectFull;
  constructor(
    @inject(CALL_HISTORY_TYPES.AdminCallHistoryRepository) private callHistoryRepository: AdminCallHistoryRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(callHistoryRepository);
  }
}
