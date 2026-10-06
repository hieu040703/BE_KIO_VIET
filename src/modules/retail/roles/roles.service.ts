import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailRoles } from "@/database/models/retail/RetailGenericEntities";
import { RetailRolesRepository } from "./roles.repository";
import { RETAIL_ROLES_TYPES } from "./roles.types";

@injectable()
export class RetailRolesService extends BaseService<RetailRoles> {
  constructor(@inject(RETAIL_ROLES_TYPES.Repository) repository: RetailRolesRepository) {
    super(repository);
  }
}
