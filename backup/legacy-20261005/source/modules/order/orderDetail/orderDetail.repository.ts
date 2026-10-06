import { BaseRepository } from "@/shared/base/BaseRepository";
    import { OrderDetail } from "@/database/models/OrderDetail";
    import { FindOptionsSelect } from "typeorm";
    import { OrderDetailSelectFull, OrderDetailRelations } from "./orderDetail.select";
    import { injectable, inject } from "inversify";

    @injectable()
    export class OrderDetailRepository extends BaseRepository<OrderDetail> {
      protected entityClass = OrderDetail;
      protected selectedFields = OrderDetailSelectFull;
      protected relations = OrderDetailRelations;

      constructor() {
        super();
        this.setOptions();
      }

      setOptions(selectedFields?: FindOptionsSelect<OrderDetail> | undefined): void {
        this.selectedFields = selectedFields || OrderDetailSelectFull;
        this.relations = OrderDetailRelations;
      }
    }
    