import { injectable, inject } from "inversify";
import { RetailReceiptsService } from "./receipts.service";
import { RETAIL_RECEIPTS_TYPES } from "./receipts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailReceiptsController extends BaseController<RetailReceiptsService> {
  constructor(@inject(RETAIL_RECEIPTS_TYPES.Service) protected service: RetailReceiptsService) {
    super(service);
  }
}
