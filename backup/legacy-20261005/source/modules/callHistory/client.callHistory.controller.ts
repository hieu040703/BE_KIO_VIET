import { injectable, inject } from "inversify";
    import { ClientCallHistoryService } from "./client.callHistory.service";
    import { CALL_HISTORY_TYPES } from "./callHistory.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class ClientCallHistoryController extends BaseController<ClientCallHistoryService> {
      constructor(@inject(CALL_HISTORY_TYPES.ClientCallHistoryService) protected service: ClientCallHistoryService) {
        super(service);
      }
    }
    