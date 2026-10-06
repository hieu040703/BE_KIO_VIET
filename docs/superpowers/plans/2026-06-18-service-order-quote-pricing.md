# Service Order Quote Pricing Implementation Plan

> **Execution note:** Implement this plan only after explicit user authorization. Repository rules
> disable the Superpowers execution and subagent skills, so execute the checked steps inline.

**Goal:** Make `ServiceOrder.quote` the canonical store for surcharges and discounts, calculate
urgent/fragile/voucher rows on the backend, and keep VAT in dedicated order fields.

**Architecture:** A pure pricing module builds and totals backend-managed `IQuoteItem` rows. Client
estimate, create, and update flows resolve trusted database inputs and call the same module; admin
updates use the same normalization path. VAT is calculated after the signed quote subtotal and is
never emitted as a quote item.

**Tech Stack:** Node.js 24, TypeScript, Express 5, TypeORM 0.3, Inversify 7, Zod 4, Jest/ts-jest,
PostgreSQL.

---

## File Map

- Modify `src/modules/serviceOrder/serviceOrder.pricing.ts`: canonical quote composition, totals,
  urgency decision, and estimated-price result.
- Modify `src/modules/serviceOrder/serviceOrder.pricing.spec.ts`: pure pricing behavior and boundary
  coverage.
- Modify `src/modules/appSetting/appSetting.repository.ts`: one accessor for all order-pricing
  settings.
- Modify `src/modules/appSetting/appSetting.repository.spec.ts`: pricing-setting defaults and values.
- Modify `src/modules/serviceOrder/serviceOrder.validator.ts`: trusted customer create contract,
  complete quote schema, and estimated-price `hasFragileItems`.
- Create `src/modules/serviceOrder/serviceOrder.validator.spec.ts`: schema regression tests.
- Modify `src/modules/serviceOrder/client.serviceOrder.route.ts`: use the customer-specific create
  schema.
- Modify `src/modules/serviceOrder/client.serviceOrder.controller.ts`: call the customer create
  orchestration method.
- Modify `src/modules/serviceOrder/client.serviceOrder.service.ts`: shared estimate/create input
  resolution, voucher value return, create sanitization, and update recalculation.
- Create `src/modules/serviceOrder/serviceOrder.client-pricing.spec.ts`: focused service orchestration
  tests with mocked repositories.
- Modify `src/modules/serviceOrder/admin.serviceOrder.service.ts`: normalize admin quote updates and
  map quote discounts/details during confirmation.
- Create `src/modules/serviceOrder/serviceOrder.confirm-pricing.spec.ts`: confirmation mapping tests.
- Modify `src/database/models/ServiceOrder.ts`: remove commented legacy fields while retaining the
  canonical quote and VAT columns.
- Modify `src/modules/serviceOrder/serviceOrder.select.ts`: remove stale entity selections.
- Create `src/database/migrations/1777700000000-DropLegacyServiceOrderPricingColumns.ts`: guarded
  removal/restoration of legacy columns.
- Modify `src/modules/serviceOrder/SKILL.md`: record the final pricing invariants.

### Task 1: Build the canonical pure pricing engine

**Files:**
- Modify: `src/modules/serviceOrder/serviceOrder.pricing.ts`
- Modify: `src/modules/serviceOrder/serviceOrder.pricing.spec.ts`

- [ ] **Step 1: Replace old field-based tests with quote-based failing tests**

Use fixed time values so urgency boundaries are deterministic. Add tests equivalent to:

