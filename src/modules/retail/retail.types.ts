import { EntityTarget } from "typeorm";
import {
  RetailAttendance,
  RetailBranch,
  RetailCustomer,
  RetailEmployee,
  RetailInventory,
  RetailOrder,
  RetailOrderItem,
  RetailPayment,
  RetailPayroll,
  RetailProduct,
  RetailProductVariant,
  RetailStockLedger,
  RetailTenant,
  RetailUser,
  RetailWarehouse,
} from "@/database/models";
import { retailGenericTableEntities } from "@/database/models/retail/RetailGenericEntities";

export const RETAIL_TYPES = {
  RetailRepository: Symbol.for("RetailRepository"),
  RetailService: Symbol.for("RetailService"),
  RetailController: Symbol.for("RetailController"),
  RetailRouter: Symbol.for("RetailRouter"),
};

export type RetailResource = string;

export interface RetailTableDefinition {
  resource: RetailResource;
  tableName: string;
  entity: EntityTarget<any>;
  tenantScoped: boolean;
  softDelete: boolean;
  writable: string[];
  required: string[];
  searchable: string[];
  sortColumn: string;
  referenceResource?: RetailResource;
  referenceTableName?: string;
}

/**
 * Generic retail tables keep workflow-specific attributes in data jsonb.
 * These are the known UUID keys used by the Kiot workflows. They are exposed
 * as metadata so the frontend can render real relation selectors and the API
 * can validate the links inside data instead of accepting unrelated UUIDs.
 */
