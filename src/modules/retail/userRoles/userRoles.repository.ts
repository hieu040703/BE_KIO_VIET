import { injectable } from "inversify";
import { RetailUserRoles } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { USERROLES_RESOURCE } from "./userRoles.types";

@injectable()
export class RetailUserRolesRepository extends BaseRepository<RetailUserRoles> {
  protected entityClass = RetailUserRoles;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[USERROLES_RESOURCE];
  }
}
