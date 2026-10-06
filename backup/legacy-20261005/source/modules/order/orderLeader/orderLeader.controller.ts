import { injectable, inject } from "inversify";
    import { OrderLeaderService } from "./orderLeader.service";
    import { ORDER_LEADER_TYPES } from "./orderLeader.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class OrderLeaderController extends BaseController<OrderLeaderService> {
      constructor(@inject(ORDER_LEADER_TYPES.OrderLeaderService) protected service: OrderLeaderService) {
        super(service);
      }
    }
    