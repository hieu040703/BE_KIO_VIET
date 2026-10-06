import { injectable, inject } from "inversify";
    import { AdminServiceService } from "./admin.service.service";
    import { SERVICE_TYPES } from "./service.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class AdminServiceController extends BaseController<AdminServiceService> {
      constructor(@inject(SERVICE_TYPES.AdminServiceService) protected service: AdminServiceService) {
        super(service);
      }
    }
    