```ts
import { OrderFeeCategoryCodeEnum, ServiceOrderTypeEnum } from "@/shared/constants/constance";
import {
  buildServiceOrderPricing,
  calculateEstimatedServiceOrderPrice,
  isUrgentServiceOrder,
} from "./serviceOrder.pricing";

const now = new Date("2026-06-18T08:00:00.000Z");

it("applies urgent and fragile percentages to base price before voucher and VAT", () => {
  const result = buildServiceOrderPricing({
    baseItems: [{ key: "Phí dịch vụ", value: 1_000_000, code: null, type: "inc" }],
    isUrgent: true,
    urgentSurchargePercent: 20,
    hasFragileItems: true,
    fragileItemSurchargePercent: 10,
    voucherDiscountAmount: 500_000,
    hasVat: true,
    vat: 10,
  });

  expect(result.quote).toEqual([
    { key: "Phí dịch vụ", value: 1_000_000, code: null, type: "inc" },
    { key: "Phụ phí đơn gấp", value: 200_000, code: OrderFeeCategoryCodeEnum.URGENT, type: "inc" },
    { key: "Phụ phí hàng dễ vỡ", value: 100_000, code: OrderFeeCategoryCodeEnum.FRAGILE_ITEM, type: "inc" },
    { key: "Giảm giá voucher", value: 500_000, code: OrderFeeCategoryCodeEnum.VOUCHER_DISCOUNT, type: "dec" },
  ]);
  expect(result.basePrice).toBe(1_000_000);
  expect(result.preVatAmount).toBe(800_000);
  expect(result.vatAmount).toBe(80_000);
  expect(result.amount).toBe(880_000);
});

it("removes managed rows before regenerating them", () => {
  const result = buildServiceOrderPricing({
    baseItems: [
      { key: "Phí dịch vụ", value: 1_000_000, code: null, type: "inc" },
      { key: "old", value: 999, code: OrderFeeCategoryCodeEnum.URGENT, type: "inc" },
    ],
    isUrgent: true,
    urgentSurchargePercent: 20,
  });
  expect(result.quote.filter((item) => item.code === OrderFeeCategoryCodeEnum.URGENT)).toHaveLength(1);
});

it.each([
  [new Date("2026-06-18T10:00:00.000Z"), true],
  [new Date("2026-06-18T10:00:00.001Z"), false],
  [new Date("2026-06-18T07:59:59.999Z"), false],
])("checks the urgent window", (timeAt, expected) => {
  expect(isUrgentServiceOrder({ enabled: true, urgentOrderHours: 2, timeAt, now })).toBe(expected);
});
```

Also update estimated-price tests to assert VAT is absent from `items` and present in
`vat/vatAmount/preVatAmount/totalPrice`, and assert every item has `code` and `type`.

- [ ] **Step 2: Run the pure pricing tests and verify the old implementation fails**

Run:

```bash
npx jest src/modules/serviceOrder/serviceOrder.pricing.spec.ts --runInBand
```

Expected: FAIL because `buildServiceOrderPricing` and `isUrgentServiceOrder` do not exist and the
current estimate still emits VAT as an item.

- [ ] **Step 3: Implement canonical quote composition and totals**

Replace field-based pricing types with `IQuoteItem`-based types. Keep the existing base package fee
formulas, then pass the base fee through the canonical builder:

```ts
import { IQuoteItem } from "@/database/models/ServiceOrder";
import { OrderFeeCategoryCodeEnum, ServiceOrderTypeEnum } from "@/shared/constants/constance";

const MANAGED_CODES = new Set([
  OrderFeeCategoryCodeEnum.URGENT,
  OrderFeeCategoryCodeEnum.FRAGILE_ITEM,
  OrderFeeCategoryCodeEnum.VOUCHER_DISCOUNT,
  OrderFeeCategoryCodeEnum.POINTS_DISCOUNT,
]);

export type BuildServiceOrderPricingInput = {
  baseItems: IQuoteItem[];
  isUrgent?: boolean;
  urgentSurchargePercent?: number | null;
  hasFragileItems?: boolean;
  fragileItemSurchargePercent?: number | null;
  voucherDiscountAmount?: number | null;
  hasVat?: boolean | null;
  vat?: number | null;
};

export const isUrgentServiceOrder = (input: {
  enabled: boolean;
  urgentOrderHours: number;
  timeAt: Date;
  now?: Date;
}): boolean => {
  if (!input.enabled || input.urgentOrderHours < 0) return false;
  const differenceMs = input.timeAt.getTime() - (input.now ?? new Date()).getTime();
  return differenceMs >= 0 && differenceMs <= input.urgentOrderHours * 60 * 60 * 1000;
};

export const buildServiceOrderPricing = (input: BuildServiceOrderPricingInput) => {
  const baseItems = input.baseItems.filter((item) => item.code == null || !MANAGED_CODES.has(item.code));
  const basePrice = baseItems
    .filter((item) => item.type === "inc")
    .reduce((sum, item) => sum + money(item.value), 0);
  const quote = [...baseItems];
  const addPercentFee = (enabled: boolean | undefined, percent: number, code: OrderFeeCategoryCodeEnum, key: string) => {
    const value = enabled ? (Math.max(basePrice, 0) * percent) / 100 : 0;
    if (value > 0) quote.push({ key, value, code, type: "inc" });
  };
  addPercentFee(input.isUrgent, money(input.urgentSurchargePercent), OrderFeeCategoryCodeEnum.URGENT, "Phụ phí đơn gấp");
  addPercentFee(input.hasFragileItems, money(input.fragileItemSurchargePercent), OrderFeeCategoryCodeEnum.FRAGILE_ITEM, "Phụ phí hàng dễ vỡ");
  const subtotalBeforeVoucher = signedTotal(quote);
  const voucherDiscount = Math.min(money(input.voucherDiscountAmount), Math.max(subtotalBeforeVoucher, 0));
  if (voucherDiscount > 0) {
    quote.push({ key: "Giảm giá voucher", value: voucherDiscount, code: OrderFeeCategoryCodeEnum.VOUCHER_DISCOUNT, type: "dec" });
  }
  const preVatAmount = Math.max(signedTotal(quote), 0);
  const vatAmount = input.hasVat ? (preVatAmount * money(input.vat)) / 100 : 0;
  return { quote, basePrice, preVatAmount, vatAmount, amount: preVatAmount + vatAmount };
};
```

