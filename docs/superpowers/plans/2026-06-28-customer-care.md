# Customer Care Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm CRUD lịch sử/lịch hẹn chăm sóc khách hàng trên BE và popup quản lý theo từng khách hàng trên FE.

**Architecture:** BE dùng module kỹ thuật `customerCare` để tránh trùng class `CustomerService` hiện có, nhưng public API và permission dùng `customer-services`/`customerService`. FE giữ dữ liệu popup ở local hook vì dữ liệu chỉ sống trong modal, đồng thời tái sử dụng employee selector, table, permission và API client hiện có.

**Tech Stack:** TypeScript, Express 5, TypeORM 0.3, Inversify 7, Zod 4, Jest, React 18, Ant Design, Vite 7.

---

## File structure

### Backend

- Create `src/database/models/CustomerCare.ts`: entity, enums, relations và index.
- Create `src/database/migrations/1778200000000-CreateCustomerCares.ts`: schema `up/down`.
- Modify `src/database/models/index.ts`: export entity cho TypeORM.
- Create `src/modules/customerCare/*`: CRUD module, validation, relation selection, permission routes và tests.
- Create `src/modules/customerCare/SKILL.md`: knowledge của module.
- Modify `src/modules/container.ts`: load DI module.
- Modify `src/routers/admin.routes.ts`: mount `/customer-services`.
- Modify `src/database/models/PermissionGroup.ts`: đăng ký permission key.

### Frontend

- Modify `src/constants/ApiEndpoint.ts`: endpoint mới.
- Create `src/models/customerCare.ts`: FE contract và label options.
- Create `src/hooks/useCustomerCareData.ts`: local paginated CRUD API state.
- Create `src/pages/Private/customer/components/customerCare/CustomerCareModal.tsx`: lịch sử table.
- Create `src/pages/Private/customer/components/customerCare/CustomerCareFormModal.tsx`: form add/edit.
- Modify `src/components/dropdown/ActionMenu.tsx`: optional action đứng đầu.
- Modify `src/components/table/TableColumnConfig.tsx`: truyền optional action xuống menu.
- Modify `src/pages/Private/customer/components/CustomerTable.tsx`: expose callback.
- Modify `src/pages/Private/customer/index.tsx`: permission và modal state.

## Task 1: Backend contract and business rules

**Files:**
- Create: `src/modules/customerCare/__tests__/customerCare.service.spec.ts`
- Create: `src/database/models/CustomerCare.ts`
- Create: `src/modules/customerCare/customerCare.validator.ts`
- Create: `src/modules/customerCare/customerCare.repository.ts`
- Create: `src/modules/customerCare/customerCare.service.ts`
- Create: `src/modules/customerCare/customerCare.select.ts`

- [ ] **Step 1: Write failing service tests**

Cover these outcomes using mocked repositories:

```ts
it("sets completedAt when status becomes COMPLETED", async () => {
  const data = validData({ status: CustomerCareStatus.COMPLETED, completedAt: null });
  await service.validateBeforeCreate(data);
  expect(data.completedAt).toBeInstanceOf(Date);
});

it("clears completedAt for non-completed status", async () => {
  const data = validData({ status: CustomerCareStatus.SCHEDULED, completedAt: new Date() });
  await service.validateBeforeCreate(data);
  expect(data.completedAt).toBeNull();
});

it("rejects nextFollowUpAt before scheduledAt", async () => {
  await expect(service.validateBeforeCreate(invalidFollowUpData())).rejects.toThrow(
    "Thời gian chăm sóc tiếp theo phải sau thời gian dự kiến",
  );
});
```

- [ ] **Step 2: Run RED test**

Run: `yarn jest src/modules/customerCare/__tests__/customerCare.service.spec.ts --runInBand`

Expected: FAIL because the module/entity does not exist.

- [ ] **Step 3: Create entity and validator**

Use these enum values and nullable semantics:

```ts
export enum CustomerCareMethod {
  CALL = "CALL",
  EMAIL = "EMAIL",
  ZALO = "ZALO",
  SMS = "SMS",
  IN_PERSON = "IN_PERSON",
  OTHER = "OTHER",
}

export enum CustomerCareStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}
```

`CreateCustomerCareSchema` requires UUID customer/employee, enums and
`scheduledAt`; update schema is partial. Query schema extends `BaseSchema` and
requires `customerId`.

- [ ] **Step 4: Generate and complete module skeleton**

Use the repository generator workflow required by `BE/CLAUDE.md`, then keep only
the generated files needed for this module. Configure repository relations and
selects for customer/employee display.

- [ ] **Step 5: Implement business validation**

`CustomerCareService` verifies customer and employee through their repositories,
normalizes `completedAt`, and rejects invalid `nextFollowUpAt`. Both create and
update use the same private normalization helper; update merges existing values
before validation.

- [ ] **Step 6: Run GREEN test**

Run: `yarn jest src/modules/customerCare/__tests__/customerCare.service.spec.ts --runInBand`

Expected: PASS.

- [ ] **Step 7: Commit backend contract**

```bash
git add src/database/models/CustomerCare.ts src/modules/customerCare
git commit -m "feat(customer-care): add customer care domain"
```

## Task 2: Persistence, API, DI and permission

**Files:**
- Create: `src/database/migrations/1778200000000-CreateCustomerCares.ts`
- Create: `src/modules/customerCare/customerCare.types.ts`
- Create: `src/modules/customerCare/customerCare.container.ts`
- Create: `src/modules/customerCare/customerCare.controller.ts`
- Create: `src/modules/customerCare/customerCare.route.ts`
- Modify: `src/database/models/index.ts`
- Modify: `src/database/models/PermissionGroup.ts`
- Modify: `src/modules/container.ts`
- Modify: `src/routers/admin.routes.ts`
- Create: `src/modules/customerCare/SKILL.md`

- [ ] **Step 1: Add migration**

Create PostgreSQL enum types, `customer_cares`, audit/soft-delete columns matching
`BaseEntity`, foreign keys with safe delete behavior, and partial index:

```sql
CREATE INDEX "IDX_customer_cares_customer_scheduled"
ON "customer_cares" ("customerId", "scheduledAt" DESC)
WHERE "deletedAt" IS NULL
```

`down` drops index, table and both enum types.

- [ ] **Step 2: Wire CRUD route**

Use permission middleware on every endpoint:

```ts
permissionMiddleware({ customerService: ["read"] })
permissionMiddleware({ customerService: ["create"] })
permissionMiddleware({ customerService: ["update"] })
permissionMiddleware({ customerService: ["delete"] })
```

Mount the router at `/customer-services`.

- [ ] **Step 3: Register model and DI**

Export `CustomerCare`, load `customerCareContainer`, bind repository/service/
controller/router symbols with `Symbol.for(...)`, and add `customerService` to
`MODULES`.

- [ ] **Step 4: Document module**

Record naming, enums, time normalization, required `customerId` list filter,
permission key, endpoint and verification commands in `SKILL.md`.

- [ ] **Step 5: Verify backend**

Run:

```bash
yarn jest src/modules/customerCare --runInBand
yarn build
```

Expected: tests and TypeScript build PASS.

- [ ] **Step 6: Commit API slice**

```bash
git add src/database src/modules src/routers
git commit -m "feat(customer-care): expose protected customer care API"
```

## Task 3: Frontend API contract and local data hook

**Files:**
- Modify: `src/constants/ApiEndpoint.ts`
- Create: `src/models/customerCare.ts`
- Create: `src/hooks/useCustomerCareData.ts`

- [ ] **Step 1: Define FE contract**

```ts
export interface ICustomerCare extends IEntity {
  customerId: string;
  employeeId: string;
  method: CustomerCareMethod;
  status: CustomerCareStatus;
  scheduledAt: string;
  completedAt: string | null;
  nextFollowUpAt: string | null;
  note: string | null;
  customer?: ICustomer;
  employee?: IEmployee;
}
```

