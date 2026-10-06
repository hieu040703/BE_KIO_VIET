import { injectable, inject } from "inversify";
import { RetailUserRolesService } from "./userRoles.service";
import { RETAIL_USER_ROLES_TYPES } from "./userRoles.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailUserRolesController extends BaseController<RetailUserRolesService> {
  constructor(@inject(RETAIL_USER_ROLES_TYPES.Service) protected service: RetailUserRolesService) {
    super(service);
  }
}
