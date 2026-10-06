import { injectable, inject } from "inversify";
    import { ClientServiceService } from "./client.service.service";
    import { SERVICE_TYPES } from "./service.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class ClientServiceController extends BaseController<ClientServiceService> {
      constructor(@inject(SERVICE_TYPES.ClientServiceService) protected service: ClientServiceService) {
        super(service);
      }
    }
    