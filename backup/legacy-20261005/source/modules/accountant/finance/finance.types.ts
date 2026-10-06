export enum FinanceCreationSourceEnum {
  MANUAL = "MANUAL",
  SYSTEM = "SYSTEM",
  BANK_WEBHOOK = "BANK_WEBHOOK",
}

export const FINANCE_TYPES = {
  FinanceService: Symbol.for("financeService"),
  FinanceController: Symbol.for("financeController"),
  FinanceRepository: Symbol.for("financeRepository"),
  FinanceRouter: Symbol.for("financeRouter"),
};
