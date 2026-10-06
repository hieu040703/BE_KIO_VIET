import { injectable, inject } from "inversify";
import { RetailReturnsService } from "./returns.service";
import { RETAIL_RETURNS_TYPES } from "./returns.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailReturnsController extends BaseController<RetailReturnsService> {
  constructor(@inject(RETAIL_RETURNS_TYPES.Service) protected service: RetailReturnsService) {
    super(service);
  }
}
