import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Xoá UNIQUE constraint trên `service_orders.vouchersId`.
 *
 * Lý do:
 * - DB cũ còn giữ UNIQUE constraint được sinh từ mô hình `OneToOne` trước đây
 *   (UQ_ea0813fe0e0e491e45482a69547), dù entity hiện tại đã chuyển sang
 *   `ManyToOne`.
 * - Theo flow nghiệp vụ mới, voucher chỉ bị "khóa" khi nhân viên xác nhận đơn
 *   (status -> CONFIRMED), không phải lúc khách tạo đơn. Voucher thuộc khách
 *   hàng nên một khách có thể tạo/huỷ nhiều đơn cùng tham chiếu 1 voucher
 *   trước khi có đơn nào được confirm. UNIQUE constraint chặn INSERT này
 *   → lỗi `duplicate key value violates unique constraint`.
 * - Cơ chế khoá thật sự là `vouchers.isUsed=true` (xử lý trong
 *   AdminServiceOrderService.confirm() với pessimistic_write lock) — DB constraint
 *   chỉ là lớp dư thừa gây bug.
 *
 * Sau migration: cùng 1 voucher có thể được tham chiếu bởi nhiều service order,
 * nhưng chỉ 1 đơn được CONFIRMED tại 1 thời điểm nhờ voucher.isUsed flag.
 */
export class DropServiceOrdersVouchersIdUniqueConstraint1777800000000
  implements MigrationInterface
{
  name = "DropServiceOrdersVouchersIdUniqueConstraint1777800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'UQ_ea0813fe0e0e491e45482a69547'
            AND conrelid = '"public"."service_orders"'::regclass
        ) THEN
          ALTER TABLE "service_orders" DROP CONSTRAINT "UQ_ea0813fe0e0e491e45482a69547";
        END IF;
      END
      $$;
    `);

    // Index cho query vẫn còn (đã có sẵn từ CreateVouchers migration),
    // chỉ drop unique constraint chứ không drop index.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'UQ_ea0813fe0e0e491e45482a69547'
            AND conrelid = '"public"."service_orders"'::regclass
        ) THEN
          ALTER TABLE "service_orders"
          ADD CONSTRAINT "UQ_ea0813fe0e0e491e45482a69547" UNIQUE ("vouchersId");
        END IF;
      END
      $$;
    `);
  }
}
