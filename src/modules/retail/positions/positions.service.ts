import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPositions } from "@/database/models/retail/RetailGenericEntities";
import { RetailPositionsRepository } from "./positions.repository";
import { RETAIL_POSITIONS_TYPES } from "./positions.types";

@injectable()
export class RetailPositionsService extends BaseService<RetailPositions> {
  constructor(@inject(RETAIL_POSITIONS_TYPES.Repository) repository: RetailPositionsRepository) {
    super(repository);
  }
}
