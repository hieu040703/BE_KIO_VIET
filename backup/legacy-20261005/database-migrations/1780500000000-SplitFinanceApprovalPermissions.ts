import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Tách quyền phê duyệt phiếu thu và phiếu chi.
 * Quyền cũ financeConfirm được giữ cho phiếu chi; quyền phiếu thu phải được cấp riêng.
 */
export class SplitFinanceApprovalPermissions1780500000000 implements MigrationInterface {
  name = "SplitFinanceApprovalPermissions1780500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const groups = await queryRunner.query(`SELECT "id", "permissions" FROM "permission_groups"`);

    for (const group of groups) {
      const permissions =
        typeof group.permissions === "string" ? JSON.parse(group.permissions) : group.permissions || {};
      const legacyPermissions = permissions.financeConfirm || [];

      if (!permissions.financeExpenseConfirm) permissions.financeExpenseConfirm = [...legacyPermissions];
      if (!permissions.financeIncomeConfirm) permissions.financeIncomeConfirm = [];

      await queryRunner.query(`UPDATE "permission_groups" SET "permissions" = $1::jsonb WHERE "id" = $2`, [
        JSON.stringify(permissions),
        group.id,
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const groups = await queryRunner.query(`SELECT "id", "permissions" FROM "permission_groups"`);

    for (const group of groups) {
      const permissions =
        typeof group.permissions === "string" ? JSON.parse(group.permissions) : group.permissions || {};
      delete permissions.financeIncomeConfirm;
      delete permissions.financeExpenseConfirm;

      await queryRunner.query(`UPDATE "permission_groups" SET "permissions" = $1::jsonb WHERE "id" = $2`, [
        JSON.stringify(permissions),
        group.id,
      ]);
    }
  }
}
