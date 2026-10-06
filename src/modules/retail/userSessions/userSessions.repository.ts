import { injectable } from "inversify";
import { RetailUserSessions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { USERSESSIONS_RESOURCE } from "./userSessions.types";

@injectable()
export class RetailUserSessionsRepository extends BaseRepository<RetailUserSessions> {
  protected entityClass = RetailUserSessions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[USERSESSIONS_RESOURCE];
  }
}
