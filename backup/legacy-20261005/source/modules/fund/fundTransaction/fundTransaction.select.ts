import { FundTransaction } from "@/database/models/FundTransaction";
    import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

    export const FundTransactionSelectBasic: FindOptionsSelect<FundTransaction> = {
        id: true,
  code: true,
  fundId: true,
  amount: true,
  transactionAccountNumber: true,
  transactionCode: true,
  description: true,
  timeAt: true,
      note: true
    };

    export const FundTransactionSelectFull: FindOptionsSelect<FundTransaction> = {
      ...FundTransactionSelectBasic,
    };

    export const FundTransactionRelations: FindOptionsRelations<FundTransaction> = {
      
    };