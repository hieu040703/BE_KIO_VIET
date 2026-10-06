import { injectable, inject } from "inversify";
import { RetailRolesService } from "./roles.service";
import { RETAIL_ROLES_TYPES } from "./roles.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailRolesController extends BaseController<RetailRolesService> {
  constructor(@inject(RETAIL_ROLES_TYPES.Service) protected service: RetailRolesService) {
    super(service);
  }
}
