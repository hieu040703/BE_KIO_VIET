import { injectable, inject } from "inversify";
    import { ServicePriceService } from "./servicePrice.service";
    import { SERVICE_PRICE_TYPES } from "./servicePrice.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class ServicePriceController extends BaseController<ServicePriceService> {
      constructor(@inject(SERVICE_PRICE_TYPES.ServicePriceService) protected service: ServicePriceService) {
        super(service);
      }
    }
    