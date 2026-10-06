import { injectable, inject } from "inversify";
import { RetailSerialNumbersService } from "./serialNumbers.service";
import { RETAIL_SERIAL_NUMBERS_TYPES } from "./serialNumbers.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailSerialNumbersController extends BaseController<RetailSerialNumbersService> {
  constructor(@inject(RETAIL_SERIAL_NUMBERS_TYPES.Service) protected service: RetailSerialNumbersService) {
    super(service);
  }
}
