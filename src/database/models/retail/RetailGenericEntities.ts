import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailTenant } from "./RetailTenant";

/**
 * Generic model for tables in the SQL file that intentionally share the same
 * extensible record shape. These tables are registered for schema awareness;
 * business APIs are enabled only after their workflow is defined.
 */
export abstract class RetailGenericRecord extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ type: "varchar", length: 80, nullable: true }) code!: string | null;
  @Column({ type: "varchar", length: 255, nullable: true }) name!: string | null;
  @Column({ type: "varchar", length: 30, default: "ACTIVE" }) status!: string;
  @Column({ name: "reference_id", type: "uuid", nullable: true }) referenceId!: string | null;
  @Column({ type: "numeric", precision: 18, scale: 2, nullable: true }) amount!: number | null;
  @Column({ type: "numeric", precision: 18, scale: 4, nullable: true }) quantity!: number | null;
  @Column({ type: "jsonb", default: () => "'{}'::jsonb" }) data!: Record<string, unknown>;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true }) deletedAt!: Date | null;
}

@Entity("tenant_settings")
export class RetailTenantSettings extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "tenant_settings_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("stores")
export class RetailStores extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "stores_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("roles")
export class RetailRoles extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "roles_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("permissions")
export class RetailPermissions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "permissions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("user_roles")
export class RetailUserRoles extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "user_roles_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("role_permissions")
export class RetailRolePermissions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "role_permissions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("user_sessions")
export class RetailUserSessions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "user_sessions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("api_keys")
export class RetailApiKeys extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "api_keys_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("audit_logs")
export class RetailAuditLogs extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "audit_logs_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("departments")
export class RetailDepartments extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "departments_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("positions")
export class RetailPositions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "positions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("employee_profiles")
export class RetailEmployeeProfiles extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "employee_profiles_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("employee_contracts")
export class RetailEmployeeContracts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "employee_contracts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("employee_documents")
export class RetailEmployeeDocuments extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "employee_documents_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("employee_branch_assignments")
export class RetailEmployeeBranchAssignments extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "employee_branch_assignments_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("employee_position_history")
export class RetailEmployeePositionHistory extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "employee_position_history_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("work_shifts")
export class RetailWorkShifts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "work_shifts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("shift_assignments")
export class RetailShiftAssignments extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "shift_assignments_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("attendance_devices")
export class RetailAttendanceDevices extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "attendance_devices_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("attendance_logs")
export class RetailAttendanceLogs extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "attendance_logs_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("leave_types")
export class RetailLeaveTypes extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "leave_types_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("leave_balances")
export class RetailLeaveBalances extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "leave_balances_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("leave_requests")
export class RetailLeaveRequests extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "leave_requests_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("holidays")
export class RetailHolidays extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "holidays_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("overtime_requests")
export class RetailOvertimeRequests extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "overtime_requests_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("salary_components")
export class RetailSalaryComponents extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "salary_components_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("employee_salary_components")
export class RetailEmployeeSalaryComponents extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "employee_salary_components_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("payroll_periods")
export class RetailPayrollPeriods extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "payroll_periods_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("payroll_items")
export class RetailPayrollItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "payroll_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("kpi_definitions")
export class RetailKpiDefinitions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "kpi_definitions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("employee_kpis")
export class RetailEmployeeKpis extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "employee_kpis_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("commission_policies")
export class RetailCommissionPolicies extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "commission_policies_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("employee_commissions")
export class RetailEmployeeCommissions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "employee_commissions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("bonuses")
export class RetailBonuses extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "bonuses_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("penalties")
export class RetailPenalties extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "penalties_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("categories")
export class RetailCategories extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "categories_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("brands")
export class RetailBrands extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "brands_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("units")
export class RetailUnits extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "units_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("product_images")
export class RetailProductImages extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "product_images_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("attributes")
export class RetailAttributes extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "attributes_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("attribute_values")
export class RetailAttributeValues extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "attribute_values_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("variant_attribute_values")
export class RetailVariantAttributeValues extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "variant_attribute_values_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("product_barcodes")
export class RetailProductBarcodes extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "product_barcodes_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("product_units")
export class RetailProductUnits extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "product_units_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("bundles")
export class RetailBundles extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "bundles_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("bundle_items")
export class RetailBundleItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "bundle_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("price_books")
export class RetailPriceBooks extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "price_books_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("price_book_items")
export class RetailPriceBookItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "price_book_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("tax_rates")
export class RetailTaxRates extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "tax_rates_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("product_tax_rates")
export class RetailProductTaxRates extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "product_tax_rates_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("stock_reservations")
export class RetailStockReservations extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "stock_reservations_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("stock_adjustments")
export class RetailStockAdjustments extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "stock_adjustments_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("stock_adjustment_items")
export class RetailStockAdjustmentItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "stock_adjustment_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("stock_counts")
export class RetailStockCounts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "stock_counts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("stock_count_items")
export class RetailStockCountItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "stock_count_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("stock_transfers")
export class RetailStockTransfers extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "stock_transfers_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("stock_transfer_items")
export class RetailStockTransferItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "stock_transfer_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("inventory_batches")
export class RetailInventoryBatches extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "inventory_batches_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("serial_numbers")
export class RetailSerialNumbers extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "serial_numbers_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("inventory_cost_layers")
export class RetailInventoryCostLayers extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "inventory_cost_layers_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("suppliers")
export class RetailSuppliers extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "suppliers_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("supplier_contacts")
export class RetailSupplierContacts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "supplier_contacts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("supplier_addresses")
export class RetailSupplierAddresses extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "supplier_addresses_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("purchase_orders")
export class RetailPurchaseOrders extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "purchase_orders_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("purchase_order_items")
export class RetailPurchaseOrderItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "purchase_order_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("goods_receipts")
export class RetailGoodsReceipts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "goods_receipts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("goods_receipt_items")
export class RetailGoodsReceiptItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "goods_receipt_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("purchase_returns")
export class RetailPurchaseReturns extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "purchase_returns_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("purchase_return_items")
export class RetailPurchaseReturnItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "purchase_return_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("supplier_debts")
export class RetailSupplierDebts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "supplier_debts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("supplier_debt_transactions")
export class RetailSupplierDebtTransactions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "supplier_debt_transactions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_addresses")
export class RetailCustomerAddresses extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_addresses_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_contacts")
export class RetailCustomerContacts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_contacts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_groups")
export class RetailCustomerGroups extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_groups_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_group_members")
export class RetailCustomerGroupMembers extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_group_members_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_tags")
export class RetailCustomerTags extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_tags_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_tag_maps")
export class RetailCustomerTagMaps extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_tag_maps_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_notes")
export class RetailCustomerNotes extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_notes_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_activities")
export class RetailCustomerActivities extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_activities_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_debts")
export class RetailCustomerDebts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_debts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("customer_debt_transactions")
export class RetailCustomerDebtTransactions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "customer_debt_transactions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("loyalty_tiers")
export class RetailLoyaltyTiers extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "loyalty_tiers_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("loyalty_accounts")
export class RetailLoyaltyAccounts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "loyalty_accounts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("loyalty_transactions")
export class RetailLoyaltyTransactions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "loyalty_transactions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("sales_channels")
export class RetailSalesChannels extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "sales_channels_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("carts")
export class RetailCarts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "carts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("cart_items")
export class RetailCartItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "cart_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("order_status_history")
export class RetailOrderStatusHistory extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "order_status_history_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("order_discounts")
export class RetailOrderDiscounts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "order_discounts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("order_taxes")
export class RetailOrderTaxes extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "order_taxes_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("order_notes")
export class RetailOrderNotes extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "order_notes_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("fulfillments")
export class RetailFulfillments extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "fulfillments_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("fulfillment_items")
export class RetailFulfillmentItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "fulfillment_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("shipments")
export class RetailShipments extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "shipments_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("shipment_items")
export class RetailShipmentItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "shipment_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("returns")
export class RetailReturns extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "returns_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("return_items")
export class RetailReturnItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "return_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("exchanges")
export class RetailExchanges extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "exchanges_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("exchange_items")
export class RetailExchangeItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "exchange_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("invoices")
export class RetailInvoices extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "invoices_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("invoice_items")
export class RetailInvoiceItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "invoice_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("payment_methods")
export class RetailPaymentMethods extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "payment_methods_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("payment_transactions")
export class RetailPaymentTransactions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "payment_transactions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("payment_allocations")
export class RetailPaymentAllocations extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "payment_allocations_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("refunds")
export class RetailRefunds extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "refunds_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("refund_items")
export class RetailRefundItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "refund_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("reconciliations")
export class RetailReconciliations extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "reconciliations_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("reconciliation_items")
export class RetailReconciliationItems extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "reconciliation_items_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("cash_registers")
export class RetailCashRegisters extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "cash_registers_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("cash_sessions")
export class RetailCashSessions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "cash_sessions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("cash_movements")
export class RetailCashMovements extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "cash_movements_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("cashbooks")
export class RetailCashbooks extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "cashbooks_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("receipts")
export class RetailReceipts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "receipts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("expenses")
export class RetailExpenses extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "expenses_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("expense_categories")
export class RetailExpenseCategories extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "expense_categories_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("financial_accounts")
export class RetailFinancialAccounts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "financial_accounts_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("account_transactions")
export class RetailAccountTransactions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "account_transactions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("promotions")
export class RetailPromotions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "promotions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("promotion_rules")
export class RetailPromotionRules extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "promotion_rules_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("promotion_actions")
export class RetailPromotionActions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "promotion_actions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("promotion_products")
export class RetailPromotionProducts extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "promotion_products_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("promotion_customer_groups")
export class RetailPromotionCustomerGroups extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "promotion_customer_groups_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("coupons")
export class RetailCoupons extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "coupons_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("coupon_usages")
export class RetailCouponUsages extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "coupon_usages_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("vouchers")
export class RetailVouchers extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "vouchers_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("voucher_transactions")
export class RetailVoucherTransactions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "voucher_transactions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("gift_cards")
export class RetailGiftCards extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "gift_cards_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("gift_card_transactions")
export class RetailGiftCardTransactions extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "gift_card_transactions_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("shipping_providers")
export class RetailShippingProviders extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "shipping_providers_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("shipping_orders")
export class RetailShippingOrders extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "shipping_orders_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("notifications")
export class RetailNotifications extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "notifications_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("notification_recipients")
export class RetailNotificationRecipients extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "notification_recipients_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("files")
export class RetailFiles extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "files_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("system_settings")
export class RetailSystemSettings extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "system_settings_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("webhooks")
export class RetailWebhooks extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "webhooks_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("webhook_deliveries")
export class RetailWebhookDeliveries extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "webhook_deliveries_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("jobs")
export class RetailJobs extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "jobs_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("job_logs")
export class RetailJobLogs extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "job_logs_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("number_sequences")
export class RetailNumberSequences extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "number_sequences_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("tags")
export class RetailTags extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "tags_tenant_id_fkey" })
  tenant!: RetailTenant;
}

