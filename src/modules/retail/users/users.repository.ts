import { injectable } from "inversify";
import { RetailUser } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { USERS_RESOURCE } from "./users.types";

@injectable()
export class RetailUsersRepository extends BaseRepository<RetailUser> {
  protected entityClass = RetailUser;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[USERS_RESOURCE];
  }
}