Define `signedTotal()` beside `money()`. Extend `EstimatedServiceOrderPriceInput` with urgency,
fragile, and surcharge percentage inputs. Return:

```ts
type EstimatedServiceOrderPriceResult = {
  items: IQuoteItem[];
  basePrice: number;
  preVatAmount: number;
  vat: number;
  vatAmount: number;
  totalPrice: number;
  isUrgent: boolean;
};
```

- [ ] **Step 4: Run pricing tests**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Commit the pure pricing slice**

```bash
git add src/modules/serviceOrder/serviceOrder.pricing.ts src/modules/serviceOrder/serviceOrder.pricing.spec.ts
git commit -m "refactor(service-order): calculate adjustments from quote items"
```

### Task 2: Expose order pricing settings through one repository call

**Files:**
- Modify: `src/modules/appSetting/appSetting.repository.ts`
- Modify: `src/modules/appSetting/appSetting.repository.spec.ts`

- [ ] **Step 1: Add failing repository tests**

Add tests that expect configured values and complete defaults:

```ts
await expect(repository.getOrderPricingConfig()).resolves.toEqual({
  vat: 10,
  urgentOrderEnabled: true,
  urgentOrderHours: 2,
  urgentOrderSurchargePercent: 20,
  fragileItemSurchargePercent: 10,
});

repository.findAll = jest.fn().mockResolvedValue([]);
await expect(repository.getOrderPricingConfig()).resolves.toEqual({
  vat: 0,
  urgentOrderEnabled: false,
  urgentOrderHours: 0,
  urgentOrderSurchargePercent: 0,
  fragileItemSurchargePercent: 0,
});
```

- [ ] **Step 2: Run the repository spec and verify failure**

```bash
npx jest src/modules/appSetting/appSetting.repository.spec.ts --runInBand
```

Expected: FAIL because `getOrderPricingConfig` is missing.

- [ ] **Step 3: Add `getOrderPricingConfig()`**

Implement one `findAll()` read and normalize missing keys:

```ts
async getOrderPricingConfig() {
  const order = (await this.findAll())[0]?.order;
  return {
    vat: order?.vat ?? 0,
    urgentOrderEnabled: order?.urgentOrderEnabled ?? false,
    urgentOrderHours: order?.urgentOrderHours ?? 0,
    urgentOrderSurchargePercent: order?.urgentOrderSurchargePercent ?? 0,
    fragileItemSurchargePercent: order?.fragileItemSurchargePercent ?? 0,
  };
}
```

- [ ] **Step 4: Run the repository spec and commit**

Expected: PASS.

```bash
git add src/modules/appSetting/appSetting.repository.ts src/modules/appSetting/appSetting.repository.spec.ts
git commit -m "feat(app-setting): expose service order pricing config"
```

### Task 3: Tighten validators and split the customer create contract

**Files:**
- Modify: `src/modules/serviceOrder/serviceOrder.validator.ts`
- Create: `src/modules/serviceOrder/serviceOrder.validator.spec.ts`
- Modify: `src/modules/serviceOrder/client.serviceOrder.route.ts`

- [ ] **Step 1: Write failing schema tests**

Cover these exact cases:

