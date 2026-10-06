# BE Kiot Viet

Backend cho he thong ban le Kiot Viet, dung PostgreSQL, TypeORM va Express.

## Chay local

```bash
yarn install
yarn dev
```

API mac dinh chay tai `http://localhost:4010`.

## Database

Schema PostgreSQL nguon nam tai `database/kiot_retail_full_postgresql.sql`.

```bash
yarn db:migrate
yarn db:check
```

Migration tao va quan ly toan bo 156 bang trong schema. Model TypeORM duoc dang ky tai `src/database/models/index.ts`.

## Retail modules

Tat ca 156 bang deu co CRUD module tai `/v1/retail`.

```bash
curl -H "x-tenant-id: <tenant-uuid>" "http://localhost:4010/v1/retail/products?page=1&size=20"
curl "http://localhost:4010/v1/retail/resources"
```

Resource co `tenant_id` bat buoc header `x-tenant-id`. Resource `tenants` dung de khoi tao tenant nen khong bat buoc header nay.

## Tai khoan admin mac dinh

Tao tai khoan admin bang:

```bash
yarn db:seed:admin
```

Thong tin mac dinh:

```text
Email: admin@kiot.local
Mat khau: Admin@123456
Tenant code: DEFAULT
```

Tạo dữ liệu vận hành mẫu có liên kết cửa hàng, chi nhánh, kho, danh mục, thương hiệu, đơn vị, sản phẩm, phiên bản, tồn kho, khách hàng và nhân viên:

```bash
yarn db:seed:retail-demo
```

Dang nhap tai `POST /v1/auth/login`, sau do gui JWT trong header `Authorization: Bearer <token>`.

Module cu khong thuoc schema Kiot da duoc dua ra khoi source dang build va luu tai `backup/legacy-20261005`.
# BE_KIO_VIET
