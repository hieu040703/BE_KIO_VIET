import { BaseRepository } from "@/shared/base/BaseRepository";
import { CallNavigation } from "@/database/models/CallNavigation";
import { FindOptionsSelect } from "typeorm";
import { CallNavigationSelectFull, CallNavigationRelations } from "./callNavigation.select";
import { injectable, inject } from "inversify";
import { callHistoryModule } from "../callHistory/callHistory.container";
import { IEntityManager } from "@/shared/types/interfaces";

@injectable()
export class CallNavigationRepository extends BaseRepository<CallNavigation> {
  protected entityClass = CallNavigation;
  protected selectedFields = CallNavigationSelectFull;
  protected relations = CallNavigationRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<CallNavigation> | undefined): void {
    this.selectedFields = selectedFields || CallNavigationSelectFull;
    this.relations = CallNavigationRelations;
  }

  async deleteCallNavigationByOrderAndUser(orderId: string, userId: string, manager?: IEntityManager): Promise<void> {
    const cns = await this.findByOptions({
      where: {
        orderId,
        userId,
      },
    });

    if (cns.length > 0) {
      await this.deleteMany(
        cns.map((cn) => cn.id),
        manager,
      );
    }
  }
}