```ts
it("strips backend-owned calculated fields from customer create", () => {
  const parsed = CustomerCreateServiceOrderSchema.parse({
    type: ServiceOrderTypeEnum.XE_NANG_XE_CAU,
    serviceId: crypto.randomUUID(),
    timeAt: "2026-06-18T10:00:00.000Z",
    address,
    servicePrices: [{ servicePriceId: crypto.randomUUID(), quantity: 2 }],
    isUrgent: true,
    amount: 1,
  });
  expect(parsed).not.toHaveProperty("isUrgent");
  expect(parsed).not.toHaveProperty("amount");
});

it("strips backend-owned calculated fields from customer update", () => {
  const parsed = CustomerUpdateServiceOrderSchema.parse({
    hasFragileItems: true,
    quote: [{ key: "Forged", value: 1, code: null, type: "inc" }],
    amount: 1,
    isUrgent: true,
  });
  expect(parsed).toEqual({ hasFragileItems: true });
});

it("accepts a manual service request with null servicePrices", () => {
  expect(() => CustomerCreateServiceOrderSchema.parse({
    type: ServiceOrderTypeEnum.CHUYEN_NHA_VAN_PHONG,
    serviceId: crypto.randomUUID(),
    timeAt: "2026-06-18T10:00:00.000Z",
    address,
    servicePrices: null,
  })).not.toThrow();
});

it("validates complete quote items", () => {
  expect(() => UpdateServiceOrderSchema.parse({ quote: [{ key: "Phí", value: 10 }] })).toThrow();
});

it("accepts hasFragileItems in estimated price", () => {
  expect(CustomerEstimateServiceOrderPriceSchema.parse(estimatePayload).hasFragileItems).toBe(true);
});
```

- [ ] **Step 2: Run the validator spec and verify failure**

```bash
npx jest src/modules/serviceOrder/serviceOrder.validator.spec.ts --runInBand
```

Expected: FAIL because the customer schema and complete quote validation are missing.

- [ ] **Step 3: Define reusable schemas and customer DTO**

Import `OrderFeeCategoryCodeEnum`. Define:

```ts
export const QuoteItemSchema = z.object({
  key: z.string().trim().min(1),
  value: z.number().min(0),
  code: z.enum(OrderFeeCategoryCodeEnum).nullable(),
  type: z.enum(["inc", "dec"]),
  note: z.string().nullish(),
});

const SelectedServicePriceSchema = z.object({
  servicePriceId: z.uuid(),
  quantity: z.number().positive().optional(),
});
```

Remove all deleted model properties from `CreateServiceOrderSchema` and
`UpdateServiceOrderSchema`. Use `QuoteItemSchema` for `quote`.

Create a client-only schema by omitting backend-owned fields and extending request-only fields:

```ts
export const CustomerCreateServiceOrderSchema = CreateServiceOrderSchema.omit({
  customerId: true,
  branchId: true,
  employeeId: true,
  isUrgent: true,
  basePrice: true,
  quote: true,
  preVatAmount: true,
  vat: true,
  vatAmount: true,
  amount: true,
  status: true,
}).extend({
  serviceId: z.uuid(),
  servicePrices: z.array(SelectedServicePriceSchema).nullish(),
});

export const CustomerUpdateServiceOrderSchema = UpdateServiceOrderSchema.omit({
  customerId: true,
  branchId: true,
  employeeId: true,
  isUrgent: true,
  basePrice: true,
  quote: true,
  preVatAmount: true,
  vat: true,
  vatAmount: true,
  amount: true,
  status: true,
  servicePrices: true,
});
```

Use the same `SelectedServicePriceSchema` in estimated-price and add
`hasFragileItems: z.boolean().optional()`.

Export `CustomerCreateServiceOrderDto` and `CustomerUpdateServiceOrderDto`. Change the client POST
`/` and PUT `/:id` routes to use the customer-specific schemas; admin routes continue using the
entity/admin schemas.

- [ ] **Step 4: Run validator tests and commit**

Expected: PASS.

```bash
git add src/modules/serviceOrder/serviceOrder.validator.ts \
  src/modules/serviceOrder/serviceOrder.validator.spec.ts \
  src/modules/serviceOrder/client.serviceOrder.route.ts
git commit -m "refactor(service-order): separate trusted customer pricing inputs"
```

### Task 4: Share trusted pricing between estimate and create

**Files:**
- Modify: `src/modules/serviceOrder/client.serviceOrder.controller.ts`
- Modify: `src/modules/serviceOrder/client.serviceOrder.service.ts`
- Create: `src/modules/serviceOrder/serviceOrder.client-pricing.spec.ts`

- [ ] **Step 1: Add focused failing orchestration tests**

Instantiate `ClientServiceOrderService` with mocked constructor dependencies. Spy on
`serviceOrderRepository.create`, `serviceRepository.findById`, `servicePriceRepository.findByOptions`,
`appSettingRepository.getOrderPricingConfig`, and voucher lookup. Cover:

