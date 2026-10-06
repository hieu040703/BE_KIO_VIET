import { injectable } from "inversify";
import { RetailPermissions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PERMISSIONS_RESOURCE } from "./permissions.types";

@injectable()
export class RetailPermissionsRepository extends BaseRepository<RetailPermissions> {
  protected entityClass = RetailPermissions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PERMISSIONS_RESOURCE];
  }
}
