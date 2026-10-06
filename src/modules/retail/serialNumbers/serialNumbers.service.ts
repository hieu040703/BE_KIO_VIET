import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailSerialNumbers } from "@/database/models/retail/RetailGenericEntities";
import { RetailSerialNumbersRepository } from "./serialNumbers.repository";
import { RETAIL_SERIAL_NUMBERS_TYPES } from "./serialNumbers.types";

@injectable()
export class RetailSerialNumbersService extends BaseService<RetailSerialNumbers> {
  constructor(@inject(RETAIL_SERIAL_NUMBERS_TYPES.Repository) repository: RetailSerialNumbersRepository) {
    super(repository);
  }
}
