import { injectable, inject } from "inversify";
import { RetailCashRegistersService } from "./cashRegisters.service";
import { RETAIL_CASH_REGISTERS_TYPES } from "./cashRegisters.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCashRegistersController extends BaseController<RetailCashRegistersService> {
  constructor(@inject(RETAIL_CASH_REGISTERS_TYPES.Service) protected service: RetailCashRegistersService) {
    super(service);
  }
}
