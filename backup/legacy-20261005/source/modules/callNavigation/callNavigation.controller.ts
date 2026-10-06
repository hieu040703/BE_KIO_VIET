import { injectable, inject } from "inversify";
    import { CallNavigationService } from "./callNavigation.service";
    import { CALL_NAVIGATION_TYPES } from "./callNavigation.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class CallNavigationController extends BaseController<CallNavigationService> {
      constructor(@inject(CALL_NAVIGATION_TYPES.CallNavigationService) protected service: CallNavigationService) {
        super(service);
      }
    }
    