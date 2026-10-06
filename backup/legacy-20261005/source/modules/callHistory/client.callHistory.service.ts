import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { ClientCallHistoryRepository } from "./client.callHistory.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { CALL_HISTORY_TYPES } from "./callHistory.types";
import { COMMON_TYPES } from "../common/common.types";
import { CallHistory } from "@/database/models/CallHistory";
import { CallHistoryRelations, CallHistorySelectFull } from "./callHistory.select";

@injectable()
export class ClientCallHistoryService extends BaseService<CallHistory> {
  protected relations = CallHistoryRelations;
  protected selectedFields = CallHistorySelectFull;
  constructor(
    @inject(CALL_HISTORY_TYPES.ClientCallHistoryRepository) private callHistoryRepository: ClientCallHistoryRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(callHistoryRepository);
  }
}
