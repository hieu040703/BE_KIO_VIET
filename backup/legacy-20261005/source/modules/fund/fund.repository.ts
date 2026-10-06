import { BaseRepository } from "@/shared/base/BaseRepository";
import { Fund } from "@/database/models/Fund";
import { FindOptionsSelect, Not } from "typeorm";
import { FundSelectFull, FundRelations } from "./fund.select";
import { injectable, inject } from "inversify";
import { IEntityManager } from "@/shared/types/interfaces";

@injectable()
export class FundRepository extends BaseRepository<Fund> {
  protected entityClass = Fund;
  protected selectedFields = FundSelectFull;
  protected relations = FundRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Fund> | undefined): void {
    this.selectedFields = selectedFields || FundSelectFull;
    this.relations = FundRelations;
  }

  //? unset isDefault for other funds when one fund is set as default
  async unsetDefaultForOtherFunds(fundId: string, manager?: any): Promise<void> {
    await this.updateOptions(
      {
        isDefault: false,
      },
      {
        id: Not(fundId),
      },
      manager,
    );
  }

  //? find fund which is set as default payment account
  async findFundDefaultPayment(manager?: any): Promise<Fund | null> {
    return this.findByOption(
      {
        where: {
          isDefault: true,
        },
      },
      manager,
    );
  }

  //? find fund by account number
  async findFundByAccountNumber(accountNumber: string, manager?: any): Promise<Fund | null> {
    return this.findByOption(
      {
        where: {
          accountNumber: accountNumber,
        },
      },
      manager,
    );
  }

  //? check if fund with specific account number exists
  async findDefaultFund(manager?: IEntityManager): Promise<Fund | null> {
    const fund = await this.findByOption({
      where: {
        isDefault: true,
      },
    });

    if (!fund) {
      return null;
    }

    return fund;
  }
}
