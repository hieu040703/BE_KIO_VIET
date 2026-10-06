import { injectable } from "inversify";
import { RetailRoles } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ROLES_RESOURCE } from "./roles.types";

@injectable()
export class RetailRolesRepository extends BaseRepository<RetailRoles> {
  protected entityClass = RetailRoles;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ROLES_RESOURCE];
  }
}