```ts
it("recalculates automatic create from database prices", async () => {
  serviceRepository.findById.mockResolvedValue({ id: "service-1", type, autoQuote: true });
  servicePriceRepository.findByOptions.mockResolvedValue([
    { id: "price-1", serviceId: "service-1", category: "Xe 2.5 tan", unit: "chuyen", price: 1_000_000, quantity: 1, excessUnitPrice: 0 },
  ]);
  await service.createCustomerOrder(payloadWithClientAmounts as any, customerRequest, manager);
  expect(serviceOrderRepository.create).toHaveBeenCalledWith(
    expect.objectContaining({
      isUrgent: true,
      basePrice: 1_000_000,
      amount: 1_430_000,
      servicePrices: [{ name: "Xe 2.5 tan", unit: "chuyen", price: 1_000_000, quantity: 1, note: null }],
    }),
    manager,
  );
});

it("creates a manual quote request without calculated totals", async () => {
  serviceRepository.findById.mockResolvedValue({ id: "service-2", type, autoQuote: false });
  await service.createCustomerOrder({ ...payload, servicePrices: null }, customerRequest, manager);
  expect(serviceOrderRepository.create).toHaveBeenCalledWith(
    expect.objectContaining({ needsQuote: true, quote: null, amount: null, servicePrices: null }),
    manager,
  );
});

it("rejects price rows from another service", async () => {
  servicePriceRepository.findByOptions.mockResolvedValue([{ id: "price-1", serviceId: "other" }]);
  await expect(service.createCustomerOrder(payload, customerRequest, manager)).rejects.toThrow(
    "Bảng giá không thuộc dịch vụ đã chọn",
  );
});
```

For the first test, use `basePrice = 1_000_000`, urgent `20%`, fragile `10%`, VAT `10%`, and no
voucher, producing `preVatAmount = 1_300_000` and `amount = 1_430_000`; keep the assertion value
`1_430_000` so test fixtures and expected math agree.

- [ ] **Step 2: Run the new service spec and verify failure**

```bash
npx jest src/modules/serviceOrder/serviceOrder.client-pricing.spec.ts --runInBand
```

Expected: FAIL because `createCustomerOrder` does not exist and the service still uses removed
fields.

- [ ] **Step 3: Make voucher resolution return a value instead of mutating a removed field**

Refactor `applyVoucherDiscount` into:

```ts
private async resolveVoucherDiscountAmount(
  vouchersId: string | null | undefined,
  customerId: string,
  manager?: IEntityManager,
): Promise<number> {
  if (!vouchersId) return 0;
  // Keep the existing lock, separate VouchersTemplate query, and resolveVoucherDiscountAmount call.
  return resolveVoucherDiscountAmount({ voucher, customerId, templateAmount: vouchersTemplate.amount });
}
```

Do not change voucher ownership, used-state, expiry, transaction lock, or mark-used behavior.

- [ ] **Step 4: Add shared trusted-input resolution**

Change `resolveEstimatedServicePrices` to return IDs and snapshot fields as well as pricing fields:

```ts
type ResolvedServicePrice = {
  id: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  includedQuantity: number;
  excessUnitPrice: number;
};
```

Add `resolveAutomaticPricingInput()` that:

1. Loads `Service` and validates `service.type === data.type`.
2. Requires non-empty selections only when `service.autoQuote` is true.
3. Rejects non-empty selections for manual services.
4. Resolves current DB prices and transport distance.
5. Reads `getOrderPricingConfig()` once.
6. Computes `isUrgent` with backend time.
7. Resolves voucher amount for the authenticated customer.
8. Calls `calculateEstimatedServiceOrderPrice()`.

- [ ] **Step 5: Implement `createCustomerOrder()` and sanitize persistence**

Add a public method accepting `CustomerCreateServiceOrderDto`. Destructure request-only fields so
they cannot reach TypeORM:

```ts
async createCustomerOrder(
  input: CustomerCreateServiceOrderDto,
  req: Request,
  manager?: IEntityManager,
): Promise<ApiResponse<ServiceOrder>> {
  const { serviceId, servicePrices: selectedPrices, ...entityData } = input;
  const resolved = await this.resolveCustomerPricing({ ...input, serviceId, servicePrices: selectedPrices }, req, manager);
  const persistenceData: DeepPartial<ServiceOrder> = resolved.service.autoQuote
    ? {
        ...entityData,
        needsQuote: false,
        servicePrices: resolved.snapshots,
        isUrgent: resolved.estimate.isUrgent,
        quote: resolved.estimate.items,
        basePrice: resolved.estimate.basePrice,
        preVatAmount: resolved.estimate.preVatAmount,
        vat: resolved.estimate.vat,
        vatAmount: resolved.estimate.vatAmount,
        amount: resolved.estimate.totalPrice,
      }
    : {
        ...entityData,
        needsQuote: true,
        servicePrices: null,
        isUrgent: resolved.isUrgent,
        quote: null,
        basePrice: null,
        preVatAmount: null,
        vat: entityData.hasVat ? resolved.settings.vat : 0,
        vatAmount: null,
        amount: null,
      };
  return super.create(persistenceData, req, manager);
}
```

