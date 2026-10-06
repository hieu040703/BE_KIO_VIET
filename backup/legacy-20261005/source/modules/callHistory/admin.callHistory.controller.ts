import { injectable, inject } from "inversify";
    import { AdminCallHistoryService } from "./admin.callHistory.service";
    import { CALL_HISTORY_TYPES } from "./callHistory.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class AdminCallHistoryController extends BaseController<AdminCallHistoryService> {
      constructor(@inject(CALL_HISTORY_TYPES.AdminCallHistoryService) protected service: AdminCallHistoryService) {
        super(service);
      }
    }
    