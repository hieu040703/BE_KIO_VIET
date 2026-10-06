import { injectable, inject } from "inversify";
import { RetailPermissionsService } from "./permissions.service";
import { RETAIL_PERMISSIONS_TYPES } from "./permissions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPermissionsController extends BaseController<RetailPermissionsService> {
  constructor(@inject(RETAIL_PERMISSIONS_TYPES.Service) protected service: RetailPermissionsService) {
    super(service);
  }
}