Retain customer ID/code/branch assignment in `validateBeforeCreate`, but remove old field-based
pricing and client quote summing from that hook.

Update the controller create handler to call `createCustomerOrder(req.body, req, tx.manager)`.

- [ ] **Step 6: Refactor `estimatePrice()` to use the same resolver**

Return the shared estimate directly. It must include fragile and urgent rows, separate VAT fields,
and never append a VAT quote item. Remove debug `console.log` statements in price resolution.

- [ ] **Step 7: Run focused pricing, validator, voucher, and service specs**

```bash
npx jest \
  src/modules/serviceOrder/serviceOrder.pricing.spec.ts \
  src/modules/serviceOrder/serviceOrder.validator.spec.ts \
  src/modules/serviceOrder/serviceOrder.voucher.spec.ts \
  src/modules/serviceOrder/serviceOrder.client-pricing.spec.ts \
  --runInBand
```

Expected: PASS.

- [ ] **Step 8: Commit the client estimate/create slice**

```bash
git add src/modules/serviceOrder/client.serviceOrder.controller.ts \
  src/modules/serviceOrder/client.serviceOrder.service.ts \
  src/modules/serviceOrder/serviceOrder.client-pricing.spec.ts
git commit -m "feat(service-order): recalculate customer quotes on backend"
```

### Task 5: Recalculate client and admin updates from quote items

**Files:**
- Modify: `src/modules/serviceOrder/client.serviceOrder.service.ts`
- Modify: `src/modules/serviceOrder/admin.serviceOrder.service.ts`
- Modify: `src/modules/serviceOrder/serviceOrder.client-pricing.spec.ts`

- [ ] **Step 1: Add failing update normalization tests**

Add cases for changing `timeAt`, `hasFragileItems`, `vouchersId`, and `hasVat`. Assert the saved
quote contains one row per managed code, preserves `code: null` manual rows, and recalculates VAT
outside the quote. Add an admin case proving a forged managed-code row is replaced.

- [ ] **Step 2: Run the service spec and verify failure**

Use the focused command from Task 4. Expected: FAIL on stale field access and duplicate/forged
managed rows.

- [ ] **Step 3: Add a shared service-level recalculation method**

Implement a method that merges current and incoming state, resolves AppSetting and voucher amount,
derives urgency, and calls `buildServiceOrderPricing()`:

```ts
private async recalculateStoredQuote(
  current: ServiceOrder,
  changes: Partial<ServiceOrder>,
  customerId: string,
  manager?: IEntityManager,
): Promise<void> {
  const settings = await this.appSettingRepository.getOrderPricingConfig();
  const timeAt = this.normalizeDate(changes.timeAt ?? current.timeAt)!;
  const isUrgent = isUrgentServiceOrder({
    enabled: settings.urgentOrderEnabled,
    urgentOrderHours: settings.urgentOrderHours,
    timeAt,
  });
  const vouchersId = changes.vouchersId === undefined ? current.vouchersId : changes.vouchersId;
  const voucherDiscountAmount = await this.resolveVoucherDiscountAmount(vouchersId, customerId, manager);
  const pricing = buildServiceOrderPricing({
    baseItems: changes.quote ?? current.quote ?? [],
    isUrgent,
    urgentSurchargePercent: settings.urgentOrderSurchargePercent,
    hasFragileItems: changes.hasFragileItems ?? current.hasFragileItems,
    fragileItemSurchargePercent: settings.fragileItemSurchargePercent,
    voucherDiscountAmount,
    hasVat: changes.hasVat ?? current.hasVat,
    vat: changes.hasVat === false ? 0 : settings.vat,
  });
  Object.assign(changes, {
    isUrgent,
    quote: pricing.quote,
    basePrice: pricing.basePrice,
    preVatAmount: pricing.preVatAmount,
    vat: changes.hasVat === false ? 0 : settings.vat,
    vatAmount: pricing.vatAmount,
    amount: pricing.amount,
  });
}
```

Trigger it only when quote or pricing choices change. Preserve existing voucher release/mark-used
transaction behavior.

- [ ] **Step 4: Apply the same normalization in admin updates**

