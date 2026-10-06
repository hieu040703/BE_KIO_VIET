import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { NotificationDetailRepository } from "./notificationDetail.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { NOTIFICATION_DETAIL_TYPES } from "./notificationDetail.types";
import { COMMON_TYPES } from "../common/common.types";
import { NotificationDetail } from "@/database/models/NotificationDetail";
import { NotificationDetailRelations, NotificationDetailSelectFull } from "./notificationDetail.select";

@injectable()
export class NotificationDetailService extends BaseService<NotificationDetail> {
  protected relations = NotificationDetailRelations;
  protected selectedFields = NotificationDetailSelectFull;
  constructor(
    @inject(NOTIFICATION_DETAIL_TYPES.NotificationDetailRepository)
    private notificationDetailRepository: NotificationDetailRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager
  ) {
    super(notificationDetailRepository);
  }
}
