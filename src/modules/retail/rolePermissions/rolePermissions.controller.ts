import { injectable, inject } from "inversify";
import { RetailRolePermissionsService } from "./rolePermissions.service";
import { RETAIL_ROLE_PERMISSIONS_TYPES } from "./rolePermissions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailRolePermissionsController extends BaseController<RetailRolePermissionsService> {
  constructor(@inject(RETAIL_ROLE_PERMISSIONS_TYPES.Service) protected service: RetailRolePermissionsService) {
    super(service);
  }
}