@Entity("entity_tags")
export class RetailEntityTags extends RetailGenericRecord {
  @ManyToOne(() => RetailTenant)
  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "entity_tags_tenant_id_fkey" })
  tenant!: RetailTenant;
}

export const retailGenericTableEntities = [
  { tableName: "tenant_settings", entity: RetailTenantSettings },
  { tableName: "stores", entity: RetailStores },
  { tableName: "roles", entity: RetailRoles },
  { tableName: "permissions", entity: RetailPermissions },
  { tableName: "user_roles", entity: RetailUserRoles },
  { tableName: "role_permissions", entity: RetailRolePermissions },
  { tableName: "user_sessions", entity: RetailUserSessions },
  { tableName: "api_keys", entity: RetailApiKeys },
  { tableName: "audit_logs", entity: RetailAuditLogs },
  { tableName: "departments", entity: RetailDepartments },
  { tableName: "positions", entity: RetailPositions },
  { tableName: "employee_profiles", entity: RetailEmployeeProfiles },
  { tableName: "employee_contracts", entity: RetailEmployeeContracts },
  { tableName: "employee_documents", entity: RetailEmployeeDocuments },
  { tableName: "employee_branch_assignments", entity: RetailEmployeeBranchAssignments },
  { tableName: "employee_position_history", entity: RetailEmployeePositionHistory },
  { tableName: "work_shifts", entity: RetailWorkShifts },
  { tableName: "shift_assignments", entity: RetailShiftAssignments },
  { tableName: "attendance_devices", entity: RetailAttendanceDevices },
  { tableName: "attendance_logs", entity: RetailAttendanceLogs },
  { tableName: "leave_types", entity: RetailLeaveTypes },
  { tableName: "leave_balances", entity: RetailLeaveBalances },
  { tableName: "leave_requests", entity: RetailLeaveRequests },
  { tableName: "holidays", entity: RetailHolidays },
  { tableName: "overtime_requests", entity: RetailOvertimeRequests },
  { tableName: "salary_components", entity: RetailSalaryComponents },
  { tableName: "employee_salary_components", entity: RetailEmployeeSalaryComponents },
  { tableName: "payroll_periods", entity: RetailPayrollPeriods },
  { tableName: "payroll_items", entity: RetailPayrollItems },
  { tableName: "kpi_definitions", entity: RetailKpiDefinitions },
  { tableName: "employee_kpis", entity: RetailEmployeeKpis },
  { tableName: "commission_policies", entity: RetailCommissionPolicies },
  { tableName: "employee_commissions", entity: RetailEmployeeCommissions },
  { tableName: "bonuses", entity: RetailBonuses },
  { tableName: "penalties", entity: RetailPenalties },
  { tableName: "categories", entity: RetailCategories },
  { tableName: "brands", entity: RetailBrands },
  { tableName: "units", entity: RetailUnits },
  { tableName: "product_images", entity: RetailProductImages },
  { tableName: "attributes", entity: RetailAttributes },
  { tableName: "attribute_values", entity: RetailAttributeValues },
  { tableName: "variant_attribute_values", entity: RetailVariantAttributeValues },
  { tableName: "product_barcodes", entity: RetailProductBarcodes },
  { tableName: "product_units", entity: RetailProductUnits },
  { tableName: "bundles", entity: RetailBundles },
  { tableName: "bundle_items", entity: RetailBundleItems },
  { tableName: "price_books", entity: RetailPriceBooks },
  { tableName: "price_book_items", entity: RetailPriceBookItems },
  { tableName: "tax_rates", entity: RetailTaxRates },
  { tableName: "product_tax_rates", entity: RetailProductTaxRates },
  { tableName: "stock_reservations", entity: RetailStockReservations },
  { tableName: "stock_adjustments", entity: RetailStockAdjustments },
  { tableName: "stock_adjustment_items", entity: RetailStockAdjustmentItems },
  { tableName: "stock_counts", entity: RetailStockCounts },
  { tableName: "stock_count_items", entity: RetailStockCountItems },
  { tableName: "stock_transfers", entity: RetailStockTransfers },
  { tableName: "stock_transfer_items", entity: RetailStockTransferItems },
  { tableName: "inventory_batches", entity: RetailInventoryBatches },
  { tableName: "serial_numbers", entity: RetailSerialNumbers },
  { tableName: "inventory_cost_layers", entity: RetailInventoryCostLayers },
  { tableName: "suppliers", entity: RetailSuppliers },
  { tableName: "supplier_contacts", entity: RetailSupplierContacts },
  { tableName: "supplier_addresses", entity: RetailSupplierAddresses },
  { tableName: "purchase_orders", entity: RetailPurchaseOrders },
  { tableName: "purchase_order_items", entity: RetailPurchaseOrderItems },
  { tableName: "goods_receipts", entity: RetailGoodsReceipts },
  { tableName: "goods_receipt_items", entity: RetailGoodsReceiptItems },
  { tableName: "purchase_returns", entity: RetailPurchaseReturns },
  { tableName: "purchase_return_items", entity: RetailPurchaseReturnItems },
  { tableName: "supplier_debts", entity: RetailSupplierDebts },
  { tableName: "supplier_debt_transactions", entity: RetailSupplierDebtTransactions },
  { tableName: "customer_addresses", entity: RetailCustomerAddresses },
  { tableName: "customer_contacts", entity: RetailCustomerContacts },
  { tableName: "customer_groups", entity: RetailCustomerGroups },
  { tableName: "customer_group_members", entity: RetailCustomerGroupMembers },
  { tableName: "customer_tags", entity: RetailCustomerTags },
  { tableName: "customer_tag_maps", entity: RetailCustomerTagMaps },
  { tableName: "customer_notes", entity: RetailCustomerNotes },
  { tableName: "customer_activities", entity: RetailCustomerActivities },
  { tableName: "customer_debts", entity: RetailCustomerDebts },
  { tableName: "customer_debt_transactions", entity: RetailCustomerDebtTransactions },
  { tableName: "loyalty_tiers", entity: RetailLoyaltyTiers },
  { tableName: "loyalty_accounts", entity: RetailLoyaltyAccounts },
  { tableName: "loyalty_transactions", entity: RetailLoyaltyTransactions },
  { tableName: "sales_channels", entity: RetailSalesChannels },
  { tableName: "carts", entity: RetailCarts },
  { tableName: "cart_items", entity: RetailCartItems },
  { tableName: "order_status_history", entity: RetailOrderStatusHistory },
  { tableName: "order_discounts", entity: RetailOrderDiscounts },
  { tableName: "order_taxes", entity: RetailOrderTaxes },
  { tableName: "order_notes", entity: RetailOrderNotes },
  { tableName: "fulfillments", entity: RetailFulfillments },
  { tableName: "fulfillment_items", entity: RetailFulfillmentItems },
  { tableName: "shipments", entity: RetailShipments },
  { tableName: "shipment_items", entity: RetailShipmentItems },
  { tableName: "returns", entity: RetailReturns },
  { tableName: "return_items", entity: RetailReturnItems },
  { tableName: "exchanges", entity: RetailExchanges },
  { tableName: "exchange_items", entity: RetailExchangeItems },
  { tableName: "invoices", entity: RetailInvoices },
  { tableName: "invoice_items", entity: RetailInvoiceItems },
  { tableName: "payment_methods", entity: RetailPaymentMethods },
  { tableName: "payment_transactions", entity: RetailPaymentTransactions },
  { tableName: "payment_allocations", entity: RetailPaymentAllocations },
  { tableName: "refunds", entity: RetailRefunds },
  { tableName: "refund_items", entity: RetailRefundItems },
  { tableName: "reconciliations", entity: RetailReconciliations },
  { tableName: "reconciliation_items", entity: RetailReconciliationItems },
  { tableName: "cash_registers", entity: RetailCashRegisters },
  { tableName: "cash_sessions", entity: RetailCashSessions },
  { tableName: "cash_movements", entity: RetailCashMovements },
  { tableName: "cashbooks", entity: RetailCashbooks },
  { tableName: "receipts", entity: RetailReceipts },
  { tableName: "expenses", entity: RetailExpenses },
  { tableName: "expense_categories", entity: RetailExpenseCategories },
  { tableName: "financial_accounts", entity: RetailFinancialAccounts },
  { tableName: "account_transactions", entity: RetailAccountTransactions },
  { tableName: "promotions", entity: RetailPromotions },
  { tableName: "promotion_rules", entity: RetailPromotionRules },
  { tableName: "promotion_actions", entity: RetailPromotionActions },
  { tableName: "promotion_products", entity: RetailPromotionProducts },
  { tableName: "promotion_customer_groups", entity: RetailPromotionCustomerGroups },
  { tableName: "coupons", entity: RetailCoupons },
  { tableName: "coupon_usages", entity: RetailCouponUsages },
  { tableName: "vouchers", entity: RetailVouchers },
  { tableName: "voucher_transactions", entity: RetailVoucherTransactions },
  { tableName: "gift_cards", entity: RetailGiftCards },
  { tableName: "gift_card_transactions", entity: RetailGiftCardTransactions },
  { tableName: "shipping_providers", entity: RetailShippingProviders },
  { tableName: "shipping_orders", entity: RetailShippingOrders },
  { tableName: "notifications", entity: RetailNotifications },
  { tableName: "notification_recipients", entity: RetailNotificationRecipients },
  { tableName: "files", entity: RetailFiles },
  { tableName: "system_settings", entity: RetailSystemSettings },
  { tableName: "webhooks", entity: RetailWebhooks },
  { tableName: "webhook_deliveries", entity: RetailWebhookDeliveries },
  { tableName: "jobs", entity: RetailJobs },
  { tableName: "job_logs", entity: RetailJobLogs },
  { tableName: "number_sequences", entity: RetailNumberSequences },
  { tableName: "tags", entity: RetailTags },
  { tableName: "entity_tags", entity: RetailEntityTags },
] as const;

export const retailGenericEntities = retailGenericTableEntities.map(({ entity }) => entity);
