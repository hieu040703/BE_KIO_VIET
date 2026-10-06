import { injectable, inject } from "inversify";
import { RetailShipmentsService } from "./shipments.service";
import { RETAIL_SHIPMENTS_TYPES } from "./shipments.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailShipmentsController extends BaseController<RetailShipmentsService> {
  constructor(@inject(RETAIL_SHIPMENTS_TYPES.Service) protected service: RetailShipmentsService) {
    super(service);
  }
}
