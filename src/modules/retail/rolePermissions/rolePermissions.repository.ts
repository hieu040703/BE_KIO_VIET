import { injectable } from "inversify";
import { RetailRolePermissions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ROLEPERMISSIONS_RESOURCE } from "./rolePermissions.types";

@injectable()
export class RetailRolePermissionsRepository extends BaseRepository<RetailRolePermissions> {
  protected entityClass = RetailRolePermissions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ROLEPERMISSIONS_RESOURCE];
  }
}
