import { Transaction } from "@/database/models/Transaction";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const TransactionSelectBasic: FindOptionsSelect<Transaction> = {
  id: true,
  code: true,
  financeId: true,
  type: true,
  amount: true,
  timeAt: true,
  note: true,
};

export const TransactionSelectFull: FindOptionsSelect<Transaction> = {
  ...TransactionSelectBasic,
};

export const TransactionRelations: FindOptionsRelations<Transaction> = {};