export const RETAIL_DATA_RELATIONS: Record<string, Record<string, RetailResource>> = {
  "employee-profiles": { employeeId: "employees" },
  "employee-contracts": { employeeId: "employees" },
  "employee-documents": { employeeId: "employees", createdBy: "users" },
  "employee-branch-assignments": { employeeId: "employees", branchId: "branches" },
  "employee-position-history": { employeeId: "employees", positionId: "positions" },
  "shift-assignments": { employeeId: "employees", shiftId: "work-shifts" },
  "attendance-devices": { branchId: "branches" },
  "attendance-logs": { employeeId: "employees", deviceId: "attendance-devices", attendanceId: "attendances" },
  "leave-balances": { employeeId: "employees", leaveTypeId: "leave-types" },
  "leave-requests": { employeeId: "employees", leaveTypeId: "leave-types" },
  "overtime-requests": { employeeId: "employees" },
  "employee-salary-components": { employeeId: "employees", salaryComponentId: "salary-components" },
  "payroll-items": { payrollId: "payrolls", employeeId: "employees", payrollPeriodId: "payroll-periods" },
  "employee-kpis": { employeeId: "employees", kpiDefinitionId: "kpi-definitions" },
  "employee-commissions": { employeeId: "employees", commissionPolicyId: "commission-policies" },
  bonuses: { employeeId: "employees" },
  penalties: { employeeId: "employees" },
  "product-images": { productId: "products", variantId: "product-variants" },
  "attribute-values": { attributeId: "attributes" },
  "variant-attribute-values": { variantId: "product-variants", attributeValueId: "attribute-values" },
  "product-barcodes": { productId: "products", variantId: "product-variants" },
  "product-units": { productId: "products", unitId: "units" },
  bundles: { productId: "products" },
  "bundle-items": { bundleId: "bundles", productId: "products", variantId: "product-variants" },
  "price-book-items": { priceBookId: "price-books", variantId: "product-variants" },
  "product-tax-rates": { productId: "products", variantId: "product-variants", taxRateId: "tax-rates" },
  "stock-reservations": { warehouseId: "warehouses", variantId: "product-variants", orderId: "orders" },
  "stock-adjustments": { warehouseId: "warehouses", createdBy: "users" },
  "stock-adjustment-items": { stockAdjustmentId: "stock-adjustments", variantId: "product-variants" },
  "stock-counts": { warehouseId: "warehouses", createdBy: "users" },
  "stock-count-items": { stockCountId: "stock-counts", variantId: "product-variants" },
  "stock-transfers": { fromWarehouseId: "warehouses", toWarehouseId: "warehouses", createdBy: "users" },
  "stock-transfer-items": { stockTransferId: "stock-transfers", variantId: "product-variants" },
  "inventory-batches": { warehouseId: "warehouses", variantId: "product-variants" },
  "serial-numbers": { warehouseId: "warehouses", variantId: "product-variants", inventoryBatchId: "inventory-batches" },
  "inventory-cost-layers": { warehouseId: "warehouses", variantId: "product-variants" },
  "supplier-contacts": { supplierId: "suppliers" },
  "supplier-addresses": { supplierId: "suppliers" },
  "purchase-orders": { warehouseId: "warehouses", supplierId: "suppliers", createdBy: "users" },
  "purchase-order-items": { purchaseOrderId: "purchase-orders", variantId: "product-variants" },
  "goods-receipts": { warehouseId: "warehouses", supplierId: "suppliers", purchaseOrderId: "purchase-orders", createdBy: "users" },
  "goods-receipt-items": { goodsReceiptId: "goods-receipts", variantId: "product-variants", purchaseOrderId: "purchase-orders" },
  "purchase-returns": { goodsReceiptId: "goods-receipts", supplierId: "suppliers", warehouseId: "warehouses" },
  "purchase-return-items": { purchaseReturnId: "purchase-returns", goodsReceiptItemId: "goods-receipt-items", variantId: "product-variants" },
  "supplier-debts": { supplierId: "suppliers", goodsReceiptId: "goods-receipts" },
  "supplier-debt-transactions": { supplierDebtId: "supplier-debts", supplierId: "suppliers", goodsReceiptId: "goods-receipts", purchaseReturnId: "purchase-returns" },
  "customer-addresses": { customerId: "customers" },
  "customer-contacts": { customerId: "customers" },
  "customer-group-members": { customerId: "customers", customerGroupId: "customer-groups" },
  "customer-tag-maps": { customerId: "customers", customerTagId: "customer-tags" },
  "customer-notes": { customerId: "customers", createdBy: "users" },
  "customer-activities": { customerId: "customers", createdBy: "users" },
  "customer-debts": { customerId: "customers", orderId: "orders" },
  "customer-debt-transactions": { customerDebtId: "customer-debts", customerId: "customers", orderId: "orders", paymentId: "payments" },
  "loyalty-accounts": { customerId: "customers", loyaltyTierId: "loyalty-tiers" },
  "loyalty-transactions": { loyaltyAccountId: "loyalty-accounts", customerId: "customers", orderId: "orders" },
  carts: { customerId: "customers", branchId: "branches" },
  "cart-items": { cartId: "carts", variantId: "product-variants" },
  fulfillments: { orderId: "orders", warehouseId: "warehouses" },
  "fulfillment-items": { fulfillmentId: "fulfillments", orderId: "orders", orderItemId: "order-items", variantId: "product-variants" },
  shipments: { orderId: "orders", fulfillmentId: "fulfillments", shippingOrderId: "shipping-orders" },
  "shipment-items": { shipmentId: "shipments", orderId: "orders", orderItemId: "order-items", variantId: "product-variants" },
  "order-status-history": { orderId: "orders", createdBy: "users" },
  "order-discounts": { orderId: "orders", promotionId: "promotions", couponId: "coupons" },
  "order-taxes": { orderId: "orders", taxRateId: "tax-rates" },
  "order-notes": { orderId: "orders", createdBy: "users" },
  returns: { orderId: "orders", refundId: "refunds" },
  "return-items": { returnId: "returns", refundId: "refunds", orderId: "orders", orderItemId: "order-items", variantId: "product-variants" },
  exchanges: { orderId: "orders", exchangeOrderId: "orders" },
  "exchange-items": { exchangeId: "exchanges", orderId: "orders", orderItemId: "order-items", variantId: "product-variants" },
  invoices: { orderId: "orders" },
  "invoice-items": { invoiceId: "invoices", orderId: "orders", orderItemId: "order-items", variantId: "product-variants" },
  "payment-transactions": { paymentId: "payments", orderId: "orders" },
  "payment-allocations": { paymentId: "payments", orderId: "orders", invoiceId: "invoices" },
  refunds: { orderId: "orders", paymentId: "payments" },
  "refund-items": { refundId: "refunds", orderId: "orders", orderItemId: "order-items", variantId: "product-variants" },
  "cash-sessions": { cashRegisterId: "cash-registers", openedBy: "users", closedBy: "users" },
  "cash-movements": { cashSessionId: "cash-sessions", paymentId: "payments", orderId: "orders", customerId: "customers", supplierId: "suppliers", paymentMethodId: "payment-methods" },
  cashbooks: { cashRegisterId: "cash-registers" },
  receipts: { paymentId: "payments", customerId: "customers", supplierId: "suppliers" },
  expenses: { expenseCategoryId: "expense-categories", paymentMethodId: "payment-methods" },
  "account-transactions": { financialAccountId: "financial-accounts" },
  "promotion-rules": { promotionId: "promotions" },
  "promotion-actions": { promotionId: "promotions" },
  "promotion-products": { promotionId: "promotions", productId: "products", variantId: "product-variants" },
  "promotion-customer-groups": { promotionId: "promotions", customerGroupId: "customer-groups" },
  coupons: { promotionId: "promotions" },
  "coupon-usages": { couponId: "coupons", promotionId: "promotions", orderId: "orders", customerId: "customers" },
  "voucher-transactions": { voucherId: "vouchers", orderId: "orders" },
  "gift-card-transactions": { giftCardId: "gift-cards", orderId: "orders", customerId: "customers" },
  "shipping-orders": { orderId: "orders", shippingProviderId: "shipping-providers" },
  "notification-recipients": { notificationId: "notifications", userId: "users" },
  "webhook-deliveries": { webhookId: "webhooks" },
  "job-logs": { jobId: "jobs" },
  "entity-tags": { tagId: "tags" },
  "reconciliation-items": { reconciliationId: "reconciliations" },
};

