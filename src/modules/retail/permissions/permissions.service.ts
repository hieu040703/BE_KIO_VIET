import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPermissions } from "@/database/models/retail/RetailGenericEntities";
import { RetailPermissionsRepository } from "./permissions.repository";
import { RETAIL_PERMISSIONS_TYPES } from "./permissions.types";

@injectable()
export class RetailPermissionsService extends BaseService<RetailPermissions> {
  constructor(@inject(RETAIL_PERMISSIONS_TYPES.Repository) repository: RetailPermissionsRepository) {
    super(repository);
  }
}