Remove old `applyPricing` and stale property checks. Add an admin helper with the same builder. Admin
updates may provide manual rows, but managed code rows are stripped and regenerated. If customer or
voucher data is required, load it from the current service order. Add an admin-local voucher resolver
using the existing `vouchersRepository` and `resolveVoucherDiscountAmount()` helper. Keep the
transaction lock and load `VouchersTemplate` separately, matching the client flow; pass the resolved
number to `buildServiceOrderPricing()` instead of assigning a removed entity field.

- [ ] **Step 5: Run focused tests and commit**

Expected: PASS.

```bash
git add src/modules/serviceOrder/client.serviceOrder.service.ts \
  src/modules/serviceOrder/admin.serviceOrder.service.ts \
  src/modules/serviceOrder/serviceOrder.client-pricing.spec.ts
git commit -m "refactor(service-order): normalize quote adjustments on update"
```

### Task 6: Map quote discounts correctly when confirming an Order

**Files:**
- Modify: `src/modules/serviceOrder/admin.serviceOrder.service.ts`
- Create: `src/modules/serviceOrder/serviceOrder.confirm-pricing.spec.ts`

- [ ] **Step 1: Write a failing confirmation mapping test**

Extract and test a small exported pure mapper if direct service construction is too broad:

```ts
expect(mapServiceOrderQuoteToOrderPricing([
  { key: "Phí dịch vụ", value: 1_000_000, code: null, type: "inc" },
  { key: "Phụ phí", value: 200_000, code: OrderFeeCategoryCodeEnum.URGENT, type: "inc" },
  { key: "Voucher", value: 300_000, code: OrderFeeCategoryCodeEnum.VOUCHER_DISCOUNT, type: "dec" },
])).toEqual({
  discountAmount: 300_000,
  details: [
    { name: "Phí dịch vụ", quantity: 1, price: 1_000_000, unit: "ca", total: 1_000_000 },
    { name: "Phụ phí", quantity: 1, price: 200_000, unit: "ca", total: 200_000 },
  ],
});
```

- [ ] **Step 2: Run the test and verify failure**

```bash
npx jest src/modules/serviceOrder/serviceOrder.confirm-pricing.spec.ts --runInBand
```

Expected: FAIL because the mapper is missing and confirm reads deleted discount fields.

- [ ] **Step 3: Implement and use the mapper**

Place the pure mapper in `serviceOrder.pricing.ts` and import it in admin service. Replace:

```ts
discountAmount: (exist.pointsDiscountAmount || 0) + (exist.voucherDiscountAmount || 0)
```

with mapper output. Populate `details` only from `inc` rows. Keep VAT and final amount mapping
unchanged.

- [ ] **Step 4: Run the confirmation and pricing specs and commit**

```bash
npx jest \
  src/modules/serviceOrder/serviceOrder.confirm-pricing.spec.ts \
  src/modules/serviceOrder/serviceOrder.pricing.spec.ts \
  --runInBand
```

Expected: PASS.

```bash
git add src/modules/serviceOrder/serviceOrder.pricing.ts \
  src/modules/serviceOrder/admin.serviceOrder.service.ts \
  src/modules/serviceOrder/serviceOrder.confirm-pricing.spec.ts
git commit -m "fix(service-order): map quote discounts during confirmation"
```

### Task 7: Remove stale selections and legacy database columns

**Files:**
- Modify: `src/database/models/ServiceOrder.ts`
- Modify: `src/modules/serviceOrder/serviceOrder.select.ts`
- Create: `src/database/migrations/1777700000000-DropLegacyServiceOrderPricingColumns.ts`

- [ ] **Step 1: Remove stale select properties**

Delete selections for:

```ts
urgentSurchargePercent
urgentSurchargeAmount
fragileItemSurchargePercent
fragileItemSurchargeAmount
discountedPrice
usedPoints
pointsDiscountAmount
voucherDiscountAmount
```

Keep `isUrgent`, `hasFragileItems`, `basePrice`, `vouchersId`, `quote`, all VAT fields, and `amount`.
Delete the commented legacy property blocks from `ServiceOrder.ts`; do not change retained columns
or the `IQuoteItem` fields.

- [ ] **Step 2: Add the guarded migration**

