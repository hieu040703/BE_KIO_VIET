import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailReturns } from "@/database/models/retail/RetailGenericEntities";
import { RetailReturnsRepository } from "./returns.repository";
import { RETAIL_RETURNS_TYPES } from "./returns.types";

@injectable()
export class RetailReturnsService extends BaseService<RetailReturns> {
  constructor(@inject(RETAIL_RETURNS_TYPES.Repository) repository: RetailReturnsRepository) {
    super(repository);
  }
}
