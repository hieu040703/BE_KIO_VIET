import { Vouchers } from "@/database/models/Vouchers";
import { BaseService } from "@/shared/base/BaseService";
import { VouchersRelations, VouchersSelectFull } from "./vouchers.select";
import { VOUCHERS_TYPES } from "./vouchers.types";
import { VouchersRepository } from "./vouchers.repository";
import { inject, injectable } from "inversify";

@injectable()
export class AdminVouchersService extends BaseService<Vouchers> {
  protected relations = VouchersRelations;
  protected selectedFields = VouchersSelectFull;
  protected selectedFieldsForList = VouchersSelectFull;
  protected searchableFields = ["code"] as (keyof Vouchers)[] & string[];

  constructor(
    @inject(VOUCHERS_TYPES.VouchersRepository)
    private vouchersRepository: VouchersRepository,
  ) {
    super(vouchersRepository);
  }
}