Create the migration with one statement per column so deployed schemas with partial legacy state are
safe:

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class DropLegacyServiceOrderPricingColumns1777700000000 implements MigrationInterface {
  name = "DropLegacyServiceOrderPricingColumns1777700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const column of [
      "urgentSurchargePercent",
      "urgentSurchargeAmount",
      "fragileItemSurchargePercent",
      "fragileItemSurchargeAmount",
      "isUsePoints",
      "usedPoints",
      "pointsDiscountAmount",
      "voucherDiscountAmount",
      "discountedPrice",
    ]) {
      await queryRunner.query(`ALTER TABLE "service_orders" DROP COLUMN IF EXISTS "${column}"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "urgentSurchargePercent" double precision NULL`);
    await queryRunner.query(`ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "urgentSurchargeAmount" decimal(15,2) NULL DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "fragileItemSurchargePercent" double precision NULL`);
    await queryRunner.query(`ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "fragileItemSurchargeAmount" decimal(15,2) NULL DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "isUsePoints" boolean NULL`);
    await queryRunner.query(`ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "usedPoints" integer NULL`);
    await queryRunner.query(`ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "pointsDiscountAmount" decimal(15,2) NULL DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "voucherDiscountAmount" decimal(15,2) NULL DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "discountedPrice" decimal(15,2) NULL DEFAULT NULL`);
  }
}
```

- [ ] **Step 3: Compile to catch entity/select drift**

```bash
npm run build
```

Expected: PASS with no `ServiceOrder` property errors.

- [ ] **Step 4: Commit persistence cleanup**

```bash
git add src/database/models/ServiceOrder.ts \
  src/modules/serviceOrder/serviceOrder.select.ts \
  src/database/migrations/1777700000000-DropLegacyServiceOrderPricingColumns.ts
git commit -m "chore(service-order): drop legacy pricing columns"
```

Do not run `npm run db:migrate` without confirming the target database environment.

### Task 8: Update module knowledge and verify the full change

**Files:**
- Modify: `src/modules/serviceOrder/SKILL.md`

- [ ] **Step 1: Replace stale module notes**

Document these invariants:

```md
- `ServiceOrder.quote` is the canonical non-VAT pricing ledger. Backend-managed rows use
  `URGENT`, `FRAGILE_ITEM`, and `VOUCHER_DISCOUNT`; VAT remains in dedicated entity fields.
- `isUrgent` is backend-derived from `AppSetting.order.urgentOrderEnabled`, `urgentOrderHours`, and
  `ServiceOrder.timeAt`.
- Customer estimate and create resolve `ServicePrice` values from the database and share the same
  pricing engine. Manual services use `servicePrices: null | []` and begin with `needsQuote = true`.
- Updating time, fragile selection, voucher, VAT, or quote regenerates managed quote rows.
- Confirmation maps `dec` quote rows to `Order.discountAmount` and only `inc` rows to details.
```

- [ ] **Step 2: Scan for stale legacy references**

```bash
rg -n "urgentSurchargePercent|urgentSurchargeAmount|fragileItemSurchargePercent|fragileItemSurchargeAmount|isUsePoints|usedPoints|pointsDiscountAmount|voucherDiscountAmount|discountedPrice" \
  src --glob '!database/migrations/1777700000000-DropLegacyServiceOrderPricingColumns.ts'
```

Expected: no runtime/model/validator/select references. References in historical migration files are
acceptable; comments in `ServiceOrder.ts` should be deleted after confirming the migration exists.

- [ ] **Step 3: Run all focused ServiceOrder and AppSetting tests**

```bash
npx jest \
  src/modules/appSetting/appSetting.repository.spec.ts \
  src/modules/appSetting/appSetting.validator.spec.ts \
  src/modules/serviceOrder/serviceOrder.pricing.spec.ts \
  src/modules/serviceOrder/serviceOrder.validator.spec.ts \
  src/modules/serviceOrder/serviceOrder.voucher.spec.ts \
  src/modules/serviceOrder/serviceOrder.client-pricing.spec.ts \
  src/modules/serviceOrder/serviceOrder.confirm-pricing.spec.ts \
  src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts \
  --runInBand
```

Expected: all suites PASS. Existing ts-jest warnings may be reported separately but must not hide a
test failure.

- [ ] **Step 4: Run the backend build and diff checks**

```bash
npm run build
git diff --check
git status --short
```

Expected: build exits 0, diff check exits 0, and status contains only intentional files.

- [ ] **Step 5: Commit documentation**

```bash
git add src/modules/serviceOrder/SKILL.md
git commit -m "docs(service-order): record quote pricing invariants"
```

- [ ] **Step 6: Report the API break explicitly**

The handoff must state that client consumers need to:

- send `hasFragileItems` to estimated-price;
- consume VAT from response fields rather than `items`;
- create automatic orders with `serviceId` and `servicePriceId/quantity` selections;
- use `servicePrices: null | []` for manual services;
- stop sending backend-owned calculated fields.
