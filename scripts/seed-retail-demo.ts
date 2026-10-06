import "dotenv/config";
import { Client } from "pg";

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function firstId(table: string, tenantId: string, code: string): Promise<string | undefined> {
  const result = await client.query<{ id: string }>(`SELECT id FROM ${table} WHERE tenant_id = $1 AND code = $2 LIMIT 1`, [tenantId, code]);
  return result.rows[0]?.id;
}

async function genericRecord(table: string, tenantId: string, code: string, name: string, data: Record<string, unknown> = {}): Promise<string> {
  const existing = await firstId(table, tenantId, code);
  if (existing) return existing;
  const result = await client.query<{ id: string }>(
    `INSERT INTO ${table} (tenant_id, code, name, status, data) VALUES ($1, $2, $3, 'ACTIVE', $4::jsonb) RETURNING id`,
    [tenantId, code, name, JSON.stringify(data)],
  );
  return result.rows[0].id;
}

async function main(): Promise<void> {
  await client.connect();
  await client.query("BEGIN");
  const tenant = await client.query<{ id: string }>("SELECT id FROM tenants WHERE code = 'DEFAULT' LIMIT 1");
  if (!tenant.rows[0]) throw new Error("DEFAULT tenant not found. Run yarn db:seed:admin first.");
  const tenantId = tenant.rows[0].id;

  const storeId = await genericRecord("stores", tenantId, "STORE-01", "Cửa hàng trung tâm", { address: "Hà Nội" });
  const branch = await client.query<{ id: string }>(
    `INSERT INTO branches (tenant_id, store_id, code, name, address, phone, status)
     VALUES ($1, $2, 'CN-01', 'Chi nhánh trung tâm', 'Hà Nội', '0900000000', 'ACTIVE')
     ON CONFLICT (tenant_id, code) DO UPDATE SET store_id = EXCLUDED.store_id, name = EXCLUDED.name, status = 'ACTIVE'
     RETURNING id`,
    [tenantId, storeId],
  );
  const branchId = branch.rows[0].id;
  const warehouse = await client.query<{ id: string }>(
    `INSERT INTO warehouses (tenant_id, branch_id, code, name, is_default, status)
     VALUES ($1, $2, 'KHO-01', 'Kho trung tâm', true, 'ACTIVE')
     ON CONFLICT (tenant_id, code) DO UPDATE SET branch_id = EXCLUDED.branch_id, name = EXCLUDED.name, is_default = true, status = 'ACTIVE'
     RETURNING id`,
    [tenantId, branchId],
  );
  const warehouseId = warehouse.rows[0].id;
  const categoryId = await genericRecord("categories", tenantId, "CAT-DRINK", "Đồ uống");
  const brandId = await genericRecord("brands", tenantId, "BR-DEFAULT", "Thương hiệu mẫu");
  const unitId = await genericRecord("units", tenantId, "UNIT-PIECE", "Cái");
  const product = await client.query<{ id: string }>(
    `INSERT INTO products (tenant_id, category_id, brand_id, unit_id, code, name, product_type, track_inventory, status)
     VALUES ($1, $2, $3, $4, 'SP-001', 'Sản phẩm mẫu', 'STANDARD', true, 'ACTIVE')
     ON CONFLICT (tenant_id, code) DO UPDATE SET category_id = EXCLUDED.category_id, brand_id = EXCLUDED.brand_id, unit_id = EXCLUDED.unit_id, name = EXCLUDED.name, status = 'ACTIVE', deleted_at = NULL
     RETURNING id`,
    [tenantId, categoryId, brandId, unitId],
  );
  const productId = product.rows[0].id;
  const variant = await client.query<{ id: string }>(
    `INSERT INTO product_variants (tenant_id, product_id, sku, name, cost_price, sale_price, status)
     VALUES ($1, $2, 'SKU-001', 'Phiên bản tiêu chuẩn', 50000, 75000, 'ACTIVE')
     ON CONFLICT (tenant_id, sku) DO UPDATE SET product_id = EXCLUDED.product_id, name = EXCLUDED.name, cost_price = EXCLUDED.cost_price, sale_price = EXCLUDED.sale_price, status = 'ACTIVE'
     RETURNING id`,
    [tenantId, productId],
  );
  const variantId = variant.rows[0].id;
  await client.query(
    `INSERT INTO inventories (tenant_id, warehouse_id, variant_id, on_hand, reserved, version)
     VALUES ($1, $2, $3, 100, 0, 0)
     ON CONFLICT (warehouse_id, variant_id) DO UPDATE SET on_hand = GREATEST(inventories.on_hand, 100), reserved = 0`,
    [tenantId, warehouseId, variantId],
  );
  await client.query(
    `INSERT INTO customers (tenant_id, code, full_name, phone, status)
     VALUES ($1, 'KH-001', 'Khách hàng mẫu', '0911111111', 'ACTIVE')
     ON CONFLICT (tenant_id, code) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'ACTIVE', deleted_at = NULL`,
    [tenantId],
  );
  await client.query(
    `INSERT INTO employees (tenant_id, employee_code, full_name, phone, employment_status)
     VALUES ($1, 'NV-001', 'Nhân viên bán hàng', '0922222222', 'ACTIVE')
     ON CONFLICT (tenant_id, employee_code) DO UPDATE SET full_name = EXCLUDED.full_name, employment_status = 'ACTIVE', deleted_at = NULL`,
    [tenantId],
  );
  await client.query("COMMIT");
  console.log(JSON.stringify({ tenantId, storeId, branchId, warehouseId, categoryId, brandId, unitId, productId, variantId }, null, 2));
}

main()
  .catch(async (error) => {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
