import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * The original retail schema kept several optional business references as uuid
 * columns without database constraints. These references are part of the
 * retail workflow and must be tenant-safe at the API layer and consistent at
 * the database layer.
 */
export class AddKiotRetailCoreRelations2026100600001 implements MigrationInterface {
  name = "AddKiotRetailCoreRelations2026100600001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const constraints = [
      ["branches", "store_id", "stores", "branches_store_id_fkey"],
      ["attendances", "shift_id", "work_shifts", "attendances_shift_id_fkey"],
      ["payrolls", "payroll_period_id", "payroll_periods", "payrolls_payroll_period_id_fkey"],
      ["products", "category_id", "categories", "products_category_id_fkey"],
      ["products", "brand_id", "brands", "products_brand_id_fkey"],
      ["products", "unit_id", "units", "products_unit_id_fkey"],
      ["payments", "payment_method_id", "payment_methods", "payments_payment_method_id_fkey"],
    ] as const;

    for (const [table, column, target, constraint] of constraints) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = '${constraint}'
          ) THEN
            ALTER TABLE ${table}
              ADD CONSTRAINT ${constraint} FOREIGN KEY (${column}) REFERENCES ${target}(id);
          END IF;
        END $$;
      `);
    }

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const constraints = [
      ["branches", "branches_store_id_fkey"],
      ["attendances", "attendances_shift_id_fkey"],
      ["payrolls", "payrolls_payroll_period_id_fkey"],
      ["products", "products_category_id_fkey"],
      ["products", "products_brand_id_fkey"],
      ["products", "products_unit_id_fkey"],
      ["payments", "payments_payment_method_id_fkey"],
    ] as const;
    for (const [table, constraint] of constraints) {
      await queryRunner.query(`ALTER TABLE IF EXISTS ${table} DROP CONSTRAINT IF EXISTS ${constraint}`);
    }
  }
}
