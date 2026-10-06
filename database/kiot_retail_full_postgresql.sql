-- KIOT-STYLE RETAIL / POS / HRM / CRM DATABASE
-- PostgreSQL 14+ | generated 2026-10-03
-- Architecture: multi-tenant modular monolith
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- CORE & IAM
-- ============================================================
CREATE TABLE tenants (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code varchar(50) UNIQUE NOT NULL, name varchar(255) NOT NULL, status varchar(30) NOT NULL DEFAULT 'ACTIVE', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE tenant_settings (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE stores (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE branches (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), store_id uuid REFERENCES stores(id), code varchar(50) NOT NULL, name varchar(255) NOT NULL, address text, phone varchar(30), timezone varchar(60) DEFAULT 'Asia/Ho_Chi_Minh', status varchar(30) DEFAULT 'ACTIVE', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), UNIQUE(tenant_id,code)
);
CREATE TABLE warehouses (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), branch_id uuid REFERENCES branches(id), code varchar(50) NOT NULL, name varchar(255) NOT NULL, is_default boolean DEFAULT false, status varchar(30) DEFAULT 'ACTIVE', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), UNIQUE(tenant_id,code)
);
CREATE TABLE users (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), email varchar(255), phone varchar(30), password_hash text NOT NULL, status varchar(30) NOT NULL DEFAULT 'ACTIVE', last_login_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz, UNIQUE(tenant_id,email), UNIQUE(tenant_id,phone)
);
CREATE TABLE roles (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE permissions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE user_roles (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE role_permissions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE user_sessions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE api_keys (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE audit_logs (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- ============================================================
-- HRM
-- ============================================================
CREATE TABLE departments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE positions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE employees (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), user_id uuid REFERENCES users(id), employee_code varchar(50) NOT NULL, full_name varchar(255) NOT NULL, phone varchar(30), email varchar(255), hire_date date, employment_status varchar(30) DEFAULT 'ACTIVE', base_salary numeric(18,2) DEFAULT 0 CHECK(base_salary>=0), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), deleted_at timestamptz, UNIQUE(tenant_id,employee_code)
);
CREATE TABLE employee_profiles (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE employee_contracts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE employee_documents (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE employee_branch_assignments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE employee_position_history (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE work_shifts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE shift_assignments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE attendance_devices (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE attendance_logs (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE attendances (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), employee_id uuid NOT NULL REFERENCES employees(id), work_date date NOT NULL, shift_id uuid REFERENCES work_shifts(id), check_in timestamptz, check_out timestamptz, worked_minutes integer DEFAULT 0, late_minutes integer DEFAULT 0, early_leave_minutes integer DEFAULT 0, overtime_minutes integer DEFAULT 0, status varchar(30) DEFAULT 'PRESENT', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), UNIQUE(employee_id,work_date,shift_id)
);
CREATE TABLE leave_types (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE leave_balances (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE leave_requests (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE holidays (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE overtime_requests (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE salary_components (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE employee_salary_components (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE payroll_periods (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE payrolls (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), payroll_period_id uuid REFERENCES payroll_periods(id), employee_id uuid NOT NULL REFERENCES employees(id), base_salary numeric(18,2) DEFAULT 0, allowance_total numeric(18,2) DEFAULT 0, overtime_total numeric(18,2) DEFAULT 0, commission_total numeric(18,2) DEFAULT 0, bonus_total numeric(18,2) DEFAULT 0, deduction_total numeric(18,2) DEFAULT 0, gross_salary numeric(18,2) DEFAULT 0, net_salary numeric(18,2) DEFAULT 0, status varchar(30) DEFAULT 'DRAFT', paid_at timestamptz, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE payroll_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE kpi_definitions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE employee_kpis (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE commission_policies (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE employee_commissions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE bonuses (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE penalties (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- ============================================================
-- CATALOG
-- ============================================================
CREATE TABLE categories (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE brands (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE units (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE products (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), category_id uuid REFERENCES categories(id), brand_id uuid REFERENCES brands(id), unit_id uuid REFERENCES units(id), code varchar(80) NOT NULL, name varchar(255) NOT NULL, product_type varchar(30) DEFAULT 'STANDARD', track_inventory boolean DEFAULT true, track_batch boolean DEFAULT false, track_serial boolean DEFAULT false, status varchar(30) DEFAULT 'ACTIVE', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), deleted_at timestamptz, UNIQUE(tenant_id,code)
);
CREATE TABLE product_variants (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), product_id uuid NOT NULL REFERENCES products(id), sku varchar(100) NOT NULL, name varchar(255), cost_price numeric(18,2) DEFAULT 0 CHECK(cost_price>=0), sale_price numeric(18,2) DEFAULT 0 CHECK(sale_price>=0), status varchar(30) DEFAULT 'ACTIVE', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), UNIQUE(tenant_id,sku)
);
CREATE TABLE product_images (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE attributes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE attribute_values (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE variant_attribute_values (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE product_barcodes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE product_units (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE bundles (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE bundle_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE price_books (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE price_book_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE tax_rates (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE product_tax_rates (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE TABLE inventories (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), warehouse_id uuid NOT NULL REFERENCES warehouses(id), variant_id uuid NOT NULL REFERENCES product_variants(id), on_hand numeric(18,4) NOT NULL DEFAULT 0, reserved numeric(18,4) NOT NULL DEFAULT 0 CHECK(reserved>=0), available numeric(18,4) GENERATED ALWAYS AS (on_hand-reserved) STORED, version bigint NOT NULL DEFAULT 0, updated_at timestamptz DEFAULT now(), UNIQUE(warehouse_id,variant_id)
);
CREATE TABLE stock_ledgers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), warehouse_id uuid NOT NULL REFERENCES warehouses(id), variant_id uuid NOT NULL REFERENCES product_variants(id), movement_type varchar(40) NOT NULL, quantity numeric(18,4) NOT NULL CHECK(quantity<>0), unit_cost numeric(18,2), reference_type varchar(50), reference_id uuid, occurred_at timestamptz NOT NULL DEFAULT now(), created_by uuid REFERENCES users(id), metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE stock_reservations (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE stock_adjustments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE stock_adjustment_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE stock_counts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE stock_count_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE stock_transfers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE stock_transfer_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE inventory_batches (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE serial_numbers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE inventory_cost_layers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- ============================================================
-- PURCHASING
-- ============================================================
CREATE TABLE suppliers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE supplier_contacts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE supplier_addresses (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE purchase_orders (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE purchase_order_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE goods_receipts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE goods_receipt_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE purchase_returns (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE purchase_return_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE supplier_debts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE supplier_debt_transactions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- ============================================================
-- CRM
-- ============================================================
CREATE TABLE customers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), code varchar(50) NOT NULL, full_name varchar(255) NOT NULL, phone varchar(30), email varchar(255), birthday date, gender varchar(20), total_spent numeric(18,2) DEFAULT 0, order_count integer DEFAULT 0, status varchar(30) DEFAULT 'ACTIVE', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), deleted_at timestamptz, UNIQUE(tenant_id,code)
);
CREATE TABLE customer_addresses (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE customer_contacts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE customer_groups (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE customer_group_members (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE customer_tags (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE customer_tag_maps (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE customer_notes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE customer_activities (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE customer_debts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE customer_debt_transactions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE loyalty_tiers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE loyalty_accounts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE loyalty_transactions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- ============================================================
-- SALES
-- ============================================================
CREATE TABLE sales_channels (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE carts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE cart_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE orders (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), branch_id uuid NOT NULL REFERENCES branches(id), warehouse_id uuid REFERENCES warehouses(id), customer_id uuid REFERENCES customers(id), employee_id uuid REFERENCES employees(id), order_code varchar(60) NOT NULL, channel varchar(30) DEFAULT 'POS', status varchar(30) NOT NULL DEFAULT 'DRAFT', payment_status varchar(30) NOT NULL DEFAULT 'UNPAID', fulfillment_status varchar(30) NOT NULL DEFAULT 'UNFULFILLED', subtotal numeric(18,2) NOT NULL DEFAULT 0, discount_total numeric(18,2) NOT NULL DEFAULT 0, tax_total numeric(18,2) NOT NULL DEFAULT 0, shipping_total numeric(18,2) NOT NULL DEFAULT 0, grand_total numeric(18,2) NOT NULL DEFAULT 0, paid_total numeric(18,2) NOT NULL DEFAULT 0, debt_total numeric(18,2) NOT NULL DEFAULT 0, ordered_at timestamptz DEFAULT now(), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), UNIQUE(tenant_id,order_code)
);
CREATE TABLE order_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE, variant_id uuid NOT NULL REFERENCES product_variants(id), employee_id uuid REFERENCES employees(id), quantity numeric(18,4) NOT NULL CHECK(quantity>0), unit_price numeric(18,2) NOT NULL CHECK(unit_price>=0), discount_total numeric(18,2) DEFAULT 0, tax_total numeric(18,2) DEFAULT 0, line_total numeric(18,2) NOT NULL, cost_total numeric(18,2) DEFAULT 0, created_at timestamptz DEFAULT now()
);
CREATE TABLE order_status_history (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE order_discounts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE order_taxes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE order_notes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE fulfillments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE fulfillment_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE shipments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE shipment_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE returns (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE return_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE exchanges (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE exchange_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE invoices (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE invoice_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- ============================================================
-- PAYMENT & FINANCE
-- ============================================================
CREATE TABLE payment_methods (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE payments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), order_id uuid REFERENCES orders(id), customer_id uuid REFERENCES customers(id), payment_method_id uuid REFERENCES payment_methods(id), amount numeric(18,2) NOT NULL CHECK(amount>0), status varchar(30) NOT NULL DEFAULT 'PENDING', external_reference varchar(255), idempotency_key varchar(255), paid_at timestamptz, created_at timestamptz DEFAULT now(), UNIQUE(tenant_id,idempotency_key)
);
CREATE TABLE payment_transactions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE payment_allocations (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE refunds (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE refund_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE reconciliations (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE reconciliation_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE cash_registers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE cash_sessions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE cash_movements (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE cashbooks (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE receipts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE expenses (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE expense_categories (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE financial_accounts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE account_transactions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- ============================================================
-- PROMOTION
-- ============================================================
CREATE TABLE promotions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE promotion_rules (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE promotion_actions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE promotion_products (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE promotion_customer_groups (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE coupons (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE coupon_usages (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE vouchers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE voucher_transactions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE gift_cards (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE gift_card_transactions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- ============================================================
-- OPERATIONS
-- ============================================================
CREATE TABLE shipping_providers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE shipping_orders (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE notifications (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE notification_recipients (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE files (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE system_settings (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE webhooks (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE webhook_deliveries (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE jobs (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE job_logs (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE number_sequences (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE tags (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);
CREATE TABLE entity_tags (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id uuid NOT NULL REFERENCES tenants(id),
code varchar(80),
name varchar(255),
status varchar(30) NOT NULL DEFAULT 'ACTIVE',
reference_id uuid,
amount numeric(18,2),
quantity numeric(18,4),
data jsonb NOT NULL DEFAULT '{}'::jsonb,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
deleted_at timestamptz
);

-- Core performance indexes
CREATE INDEX idx_tenant_settings_tenant ON tenant_settings(tenant_id);
CREATE INDEX idx_stores_tenant ON stores(tenant_id);
CREATE INDEX idx_branches_tenant ON branches(tenant_id);
CREATE INDEX idx_warehouses_tenant ON warehouses(tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_roles_tenant ON roles(tenant_id);
CREATE INDEX idx_permissions_tenant ON permissions(tenant_id);
CREATE INDEX idx_user_roles_tenant ON user_roles(tenant_id);
CREATE INDEX idx_role_permissions_tenant ON role_permissions(tenant_id);
CREATE INDEX idx_user_sessions_tenant ON user_sessions(tenant_id);
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_departments_tenant ON departments(tenant_id);
CREATE INDEX idx_positions_tenant ON positions(tenant_id);
CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_employee_profiles_tenant ON employee_profiles(tenant_id);
CREATE INDEX idx_employee_contracts_tenant ON employee_contracts(tenant_id);
CREATE INDEX idx_employee_documents_tenant ON employee_documents(tenant_id);
CREATE INDEX idx_employee_branch_assignments_tenant ON employee_branch_assignments(tenant_id);
CREATE INDEX idx_employee_position_history_tenant ON employee_position_history(tenant_id);
CREATE INDEX idx_work_shifts_tenant ON work_shifts(tenant_id);
CREATE INDEX idx_shift_assignments_tenant ON shift_assignments(tenant_id);
CREATE INDEX idx_attendance_devices_tenant ON attendance_devices(tenant_id);
CREATE INDEX idx_attendance_logs_tenant ON attendance_logs(tenant_id);
CREATE INDEX idx_attendances_tenant ON attendances(tenant_id);
CREATE INDEX idx_leave_types_tenant ON leave_types(tenant_id);
CREATE INDEX idx_leave_balances_tenant ON leave_balances(tenant_id);
CREATE INDEX idx_leave_requests_tenant ON leave_requests(tenant_id);
CREATE INDEX idx_holidays_tenant ON holidays(tenant_id);
CREATE INDEX idx_overtime_requests_tenant ON overtime_requests(tenant_id);
CREATE INDEX idx_salary_components_tenant ON salary_components(tenant_id);
CREATE INDEX idx_employee_salary_components_tenant ON employee_salary_components(tenant_id);
CREATE INDEX idx_payroll_periods_tenant ON payroll_periods(tenant_id);
CREATE INDEX idx_payrolls_tenant ON payrolls(tenant_id);
CREATE INDEX idx_payroll_items_tenant ON payroll_items(tenant_id);
CREATE INDEX idx_kpi_definitions_tenant ON kpi_definitions(tenant_id);
CREATE INDEX idx_employee_kpis_tenant ON employee_kpis(tenant_id);
CREATE INDEX idx_commission_policies_tenant ON commission_policies(tenant_id);
CREATE INDEX idx_employee_commissions_tenant ON employee_commissions(tenant_id);
CREATE INDEX idx_bonuses_tenant ON bonuses(tenant_id);
CREATE INDEX idx_penalties_tenant ON penalties(tenant_id);
CREATE INDEX idx_categories_tenant ON categories(tenant_id);
CREATE INDEX idx_brands_tenant ON brands(tenant_id);
CREATE INDEX idx_units_tenant ON units(tenant_id);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_product_variants_tenant ON product_variants(tenant_id);
CREATE INDEX idx_product_images_tenant ON product_images(tenant_id);
CREATE INDEX idx_attributes_tenant ON attributes(tenant_id);
CREATE INDEX idx_attribute_values_tenant ON attribute_values(tenant_id);
CREATE INDEX idx_variant_attribute_values_tenant ON variant_attribute_values(tenant_id);
CREATE INDEX idx_product_barcodes_tenant ON product_barcodes(tenant_id);
CREATE INDEX idx_product_units_tenant ON product_units(tenant_id);
CREATE INDEX idx_bundles_tenant ON bundles(tenant_id);
CREATE INDEX idx_bundle_items_tenant ON bundle_items(tenant_id);
CREATE INDEX idx_price_books_tenant ON price_books(tenant_id);
CREATE INDEX idx_price_book_items_tenant ON price_book_items(tenant_id);
CREATE INDEX idx_tax_rates_tenant ON tax_rates(tenant_id);
CREATE INDEX idx_product_tax_rates_tenant ON product_tax_rates(tenant_id);
CREATE INDEX idx_inventories_tenant ON inventories(tenant_id);
CREATE INDEX idx_stock_ledgers_tenant ON stock_ledgers(tenant_id);
CREATE INDEX idx_stock_reservations_tenant ON stock_reservations(tenant_id);
CREATE INDEX idx_stock_adjustments_tenant ON stock_adjustments(tenant_id);
CREATE INDEX idx_stock_adjustment_items_tenant ON stock_adjustment_items(tenant_id);
CREATE INDEX idx_stock_counts_tenant ON stock_counts(tenant_id);
CREATE INDEX idx_stock_count_items_tenant ON stock_count_items(tenant_id);
CREATE INDEX idx_stock_transfers_tenant ON stock_transfers(tenant_id);
CREATE INDEX idx_stock_transfer_items_tenant ON stock_transfer_items(tenant_id);
CREATE INDEX idx_inventory_batches_tenant ON inventory_batches(tenant_id);
CREATE INDEX idx_serial_numbers_tenant ON serial_numbers(tenant_id);
CREATE INDEX idx_inventory_cost_layers_tenant ON inventory_cost_layers(tenant_id);
CREATE INDEX idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX idx_supplier_contacts_tenant ON supplier_contacts(tenant_id);
CREATE INDEX idx_supplier_addresses_tenant ON supplier_addresses(tenant_id);
CREATE INDEX idx_purchase_orders_tenant ON purchase_orders(tenant_id);
CREATE INDEX idx_purchase_order_items_tenant ON purchase_order_items(tenant_id);
CREATE INDEX idx_goods_receipts_tenant ON goods_receipts(tenant_id);
CREATE INDEX idx_goods_receipt_items_tenant ON goods_receipt_items(tenant_id);
CREATE INDEX idx_purchase_returns_tenant ON purchase_returns(tenant_id);
CREATE INDEX idx_purchase_return_items_tenant ON purchase_return_items(tenant_id);
CREATE INDEX idx_supplier_debts_tenant ON supplier_debts(tenant_id);
CREATE INDEX idx_supplier_debt_transactions_tenant ON supplier_debt_transactions(tenant_id);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customer_addresses_tenant ON customer_addresses(tenant_id);
CREATE INDEX idx_customer_contacts_tenant ON customer_contacts(tenant_id);
CREATE INDEX idx_customer_groups_tenant ON customer_groups(tenant_id);
CREATE INDEX idx_customer_group_members_tenant ON customer_group_members(tenant_id);
CREATE INDEX idx_customer_tags_tenant ON customer_tags(tenant_id);
CREATE INDEX idx_customer_tag_maps_tenant ON customer_tag_maps(tenant_id);
CREATE INDEX idx_customer_notes_tenant ON customer_notes(tenant_id);
CREATE INDEX idx_customer_activities_tenant ON customer_activities(tenant_id);
CREATE INDEX idx_customer_debts_tenant ON customer_debts(tenant_id);
CREATE INDEX idx_customer_debt_transactions_tenant ON customer_debt_transactions(tenant_id);
CREATE INDEX idx_loyalty_tiers_tenant ON loyalty_tiers(tenant_id);
CREATE INDEX idx_loyalty_accounts_tenant ON loyalty_accounts(tenant_id);
CREATE INDEX idx_loyalty_transactions_tenant ON loyalty_transactions(tenant_id);
CREATE INDEX idx_sales_channels_tenant ON sales_channels(tenant_id);
CREATE INDEX idx_carts_tenant ON carts(tenant_id);
CREATE INDEX idx_cart_items_tenant ON cart_items(tenant_id);
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_order_items_tenant ON order_items(tenant_id);
CREATE INDEX idx_order_status_history_tenant ON order_status_history(tenant_id);
CREATE INDEX idx_order_discounts_tenant ON order_discounts(tenant_id);
CREATE INDEX idx_order_taxes_tenant ON order_taxes(tenant_id);
CREATE INDEX idx_order_notes_tenant ON order_notes(tenant_id);
CREATE INDEX idx_fulfillments_tenant ON fulfillments(tenant_id);
CREATE INDEX idx_fulfillment_items_tenant ON fulfillment_items(tenant_id);
CREATE INDEX idx_shipments_tenant ON shipments(tenant_id);
CREATE INDEX idx_shipment_items_tenant ON shipment_items(tenant_id);
CREATE INDEX idx_returns_tenant ON returns(tenant_id);
CREATE INDEX idx_return_items_tenant ON return_items(tenant_id);
CREATE INDEX idx_exchanges_tenant ON exchanges(tenant_id);
CREATE INDEX idx_exchange_items_tenant ON exchange_items(tenant_id);
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoice_items_tenant ON invoice_items(tenant_id);
CREATE INDEX idx_payment_methods_tenant ON payment_methods(tenant_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payment_transactions_tenant ON payment_transactions(tenant_id);
CREATE INDEX idx_payment_allocations_tenant ON payment_allocations(tenant_id);
CREATE INDEX idx_refunds_tenant ON refunds(tenant_id);
CREATE INDEX idx_refund_items_tenant ON refund_items(tenant_id);
CREATE INDEX idx_reconciliations_tenant ON reconciliations(tenant_id);
CREATE INDEX idx_reconciliation_items_tenant ON reconciliation_items(tenant_id);
CREATE INDEX idx_cash_registers_tenant ON cash_registers(tenant_id);
CREATE INDEX idx_cash_sessions_tenant ON cash_sessions(tenant_id);
CREATE INDEX idx_cash_movements_tenant ON cash_movements(tenant_id);
CREATE INDEX idx_cashbooks_tenant ON cashbooks(tenant_id);
CREATE INDEX idx_receipts_tenant ON receipts(tenant_id);
CREATE INDEX idx_expenses_tenant ON expenses(tenant_id);
CREATE INDEX idx_expense_categories_tenant ON expense_categories(tenant_id);
CREATE INDEX idx_financial_accounts_tenant ON financial_accounts(tenant_id);
CREATE INDEX idx_account_transactions_tenant ON account_transactions(tenant_id);
CREATE INDEX idx_promotions_tenant ON promotions(tenant_id);
CREATE INDEX idx_promotion_rules_tenant ON promotion_rules(tenant_id);
CREATE INDEX idx_promotion_actions_tenant ON promotion_actions(tenant_id);
CREATE INDEX idx_promotion_products_tenant ON promotion_products(tenant_id);
CREATE INDEX idx_promotion_customer_groups_tenant ON promotion_customer_groups(tenant_id);
CREATE INDEX idx_coupons_tenant ON coupons(tenant_id);
CREATE INDEX idx_coupon_usages_tenant ON coupon_usages(tenant_id);
CREATE INDEX idx_vouchers_tenant ON vouchers(tenant_id);
CREATE INDEX idx_voucher_transactions_tenant ON voucher_transactions(tenant_id);
CREATE INDEX idx_gift_cards_tenant ON gift_cards(tenant_id);
CREATE INDEX idx_gift_card_transactions_tenant ON gift_card_transactions(tenant_id);
CREATE INDEX idx_shipping_providers_tenant ON shipping_providers(tenant_id);
CREATE INDEX idx_shipping_orders_tenant ON shipping_orders(tenant_id);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notification_recipients_tenant ON notification_recipients(tenant_id);
CREATE INDEX idx_files_tenant ON files(tenant_id);
CREATE INDEX idx_system_settings_tenant ON system_settings(tenant_id);
CREATE INDEX idx_webhooks_tenant ON webhooks(tenant_id);
CREATE INDEX idx_webhook_deliveries_tenant ON webhook_deliveries(tenant_id);
CREATE INDEX idx_jobs_tenant ON jobs(tenant_id);
CREATE INDEX idx_job_logs_tenant ON job_logs(tenant_id);
CREATE INDEX idx_number_sequences_tenant ON number_sequences(tenant_id);
CREATE INDEX idx_tags_tenant ON tags(tenant_id);
CREATE INDEX idx_entity_tags_tenant ON entity_tags(tenant_id);
CREATE INDEX idx_stock_ledgers_lookup ON stock_ledgers(tenant_id,warehouse_id,variant_id,occurred_at DESC);
CREATE INDEX idx_orders_branch_date ON orders(tenant_id,branch_id,ordered_at DESC);
CREATE INDEX idx_orders_customer ON orders(tenant_id,customer_id,ordered_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_attendances_employee_date ON attendances(employee_id,work_date DESC);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_warehouses_updated BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_product_variants_updated BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_inventories_updated BEFORE UPDATE ON inventories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_attendances_updated BEFORE UPDATE ON attendances FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payrolls_updated BEFORE UPDATE ON payrolls FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
