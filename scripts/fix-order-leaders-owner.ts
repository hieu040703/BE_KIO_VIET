/**
 * One-shot helper: chuyển ownership của `order_leaders` (và enum liên quan)
 * về user application đang dùng, để các migration sau không còn lỗi
 * "must be owner of table order_leaders".
 *
 * Cách dùng:
 *   1. Đảm bảo đã biết password của role `postgres` (superuser) trên DB này.
 *   2. Chạy: POSTGRES_PASSWORD=<pwd> yarn -s ts-node -r tsconfig-paths/register scripts/fix-order-leaders-owner.ts
 *   3. Sau khi chạy thành công, chạy `yarn db:migrate` để apply migration
 *      `1778100000000-AddTypeToOrderLeaders`.
 *
 * Script chỉ chạy ALTER ... OWNER TO và KHÔNG xoá / sửa dữ liệu.
 */
import "reflect-metadata";
import DatabaseConfig from "@/database/database";
import { Client } from "pg";
import { config } from "@/shared/config/env";

async function main() {
  const superPwd = process.env.POSTGRES_PASSWORD;
  if (!superPwd) {
    console.error(
      "❌ Missing POSTGRES_PASSWORD env. Run:\n" +
        "   POSTGRES_PASSWORD=<pwd> yarn -s ts-node -r tsconfig-paths/register scripts/fix-order-leaders-owner.ts",
    );
    process.exit(1);
  }

  // Đóng DataSource wrapper nếu đang mở
  try {
    if ((DatabaseConfig as any).isInitialized) await DatabaseConfig.destroy();
  } catch {
    /* ignore */
  }

  const client = new Client({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: "postgres",
    password: superPwd,
    database: config.DB_DATABASE,
  });

  await client.connect();
  try {
    const appUser = config.DB_USERNAME;

    const ownerRow = await client.query(
      `SELECT tableowner FROM pg_tables WHERE schemaname='public' AND tablename='order_leaders'`,
    );
    const currentOwner = ownerRow.rows[0]?.tableowner;
    console.log(`ℹ️  order_leaders.owner = ${currentOwner ?? "(none)"}`);
    console.log(`ℹ️  app user             = ${appUser}`);

    if (currentOwner === appUser) {
      console.log("✅ Already owned by app user — nothing to do.");
      return;
    }

    // 1. Chuyển ownership bảng
    await client.query(`ALTER TABLE public.order_leaders OWNER TO ${appUser}`);
    console.log(`✅ ALTER TABLE public.order_leaders OWNER TO ${appUser}`);

    // 2. Chuyển ownership enum nếu đã tồn tại (phòng trường hợp tạo sớm bởi role khác)
    const enumRow = await client.query(
      `SELECT 1 FROM pg_type WHERE typname='order_leaders_type_enum'`,
    );
    if (enumRow.rowCount && enumRow.rowCount > 0) {
      await client.query(
        `ALTER TYPE public.order_leaders_type_enum OWNER TO ${appUser}`,
      );
      console.log(`✅ ALTER TYPE public.order_leaders_type_enum OWNER TO ${appUser}`);
    }

    // 3. Đảm bảo quyền cần thiết trên sequence/columns (best-effort)
    const seqRows = await client.query(
      `SELECT sequencename FROM pg_sequences WHERE schemaname='public' AND sequence_name ILIKE '%order_leaders%'`,
    );
    for (const r of seqRows.rows) {
      await client.query(
        `ALTER SEQUENCE public.${r.sequencename} OWNER TO ${appUser}`,
      );
      console.log(`✅ ALTER SEQUENCE public.${r.sequencename} OWNER TO ${appUser}`);
    }

    console.log("\n➡️  Bây giờ chạy: yarn db:migrate");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});