export interface RetailFieldDefinition {
  name: string;
  databaseName: string;
  type: string;
  nullable: boolean;
  generated: boolean;
  primary: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  enumValues?: string[];
  relation?: RetailRelationDefinition;
  writable: boolean;
  required: boolean;
}

export interface RetailRelationDefinition {
  resource: RetailResource;
  tableName: string;
  type: string;
  foreignKeyName?: string;
}

const RETAIL_CORE_RESOURCES: Record<RetailResource, RetailTableDefinition> = {
  tenants: {
    resource: "tenants",
    tableName: "tenants",
    entity: RetailTenant,
    tenantScoped: false,
    softDelete: false,
    writable: ["code", "name", "status"],
    required: ["code", "name"],
    searchable: ["code", "name"],
    sortColumn: "created_at",
  },
  branches: {
    resource: "branches",
    tableName: "branches",
    entity: RetailBranch,
    tenantScoped: true,
    softDelete: false,
    writable: ["storeId", "code", "name", "address", "phone", "timezone", "status"],
    required: ["code", "name"],
    searchable: ["code", "name", "phone"],
    sortColumn: "created_at",
  },
  warehouses: {
    resource: "warehouses",
    tableName: "warehouses",
    entity: RetailWarehouse,
    tenantScoped: true,
    softDelete: false,
    writable: ["branchId", "code", "name", "isDefault", "status"],
    required: ["code", "name"],
    searchable: ["code", "name"],
    sortColumn: "created_at",
  },
  users: {
    resource: "users",
    tableName: "users",
    entity: RetailUser,
    tenantScoped: true,
    softDelete: true,
    writable: ["email", "phone", "passwordHash", "status", "lastLoginAt"],
    required: ["passwordHash"],
    searchable: ["email", "phone"],
    sortColumn: "created_at",
  },
  employees: {
    resource: "employees",
    tableName: "employees",
    entity: RetailEmployee,
    tenantScoped: true,
    softDelete: true,
    writable: ["userId", "employeeCode", "fullName", "phone", "email", "hireDate", "employmentStatus", "baseSalary"],
    required: ["employeeCode", "fullName"],
    searchable: ["employeeCode", "fullName", "phone", "email"],
    sortColumn: "created_at",
  },
  attendances: {
    resource: "attendances",
    tableName: "attendances",
    entity: RetailAttendance,
    tenantScoped: true,
    softDelete: false,
    writable: ["employeeId", "workDate", "shiftId", "checkIn", "checkOut", "workedMinutes", "lateMinutes", "earlyLeaveMinutes", "overtimeMinutes", "status"],
    required: ["employeeId", "workDate"],
    searchable: ["status"],
    sortColumn: "work_date",
  },
  payrolls: {
    resource: "payrolls",
    tableName: "payrolls",
    entity: RetailPayroll,
    tenantScoped: true,
    softDelete: false,
    writable: ["payrollPeriodId", "employeeId", "baseSalary", "allowanceTotal", "overtimeTotal", "commissionTotal", "bonusTotal", "deductionTotal", "grossSalary", "netSalary", "status", "paidAt"],
    required: ["employeeId"],
    searchable: ["status"],
    sortColumn: "created_at",
  },
  products: {
    resource: "products",
    tableName: "products",
    entity: RetailProduct,
    tenantScoped: true,
    softDelete: true,
    writable: ["categoryId", "brandId", "unitId", "code", "name", "productType", "trackInventory", "trackBatch", "trackSerial", "status"],
    required: ["code", "name"],
    searchable: ["code", "name"],
    sortColumn: "created_at",
  },
  "product-variants": {
    resource: "product-variants",
    tableName: "product_variants",
    entity: RetailProductVariant,
    tenantScoped: true,
    softDelete: false,
    writable: ["productId", "sku", "name", "costPrice", "salePrice", "status"],
    required: ["productId", "sku"],
    searchable: ["sku", "name"],
    sortColumn: "created_at",
  },
  inventories: {
    resource: "inventories",
    tableName: "inventories",
    entity: RetailInventory,
    tenantScoped: true,
    softDelete: false,
    writable: ["warehouseId", "variantId", "onHand", "reserved", "version"],
    required: ["warehouseId", "variantId"],
    searchable: [],
    sortColumn: "updated_at",
  },
  customers: {
    resource: "customers",
    tableName: "customers",
    entity: RetailCustomer,
    tenantScoped: true,
    softDelete: true,
    writable: ["code", "fullName", "phone", "email", "birthday", "gender", "totalSpent", "orderCount", "status"],
    required: ["code", "fullName"],
    searchable: ["code", "fullName", "phone", "email"],
    sortColumn: "created_at",
  },
  orders: {
    resource: "orders",
    tableName: "orders",
    entity: RetailOrder,
    tenantScoped: true,
    softDelete: false,
    writable: ["branchId", "warehouseId", "customerId", "employeeId", "orderCode", "channel", "status", "paymentStatus", "fulfillmentStatus", "subtotal", "discountTotal", "taxTotal", "shippingTotal", "grandTotal", "paidTotal", "debtTotal", "orderedAt"],
    required: ["branchId", "orderCode"],
    searchable: ["orderCode", "channel", "status", "paymentStatus"],
    sortColumn: "ordered_at",
  },
  "order-items": {
    resource: "order-items",
    tableName: "order_items",
    entity: RetailOrderItem,
    tenantScoped: true,
    softDelete: false,
    writable: ["orderId", "variantId", "employeeId", "quantity", "unitPrice", "discountTotal", "taxTotal", "lineTotal", "costTotal"],
    required: ["orderId", "variantId", "quantity", "unitPrice", "lineTotal"],
    searchable: [],
    sortColumn: "created_at",
  },
  payments: {
    resource: "payments",
    tableName: "payments",
    entity: RetailPayment,
    tenantScoped: true,
    softDelete: false,
    writable: ["orderId", "customerId", "paymentMethodId", "amount", "status", "externalReference", "idempotencyKey", "paidAt"],
    required: ["amount"],
    searchable: ["status", "externalReference", "idempotencyKey"],
    sortColumn: "created_at",
  },
  "stock-ledgers": {
    resource: "stock-ledgers",
    tableName: "stock_ledgers",
    entity: RetailStockLedger,
    tenantScoped: true,
    softDelete: false,
    writable: ["warehouseId", "variantId", "movementType", "quantity", "unitCost", "referenceType", "referenceId", "occurredAt", "createdBy", "metadata"],
    required: ["warehouseId", "variantId", "movementType", "quantity"],
    searchable: ["movementType", "referenceType"],
    sortColumn: "occurred_at",
  },
};

