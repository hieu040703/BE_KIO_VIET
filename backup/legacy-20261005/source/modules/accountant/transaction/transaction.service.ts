import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { TransactionRepository } from "./transaction.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { TRANSACTION_TYPES } from "./transaction.types";
import { Transaction } from "@/database/models/Transaction";
import { TransactionRelations, TransactionSelectFull } from "./transaction.select";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { Finance } from "@/database/models/Finance";
import { FinanceTypeEnum, TransactionTypeEnum } from "@/shared/constants/constance";
import { BadRequestError } from "@/shared/types/errors";
import { IEntityManager } from "@/shared/types/interfaces";
import { CreateTransactionDto, UpdateTransactionDto } from "./transaction.validator";
import { CommonService } from "@/modules/common/common.service";
import { Margin } from "@/database/models/Margin";

@injectable()
export class TransactionService extends BaseService<Transaction> {
  protected relations = TransactionRelations;
  protected selectedFields = TransactionSelectFull;
  constructor(
    @inject(TRANSACTION_TYPES.TransactionRepository) private transactionRepository: TransactionRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(COMMON_TYPES.CommonService) private commonService: CommonService,
  ) {
    super(transactionRepository);
  }

  //? Methods for Finance module
  async createTransactionFromFinance(data: Finance, manager?: IEntityManager): Promise<void> {
    if (
      data.type !== FinanceTypeEnum.INCOME &&
      data.type !== FinanceTypeEnum.EXPENSE &&
      data.type !== FinanceTypeEnum.SALARY
    ) {
      throw new BadRequestError("Invalid finance type for creating transaction");
    }

    const existingTransaction = await this.transactionRepository.findOneByField("financeId", data.id, manager);
    if (existingTransaction) {
      return;
    }

    const code = await this.commonService.getCode("Transaction", manager);

    const dataCreate: CreateTransactionDto = {
      code: code.data.code,
      financeId: data.id,
      type: data.type === FinanceTypeEnum.INCOME ? TransactionTypeEnum.IN : TransactionTypeEnum.OUT,
      amount: data.amount,
      timeAt: data.timeAt,
      note: data.note,
    };

    await this.transactionRepository.create(dataCreate, manager);
  }

  async updateTransactionFromFinance(data: Finance, manager?: IEntityManager): Promise<Transaction | null> {
    if (
      data.type !== FinanceTypeEnum.INCOME &&
      data.type !== FinanceTypeEnum.EXPENSE &&
      data.type !== FinanceTypeEnum.SALARY
    ) {
      throw new BadRequestError("Invalid finance type for creating transaction");
    }

    const transaction = await this.transactionRepository.findOneByField("financeId", data.id, manager);
    if (!transaction) {
      throw new BadRequestError("Transaction not found for the given finance ID");
    }

    const dataUpdate: UpdateTransactionDto = {
      type: data.type === FinanceTypeEnum.INCOME ? TransactionTypeEnum.IN : TransactionTypeEnum.OUT,
      amount: data.amount,
      timeAt: data.timeAt,
      note: data.note,
    };

    await this.transactionRepository.update(transaction.id, dataUpdate, manager);

    return this.transactionRepository.findById(transaction.id, manager);
  }

  async deleteTransactionFromFinance(data: Finance, manager?: IEntityManager): Promise<void> {
    const transaction = await this.transactionRepository.findOneByField("financeId", data.id, manager);
    if (transaction) {
      await this.transactionRepository.delete(transaction.id, manager);
    }
  }

  //? Methods for Advance Employee Salary module
  async createTransactionFromAdvanceSalary(data: Finance, manager?: IEntityManager): Promise<Transaction> {
    if (data.type !== FinanceTypeEnum.ADVANCE_SALARY) {
      throw new BadRequestError("Invalid finance type for creating transaction");
    }

    const code = await this.commonService.getCode("Transaction", manager);

    const dataCreate: CreateTransactionDto = {
      code: code.data.code,
      financeId: data.id,
      type: TransactionTypeEnum.OUT,
      amount: data.amount,
      timeAt: data.timeAt,
      note: data.note,
    };

    return await this.transactionRepository.create(dataCreate, manager);
  }

  async updateTransactionFromAdvanceSalary(data: Finance, manager?: IEntityManager): Promise<Transaction | null> {
    if (data.type !== FinanceTypeEnum.ADVANCE_SALARY) {
      throw new BadRequestError("Invalid finance type for creating transaction");
    }

    const transaction = await this.transactionRepository.findOneByField("financeId", data.id, manager);
    if (!transaction) {
      throw new BadRequestError("Transaction not found for the given finance ID");
    }

    const dataUpdate: UpdateTransactionDto = {
      amount: data.amount,
      timeAt: data.timeAt,
      note: data.note,
    };

    await this.transactionRepository.update(transaction.id, dataUpdate, manager);

    return this.transactionRepository.findById(transaction.id, manager);
  }