Export method/status option arrays with the approved Vietnamese labels.

- [ ] **Step 2: Implement local CRUD hook**

Use `getData`, `postData`, `putData`, `deleteData`. The hook receives
`customerId`, page and size; it exposes `data`, `pagination`, `loading`, `error`,
`fetch`, `create`, `update`, and `remove`. Every successful mutation awaits
`fetch` before resolving so the modal never shows stale data.

- [ ] **Step 3: Type-check**

Run: `yarn build`

Expected: PASS or only a pre-existing failure explicitly proven against clean
HEAD.

- [ ] **Step 4: Commit FE contract**

```bash
git add src/constants/ApiEndpoint.ts src/models/customerCare.ts src/hooks/useCustomerCareData.ts
git commit -m "feat(customer-care): add frontend data contract"
```

## Task 4: Customer care popup and form

**Files:**
- Create: `src/pages/Private/customer/components/customerCare/CustomerCareModal.tsx`
- Create: `src/pages/Private/customer/components/customerCare/CustomerCareFormModal.tsx`

- [ ] **Step 1: Build form modal**

Use Ant Design `Form`, `Modal`, `Select`, project `DatePickerCustom`,
`EmployeeSelect`, `Label`, and `SubmitButton`. Submit ISO timestamps. Watch
`status`; when it becomes `COMPLETED`, default `completedAt` to `dayjs()`; hide
and clear the field for other statuses.

- [ ] **Step 2: Build history modal**

Use Ant Design table with Vietnamese labels, status tags, formatted timestamps,
ellipsis note, pagination and explicit empty/loading states. Permission gates:

```ts
const canCreate = checkPermission(permissions, "customerService", "create");
const canUpdate = checkPermission(permissions, "customerService", "update");
const canDelete = checkPermission(permissions, "customerService", "delete");
```

Delete uses `Modal.confirm`. Add/edit close only after mutation succeeds.

- [ ] **Step 3: Build FE**

Run: `yarn build`

Expected: PASS.

- [ ] **Step 4: Commit popup**

```bash
git add src/pages/Private/customer/components/customerCare
git commit -m "feat(customer-care): add history management popup"
```

## Task 5: Customer table action integration

**Files:**
- Modify: `src/components/dropdown/ActionMenu.tsx`
- Modify: `src/components/table/TableColumnConfig.tsx`
- Modify: `src/pages/Private/customer/components/CustomerTable.tsx`
- Modify: `src/pages/Private/customer/index.tsx`

- [ ] **Step 1: Extend shared action interface**

Add optional `onCustomerCare` callback. Insert its menu item before `onCopy`
without changing existing item order:

```tsx
onCustomerCare && {
  label: "Lịch sử chăm sóc",
  key: "customer-care",
  icon: <ClockIcon className="w-7 h-7 text-white bg-cyan-600 rounded-md p-1" />,
  onClick: onCustomerCare,
}
```

- [ ] **Step 2: Thread callback through table**

Add optional callback to `TableColumnConfigProps`/`ObjectTableProps`, include it
in the empty-action condition, and bind the current record.

- [ ] **Step 3: Integrate customer page**

Show callback only for `customerService.read`, store selected customer and modal
open state independently of the existing add/update customer state, then render
`CustomerCareModal`.

- [ ] **Step 4: Verify FE**

Run:

```bash
yarn lint
yarn build
```

Expected: lint/build PASS. Manually verify action order and CRUD flow when a
backend is available.

- [ ] **Step 5: Commit integration**

```bash
git add src/components src/pages/Private/customer
git commit -m "feat(customer): expose customer care history action"
```

## Final checkpoint

- [ ] `git -C BE status --short` and `git -C FE status --short` contain no
  unintended files.
- [ ] Focused BE tests pass.
- [ ] BE build passes.
- [ ] FE lint and build pass.
- [ ] Migration is present but has not been executed.
- [ ] Permission action is enforced at BE and hidden at FE.
- [ ] Review the complete diff for scope, error handling and regressions before
  reporting completion.
