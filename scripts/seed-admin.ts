import "dotenv/config";
import bcrypt from "bcryptjs";
import { Client } from "pg";

const email = process.env.ADMIN_EMAIL || "admin@kiot.local";
const password = process.env.ADMIN_PASSWORD || "Admin@123456";
const tenantCode = process.env.ADMIN_TENANT_CODE || "DEFAULT";
const tenantName = process.env.ADMIN_TENANT_NAME || "Kiot Viet";

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function main(): Promise<void> {
  await client.connect();
  await client.query("BEGIN");

  const tenantResult = await client.query<{ id: string }>(
    `INSERT INTO tenants (code, name, status)
     VALUES ($1, $2, 'ACTIVE')
     ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, status = 'ACTIVE'
     RETURNING id`,
    [tenantCode, tenantName],
  );
  const tenantId = tenantResult.rows[0].id;
  const passwordHash = await bcrypt.hash(password, 12);

  const userResult = await client.query<{ id: string }>(
    `INSERT INTO users (tenant_id, email, password_hash, status, deleted_at)
     VALUES ($1, $2, $3, 'ACTIVE', NULL)
     ON CONFLICT (tenant_id, email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, status = 'ACTIVE', deleted_at = NULL, updated_at = now()
     RETURNING id`,
    [tenantId, email, passwordHash],
  );
  const userId = userResult.rows[0].id;

  const roleResult = await client.query<{ id: string }>(
    `SELECT id FROM roles WHERE tenant_id = $1 AND code = 'ADMIN' LIMIT 1`,
    [tenantId],
  );
  const roleId = roleResult.rows[0]?.id ||
    (await client.query<{ id: string }>(
      `INSERT INTO roles (tenant_id, code, name, status, data)
       VALUES ($1, 'ADMIN', 'Administrator', 'ACTIVE', $2::jsonb)
       RETURNING id`,
      [tenantId, JSON.stringify({ role: "ADMIN" })],
    )).rows[0].id;

  const assignment = await client.query<{ id: string }>(
    `SELECT id FROM user_roles WHERE tenant_id = $1 AND reference_id = $2 AND code = 'ADMIN' LIMIT 1`,
    [tenantId, userId],
  );
  if (assignment.rows[0]) {
    await client.query(
      `UPDATE user_roles SET name = 'Administrator', status = 'ACTIVE', data = $1::jsonb, updated_at = now()
       WHERE id = $2`,
      [JSON.stringify({ roleId, role: "ADMIN", userId }), assignment.rows[0].id],
    );
  } else {
    await client.query(
      `INSERT INTO user_roles (tenant_id, code, name, status, reference_id, data)
       VALUES ($1, 'ADMIN', 'Administrator', 'ACTIVE', $2, $3::jsonb)`,
      [tenantId, userId, JSON.stringify({ roleId, role: "ADMIN", userId })],
    );
  }

  await client.query("COMMIT");
  console.log(JSON.stringify({ email, password, tenantCode, tenantId, userId }, null, 2));
}

main()
  .catch(async (error) => {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
