import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedKiotPaymentMethods2026100600002 implements MigrationInterface {
  name = "SeedKiotPaymentMethods2026100600002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [code, name] of [["CASH", "Tiền mặt"], ["BANK_TRANSFER", "Chuyển khoản"], ["CARD", "Thẻ"]] as const) {
      await queryRunner.query(`
        INSERT INTO payment_methods (tenant_id, code, name, status, data)
        SELECT id, '${code}', '${name}', 'ACTIVE', '{}'::jsonb
        FROM tenants
        WHERE NOT EXISTS (
          SELECT 1 FROM payment_methods pm WHERE pm.tenant_id = tenants.id AND pm.code = '${code}'
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE FROM payment_methods WHERE code IN ('CASH', 'BANK_TRANSFER', 'CARD')");
  }
}
