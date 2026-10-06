import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailRolePermissions } from "@/database/models/retail/RetailGenericEntities";
import { RetailRolePermissionsRepository } from "./rolePermissions.repository";
import { RETAIL_ROLE_PERMISSIONS_TYPES } from "./rolePermissions.types";

@injectable()
export class RetailRolePermissionsService extends BaseService<RetailRolePermissions> {
  constructor(@inject(RETAIL_ROLE_PERMISSIONS_TYPES.Repository) repository: RetailRolePermissionsRepository) {
    super(repository);
  }
}
