import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSessionTypeToTokens1779700000000 implements MigrationInterface {
  name = "AddSessionTypeToTokens1779700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("tokens"))) {
      return;
    }

    if (!(await queryRunner.hasColumn("tokens", "sessionType"))) {
      await queryRunner.addColumn(
        "tokens",
        new TableColumn({
          name: "sessionType",
          type: "varchar",
          length: "10",
          isNullable: true,
        }),
      );
    }

    // Các refresh token cũ của BOC chưa có metadata platform; coi chúng là session web
    // để không làm mất quyền sử dụng khi triển khai migration.
    await queryRunner.query(`
      UPDATE "tokens"
      SET "sessionType" = 'web'
      WHERE "refreshToken" IS NOT NULL
        AND "sessionType" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tokens_user_session_type"
      ON "tokens" ("userId", "sessionType")
      WHERE "refreshToken" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("tokens"))) {
      return;
    }

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tokens_user_session_type"`);

    if (await queryRunner.hasColumn("tokens", "sessionType")) {
      await queryRunner.dropColumn("tokens", "sessionType");
    }
  }
}
