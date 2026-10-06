import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailUser } from "@/database/models";
import { RetailUsersRepository } from "./users.repository";
import { RETAIL_USERS_TYPES } from "./users.types";

@injectable()
export class RetailUsersService extends BaseService<RetailUser> {
  constructor(@inject(RETAIL_USERS_TYPES.Repository) repository: RetailUsersRepository) {
    super(repository);
  }
}
