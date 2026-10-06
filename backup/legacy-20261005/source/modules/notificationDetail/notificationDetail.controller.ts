import { injectable, inject } from "inversify";
    import { NotificationDetailService } from "./notificationDetail.service";
    import { NOTIFICATION_DETAIL_TYPES } from "./notificationDetail.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class NotificationDetailController extends BaseController<NotificationDetailService> {
      constructor(@inject(NOTIFICATION_DETAIL_TYPES.NotificationDetailService) protected service: NotificationDetailService) {
        super(service);
      }
    }
    