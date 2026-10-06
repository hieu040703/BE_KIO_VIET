import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailUserRoles } from "@/database/models/retail/RetailGenericEntities";
import { RetailUserRolesRepository } from "./userRoles.repository";
import { RETAIL_USER_ROLES_TYPES } from "./userRoles.types";

@injectable()
export class RetailUserRolesService extends BaseService<RetailUserRoles> {
  constructor(@inject(RETAIL_USER_ROLES_TYPES.Repository) repository: RetailUserRolesRepository) {
    super(repository);
  }
}
