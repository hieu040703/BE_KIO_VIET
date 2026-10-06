import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCashRegisters } from "@/database/models/retail/RetailGenericEntities";
import { RetailCashRegistersRepository } from "./cashRegisters.repository";
import { RETAIL_CASH_REGISTERS_TYPES } from "./cashRegisters.types";

@injectable()
export class RetailCashRegistersService extends BaseService<RetailCashRegisters> {
  constructor(@inject(RETAIL_CASH_REGISTERS_TYPES.Repository) repository: RetailCashRegistersRepository) {
    super(repository);
  }
}