  async deleteTransactionFromAdvanceSalary(data: Finance, manager?: IEntityManager): Promise<void> {
    const transaction = await this.transactionRepository.findOneByField("financeId", data.id, manager);
    if (transaction) {
      await this.transactionRepository.delete(transaction.id, manager);
    }
  }

  //? Methods for Advance Employee
  async createTransactionFromAdvanceEmployee(data: Finance, manager?: IEntityManager): Promise<Transaction> {
    if (
      data.type !== FinanceTypeEnum.ADVANCE_EMPLOYEE &&
      data.type !== FinanceTypeEnum.REIMBURSE &&
      data.type !== FinanceTypeEnum.SETTLEMENT
    ) {
      throw new BadRequestError("Invalid finance type for creating transaction");
    }

    const code = await this.commonService.getCode("Transaction", manager);

    let type: TransactionTypeEnum;

    if (data.type === FinanceTypeEnum.ADVANCE_EMPLOYEE) {
      type = TransactionTypeEnum.OUT;
    } else {
      if (data.amount > 0) {
        type = TransactionTypeEnum.IN;
      } else {
        type = TransactionTypeEnum.OUT;
      }
    }

    const dataCreate: CreateTransactionDto = {
      code: code.data.code,
      financeId: data.id,
      type: type,
      amount: data.amount,
      timeAt: data.timeAt,
      note: data.note,
    };

    return await this.transactionRepository.create(dataCreate, manager);
  }

  //? Create transaction for margin
  async createTransactionFromCreateMargin(data: Margin, manager?: IEntityManager): Promise<Transaction> {
    const code = await this.commonService.getCode("Transaction", manager);

    const dataCreate: CreateTransactionDto = {
      code: code.data.code,
      financeId: data.id,
      type: TransactionTypeEnum.IN,
      amount: data.amount,
      timeAt: data.timeAt,
      note: data.note,
    };

    return await this.transactionRepository.create(dataCreate, manager);
  }

  //? delete transaction for margin
  async deleteTransactionFromMargin(data: Margin, manager?: IEntityManager): Promise<void> {
    const transaction = await this.transactionRepository.findOneByField("financeId", data.id, manager);
    if (transaction) {
      await this.transactionRepository.delete(transaction.id, manager);
    }
  }

  // ? update transaction for margin
  async updateTransactionFromMargin(data: Margin, manager?: IEntityManager): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.findOneByField("financeId", data.id, manager);
    if (!transaction) {
      throw new BadRequestError("Transaction not found for the given finance ID");
    }

    const dataUpdate: UpdateTransactionDto = {
      amount: data.amount,
      timeAt: data.timeAt,
      note: data.note,
    };

    await this.transactionRepository.update(transaction.id, dataUpdate, manager);

    return this.transactionRepository.findById(transaction.id, manager);
  }

  async updateTransactionFromAdvanceEmployee(data: Finance, manager?: IEntityManager): Promise<Transaction | null> {
    if (
      data.type !== FinanceTypeEnum.ADVANCE_EMPLOYEE &&
      data.type !== FinanceTypeEnum.REIMBURSE &&
      data.type !== FinanceTypeEnum.SETTLEMENT
    ) {
      throw new BadRequestError("Invalid finance type for creating transaction");
    }

    const transaction = await this.transactionRepository.findOneByField("financeId", data.id, manager);
    if (!transaction) {
      throw new BadRequestError("Transaction not found for the given finance ID");
    }

    let type: TransactionTypeEnum;

    if (data.type === FinanceTypeEnum.ADVANCE_EMPLOYEE) {
      type = TransactionTypeEnum.OUT;
    } else {
      if (data.amount > 0) {
        type = TransactionTypeEnum.IN;
      } else {
        type = TransactionTypeEnum.OUT;
      }
    }

    const dataUpdate: UpdateTransactionDto = {
      type: type,
      amount: data.amount,
      timeAt: data.timeAt,
      note: data.note,
    };

    await this.transactionRepository.update(transaction.id, dataUpdate, manager);

    return this.transactionRepository.findById(transaction.id, manager);
  }

  async deleteTransactionFromAdvanceEmployee(data: Finance, manager?: IEntityManager): Promise<void> {
    const transaction = await this.transactionRepository.findOneByField("financeId", data.id, manager);
    if (transaction) {
      await this.transactionRepository.delete(transaction.id, manager);
    }
  }
}
