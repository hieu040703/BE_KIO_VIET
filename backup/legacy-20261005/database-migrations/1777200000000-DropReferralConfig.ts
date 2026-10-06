import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Drop ReferralConfig (model + module) — cấu hình thưởng phạt giới thiệu đã được
 * tích hợp vào `AppSetting.employee.salesTargetBonus` (mảng JSON).
 *
 * - Xoá bảng `referral_configs`.
 * - Xoá cột FK `referralConfigId` trên `time_keepings` và `referral_logs`.
 * - Thêm cột `referralAppliedDate` (timestamptz NULL + index) trên `time_keepings`
 *   để dedupe bonus do `salesTargetBonus[]` (JSON, không có id ổn định) sinh ra.
 */
export class DropReferralConfig1777200000000 implements MigrationInterface {
  name = "DropReferralConfig1777200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Thêm cột referralAppliedDate + index trên time_keepings
    await queryRunner.query(`
      ALTER TABLE "time_keepings"
      ADD COLUMN IF NOT EXISTS "referralAppliedDate" timestamptz NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_timeKeepings_referralAppliedDate"
      ON "time_keepings" ("referralAppliedDate")
    `);

    // 2. Xoá cột referralConfigId (kéo theo cả FK constraint) trên time_keepings
    await queryRunner.query(`
      ALTER TABLE "time_keepings" DROP COLUMN IF EXISTS "referralConfigId"
    `);

    // 3. Xoá cột referralConfigId trên referral_logs (nếu bảng tồn tại)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referral_logs') THEN
          ALTER TABLE "referral_logs" DROP COLUMN IF EXISTS "referralConfigId";
        END IF;
      END
      $$;
    `);

    // 4. Xoá bảng referral_configs
    await queryRunner.query(`DROP TABLE IF EXISTS "referral_configs"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Tạo lại bảng referral_configs (schema gốc)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "referral_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "type" "public"."referral_type_enum" NOT NULL DEFAULT 'BONUS',
        "daysWorking" integer NOT NULL DEFAULT 0,
        "bonusValue" integer NOT NULL DEFAULT 0,
        "daysOff" integer NOT NULL DEFAULT 0,
        "percentOff" double precision NOT NULL DEFAULT 0,
        "percentFine" double precision NOT NULL DEFAULT 0,
        "appliedDate" TIMESTAMP WITH TIME ZONE,
        "note" text,
        CONSTRAINT "PK_referral_configs" PRIMARY KEY ("id")
      )
    `);

    // 2. Thêm lại cột referralConfigId + FK trên time_keepings
    await queryRunner.query(`
      ALTER TABLE "time_keepings" ADD COLUMN IF NOT EXISTS "referralConfigId" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "time_keepings"
      ADD CONSTRAINT "FK_timeKeepings_referralConfigId"
      FOREIGN KEY ("referralConfigId") REFERENCES "referral_configs"("id")
      ON DELETE SET NULL
    `);

    // 3. Thêm lại cột referralConfigId trên referral_logs
    await queryRunner.query(`
      ALTER TABLE "referral_logs" ADD COLUMN IF NOT EXISTS "referralConfigId" uuid
    `);

    // 4. Xoá cột referralAppliedDate + index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_timeKeepings_referralAppliedDate"`);
    await queryRunner.query(`
      ALTER TABLE "time_keepings" DROP COLUMN IF EXISTS "referralAppliedDate"
    `);
  }
}
