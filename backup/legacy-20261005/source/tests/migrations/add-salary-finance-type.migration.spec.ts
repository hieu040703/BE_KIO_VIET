import { AddSalaryToFinanceTypeEnum1779900000000 } from "@/database/migrations/1779900000000-AddSalaryToFinanceTypeEnum";
import { MigrateSalaryFinanceRecords1780000000000 } from "@/database/migrations/1780000000000-MigrateSalaryFinanceRecords";

describe("salary Finance migrations", () => {
  it("adds the SALARY enum value", async () => {
    const queryRunner = { query: jest.fn().mockResolvedValue(undefined) } as any;

    await new AddSalaryToFinanceTypeEnum1779900000000().up(queryRunner);

    expect(queryRunner.query).toHaveBeenCalledWith(
      `ALTER TYPE "finances_type_enum" ADD VALUE IF NOT EXISTS 'SALARY'`,
    );
  });

  it("migrates linked legacy payroll expenses to SALARY", async () => {
    const queryRunner = { query: jest.fn().mockResolvedValue(undefined) } as any;

    await new MigrateSalaryFinanceRecords1780000000000().up(queryRunner);

    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('SET "type" = \'SALARY\', "isDebtRelated" = false'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(expect.stringContaining('"timeKeepingConfirmId" IS NOT NULL'));
  });
});