const toResource = (tableName: string): string => tableName.replace(/_/g, "-");

/**
 * Generic records use reference_id for their business parent. The target is
 * explicit per resource so generated CRUD and metadata-driven FE forms share
 * the same relationship contract.
 */
export const RETAIL_REFERENCE_RESOURCES: Record<string, RetailResource> = {
  "order-status-history": "orders",
  "order-discounts": "orders",
  "order-taxes": "orders",
  "order-notes": "orders",
  fulfillments: "orders",
  "fulfillment-items": "fulfillments",
  shipments: "orders",
  "shipment-items": "shipments",
  returns: "orders",
  "return-items": "returns",
  exchanges: "orders",
  "exchange-items": "exchanges",
  invoices: "orders",
  "invoice-items": "invoices",
  refunds: "orders",
  "refund-items": "refunds",
  "payment-transactions": "payments",
  "payment-allocations": "payments",
  "coupon-usages": "coupons",
  "voucher-transactions": "vouchers",
  "gift-card-transactions": "gift-cards",
  "customer-debts": "orders",
  "customer-debt-transactions": "customer-debts",
  "supplier-debts": "goods-receipts",
  "supplier-debt-transactions": "supplier-debts",
  "purchase-returns": "goods-receipts",
  "purchase-return-items": "purchase-returns",
  "loyalty-accounts": "customers",
  "loyalty-transactions": "loyalty-accounts",
  "payroll-items": "payrolls",
  "stock-adjustment-items": "stock-adjustments",
  "stock-count-items": "stock-counts",
  "stock-transfer-items": "stock-transfers",
  "reconciliation-items": "reconciliations",
};

const RETAIL_GENERIC_RESOURCES: Record<RetailResource, RetailTableDefinition> = Object.fromEntries(
  retailGenericTableEntities.map(({ tableName, entity }) => {
    const resource = toResource(tableName);
    const referenceResource = RETAIL_REFERENCE_RESOURCES[resource];
    return [
      resource,
      {
        resource,
        tableName,
        entity,
        tenantScoped: true,
        softDelete: true,
        writable: ["code", "name", "status", "referenceId", "amount", "quantity", "data"],
        required: [],
        searchable: ["code", "name"],
        sortColumn: "created_at",
        referenceResource,
        referenceTableName: referenceResource?.replace(/-/g, "_"),
      },
    ];
  }),
);

export const RETAIL_RESOURCES: Record<RetailResource, RetailTableDefinition> = {
  ...RETAIL_CORE_RESOURCES,
  ...RETAIL_GENERIC_RESOURCES,
};
