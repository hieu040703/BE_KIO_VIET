import { injectable, inject } from "inversify";
import { RetailUsersService } from "./users.service";
import { RETAIL_USERS_TYPES } from "./users.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailUsersController extends BaseController<RetailUsersService> {
  constructor(@inject(RETAIL_USERS_TYPES.Service) protected service: RetailUsersService) {
    super(service);
  }
}
