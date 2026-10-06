import { injectable, inject } from "inversify";
import { RetailUserSessionsService } from "./userSessions.service";
import { RETAIL_USER_SESSIONS_TYPES } from "./userSessions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailUserSessionsController extends BaseController<RetailUserSessionsService> {
  constructor(@inject(RETAIL_USER_SESSIONS_TYPES.Service) protected service: RetailUserSessionsService) {
    super(service);
  }
}
