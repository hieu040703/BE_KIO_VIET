import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailUserSessions } from "@/database/models/retail/RetailGenericEntities";
import { RetailUserSessionsRepository } from "./userSessions.repository";
import { RETAIL_USER_SESSIONS_TYPES } from "./userSessions.types";

@injectable()
export class RetailUserSessionsService extends BaseService<RetailUserSessions> {
  constructor(@inject(RETAIL_USER_SESSIONS_TYPES.Repository) repository: RetailUserSessionsRepository) {
    super(repository);
  }
}
