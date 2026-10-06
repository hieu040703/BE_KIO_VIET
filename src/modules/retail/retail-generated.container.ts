import { tenantsModule } from "./tenants/tenants.container";
import { tenantSettingsModule } from "./tenantSettings/tenantSettings.container";
import { storesModule } from "./stores/stores.container";
import { branchesModule } from "./branches/branches.container";
import { warehousesModule } from "./warehouses/warehouses.container";
import { usersModule } from "./users/users.container";
import { rolesModule } from "./roles/roles.container";
import { permissionsModule } from "./permissions/permissions.container";
import { userRolesModule } from "./userRoles/userRoles.container";
import { rolePermissionsModule } from "./rolePermissions/rolePermissions.container";
import { userSessionsModule } from "./userSessions/userSessions.container";
import { apiKeysModule } from "./apiKeys/apiKeys.container";
import { auditLogsModule } from "./auditLogs/auditLogs.container";
import { departmentsModule } from "./departments/departments.container";
import { positionsModule } from "./positions/positions.container";
import { employeesModule } from "./employees/employees.container";
import { employeeProfilesModule } from "./employeeProfiles/employeeProfiles.container";
import { employeeContractsModule } from "./employeeContracts/employeeContracts.container";
import { employeeDocumentsModule } from "./employeeDocuments/employeeDocuments.container";
import { employeeBranchAssignmentsModule } from "./employeeBranchAssignments/employeeBranchAssignments.container";
import { employeePositionHistoryModule } from "./employeePositionHistory/employeePositionHistory.container";
import { workShiftsModule } from "./workShifts/workShifts.container";
import { shiftAssignmentsModule } from "./shiftAssignments/shiftAssignments.container";
import { attendanceDevicesModule } from "./attendanceDevices/attendanceDevices.container";
import { attendanceLogsModule } from "./attendanceLogs/attendanceLogs.container";
import { attendancesModule } from "./attendances/attendances.container";
import { leaveTypesModule } from "./leaveTypes/leaveTypes.container";
import { leaveBalancesModule } from "./leaveBalances/leaveBalances.container";
import { leaveRequestsModule } from "./leaveRequests/leaveRequests.container";
import { holidaysModule } from "./holidays/holidays.container";
import { overtimeRequestsModule } from "./overtimeRequests/overtimeRequests.container";
import { salaryComponentsModule } from "./salaryComponents/salaryComponents.container";
import { employeeSalaryComponentsModule } from "./employeeSalaryComponents/employeeSalaryComponents.container";
import { payrollPeriodsModule } from "./payrollPeriods/payrollPeriods.container";
import { payrollsModule } from "./payrolls/payrolls.container";
import { payrollItemsModule } from "./payrollItems/payrollItems.container";
import { kpiDefinitionsModule } from "./kpiDefinitions/kpiDefinitions.container";
import { employeeKpisModule } from "./employeeKpis/employeeKpis.container";
import { commissionPoliciesModule } from "./commissionPolicies/commissionPolicies.container";
import { employeeCommissionsModule } from "./employeeCommissions/employeeCommissions.container";
import { bonusesModule } from "./bonuses/bonuses.container";
import { penaltiesModule } from "./penalties/penalties.container";
import { categoriesModule } from "./categories/categories.container";
import { brandsModule } from "./brands/brands.container";
import { unitsModule } from "./units/units.container";
import { productsModule } from "./products/products.container";
import { productVariantsModule } from "./productVariants/productVariants.container";
import { productImagesModule } from "./productImages/productImages.container";
import { attributesModule } from "./attributes/attributes.container";
import { attributeValuesModule } from "./attributeValues/attributeValues.container";
import { variantAttributeValuesModule } from "./variantAttributeValues/variantAttributeValues.container";
import { productBarcodesModule } from "./productBarcodes/productBarcodes.container";
import { productUnitsModule } from "./productUnits/productUnits.container";
import { bundlesModule } from "./bundles/bundles.container";
import { bundleItemsModule } from "./bundleItems/bundleItems.container";
import { priceBooksModule } from "./priceBooks/priceBooks.container";
import { priceBookItemsModule } from "./priceBookItems/priceBookItems.container";
import { taxRatesModule } from "./taxRates/taxRates.container";
import { productTaxRatesModule } from "./productTaxRates/productTaxRates.container";
import { inventoriesModule } from "./inventories/inventories.container";
import { stockLedgersModule } from "./stockLedgers/stockLedgers.container";
import { stockReservationsModule } from "./stockReservations/stockReservations.container";
import { stockAdjustmentsModule } from "./stockAdjustments/stockAdjustments.container";
import { stockAdjustmentItemsModule } from "./stockAdjustmentItems/stockAdjustmentItems.container";
import { stockCountsModule } from "./stockCounts/stockCounts.container";
import { stockCountItemsModule } from "./stockCountItems/stockCountItems.container";
import { stockTransfersModule } from "./stockTransfers/stockTransfers.container";
import { stockTransferItemsModule } from "./stockTransferItems/stockTransferItems.container";
import { inventoryBatchesModule } from "./inventoryBatches/inventoryBatches.container";
import { serialNumbersModule } from "./serialNumbers/serialNumbers.container";
import { inventoryCostLayersModule } from "./inventoryCostLayers/inventoryCostLayers.container";
import { suppliersModule } from "./suppliers/suppliers.container";
import { supplierContactsModule } from "./supplierContacts/supplierContacts.container";
import { supplierAddressesModule } from "./supplierAddresses/supplierAddresses.container";
import { purchaseOrdersModule } from "./purchaseOrders/purchaseOrders.container";
import { purchaseOrderItemsModule } from "./purchaseOrderItems/purchaseOrderItems.container";
import { goodsReceiptsModule } from "./goodsReceipts/goodsReceipts.container";
import { goodsReceiptItemsModule } from "./goodsReceiptItems/goodsReceiptItems.container";
import { purchaseReturnsModule } from "./purchaseReturns/purchaseReturns.container";
import { purchaseReturnItemsModule } from "./purchaseReturnItems/purchaseReturnItems.container";
import { supplierDebtsModule } from "./supplierDebts/supplierDebts.container";
import { supplierDebtTransactionsModule } from "./supplierDebtTransactions/supplierDebtTransactions.container";
import { customersModule } from "./customers/customers.container";
import { customerAddressesModule } from "./customerAddresses/customerAddresses.container";
import { customerContactsModule } from "./customerContacts/customerContacts.container";
import { customerGroupsModule } from "./customerGroups/customerGroups.container";
import { customerGroupMembersModule } from "./customerGroupMembers/customerGroupMembers.container";
import { customerTagsModule } from "./customerTags/customerTags.container";
import { customerTagMapsModule } from "./customerTagMaps/customerTagMaps.container";
import { customerNotesModule } from "./customerNotes/customerNotes.container";
import { customerActivitiesModule } from "./customerActivities/customerActivities.container";
import { customerDebtsModule } from "./customerDebts/customerDebts.container";
import { customerDebtTransactionsModule } from "./customerDebtTransactions/customerDebtTransactions.container";
import { loyaltyTiersModule } from "./loyaltyTiers/loyaltyTiers.container";
import { loyaltyAccountsModule } from "./loyaltyAccounts/loyaltyAccounts.container";
import { loyaltyTransactionsModule } from "./loyaltyTransactions/loyaltyTransactions.container";
import { salesChannelsModule } from "./salesChannels/salesChannels.container";
import { cartsModule } from "./carts/carts.container";
import { cartItemsModule } from "./cartItems/cartItems.container";
import { ordersModule } from "./orders/orders.container";
import { orderItemsModule } from "./orderItems/orderItems.container";
import { orderStatusHistoryModule } from "./orderStatusHistory/orderStatusHistory.container";
import { orderDiscountsModule } from "./orderDiscounts/orderDiscounts.container";
import { orderTaxesModule } from "./orderTaxes/orderTaxes.container";
import { orderNotesModule } from "./orderNotes/orderNotes.container";
import { fulfillmentsModule } from "./fulfillments/fulfillments.container";
import { fulfillmentItemsModule } from "./fulfillmentItems/fulfillmentItems.container";
import { shipmentsModule } from "./shipments/shipments.container";
import { shipmentItemsModule } from "./shipmentItems/shipmentItems.container";
import { returnsModule } from "./returns/returns.container";
import { returnItemsModule } from "./returnItems/returnItems.container";
import { exchangesModule } from "./exchanges/exchanges.container";
import { exchangeItemsModule } from "./exchangeItems/exchangeItems.container";
import { invoicesModule } from "./invoices/invoices.container";
import { invoiceItemsModule } from "./invoiceItems/invoiceItems.container";
import { paymentMethodsModule } from "./paymentMethods/paymentMethods.container";
import { paymentsModule } from "./payments/payments.container";
import { paymentTransactionsModule } from "./paymentTransactions/paymentTransactions.container";
import { paymentAllocationsModule } from "./paymentAllocations/paymentAllocations.container";
import { refundsModule } from "./refunds/refunds.container";
import { refundItemsModule } from "./refundItems/refundItems.container";
import { reconciliationsModule } from "./reconciliations/reconciliations.container";
import { reconciliationItemsModule } from "./reconciliationItems/reconciliationItems.container";
import { cashRegistersModule } from "./cashRegisters/cashRegisters.container";
import { cashSessionsModule } from "./cashSessions/cashSessions.container";
import { cashMovementsModule } from "./cashMovements/cashMovements.container";
import { cashbooksModule } from "./cashbooks/cashbooks.container";
import { receiptsModule } from "./receipts/receipts.container";
import { expensesModule } from "./expenses/expenses.container";
import { expenseCategoriesModule } from "./expenseCategories/expenseCategories.container";
import { financialAccountsModule } from "./financialAccounts/financialAccounts.container";
import { accountTransactionsModule } from "./accountTransactions/accountTransactions.container";
import { promotionsModule } from "./promotions/promotions.container";
import { promotionRulesModule } from "./promotionRules/promotionRules.container";
import { promotionActionsModule } from "./promotionActions/promotionActions.container";
import { promotionProductsModule } from "./promotionProducts/promotionProducts.container";
import { promotionCustomerGroupsModule } from "./promotionCustomerGroups/promotionCustomerGroups.container";
import { couponsModule } from "./coupons/coupons.container";
import { couponUsagesModule } from "./couponUsages/couponUsages.container";
import { vouchersModule } from "./vouchers/vouchers.container";
import { voucherTransactionsModule } from "./voucherTransactions/voucherTransactions.container";
import { giftCardsModule } from "./giftCards/giftCards.container";
import { giftCardTransactionsModule } from "./giftCardTransactions/giftCardTransactions.container";
import { shippingProvidersModule } from "./shippingProviders/shippingProviders.container";
import { shippingOrdersModule } from "./shippingOrders/shippingOrders.container";
import { notificationsModule } from "./notifications/notifications.container";
import { notificationRecipientsModule } from "./notificationRecipients/notificationRecipients.container";
import { filesModule } from "./files/files.container";
import { systemSettingsModule } from "./systemSettings/systemSettings.container";
import { webhooksModule } from "./webhooks/webhooks.container";
import { webhookDeliveriesModule } from "./webhookDeliveries/webhookDeliveries.container";
import { jobsModule } from "./jobs/jobs.container";
import { jobLogsModule } from "./jobLogs/jobLogs.container";
import { numberSequencesModule } from "./numberSequences/numberSequences.container";
import { tagsModule } from "./tags/tags.container";
import { entityTagsModule } from "./entityTags/entityTags.container";

export const retailGeneratedModules = [
  tenantsModule,
  tenantSettingsModule,
  storesModule,
  branchesModule,
  warehousesModule,
  usersModule,
  rolesModule,
  permissionsModule,
  userRolesModule,
  rolePermissionsModule,
  userSessionsModule,
  apiKeysModule,
  auditLogsModule,
  departmentsModule,
  positionsModule,
  employeesModule,
  employeeProfilesModule,
  employeeContractsModule,
  employeeDocumentsModule,
  employeeBranchAssignmentsModule,
  employeePositionHistoryModule,
  workShiftsModule,
  shiftAssignmentsModule,
  attendanceDevicesModule,
  attendanceLogsModule,
  attendancesModule,
  leaveTypesModule,
  leaveBalancesModule,
  leaveRequestsModule,
  holidaysModule,
  overtimeRequestsModule,
  salaryComponentsModule,
  employeeSalaryComponentsModule,
  payrollPeriodsModule,
  payrollsModule,
  payrollItemsModule,
  kpiDefinitionsModule,
  employeeKpisModule,
  commissionPoliciesModule,
  employeeCommissionsModule,
  bonusesModule,
  penaltiesModule,
  categoriesModule,
  brandsModule,
  unitsModule,
  productsModule,
  productVariantsModule,
  productImagesModule,
  attributesModule,
  attributeValuesModule,
  variantAttributeValuesModule,
  productBarcodesModule,
  productUnitsModule,
  bundlesModule,
  bundleItemsModule,
  priceBooksModule,
  priceBookItemsModule,
  taxRatesModule,
  productTaxRatesModule,
  inventoriesModule,
  stockLedgersModule,
  stockReservationsModule,
  stockAdjustmentsModule,
  stockAdjustmentItemsModule,
  stockCountsModule,
  stockCountItemsModule,
  stockTransfersModule,
  stockTransferItemsModule,
  inventoryBatchesModule,
  serialNumbersModule,
  inventoryCostLayersModule,
  suppliersModule,
  supplierContactsModule,
  supplierAddressesModule,
  purchaseOrdersModule,
  purchaseOrderItemsModule,
  goodsReceiptsModule,
  goodsReceiptItemsModule,
  purchaseReturnsModule,
  purchaseReturnItemsModule,
  supplierDebtsModule,
  supplierDebtTransactionsModule,
  customersModule,
  customerAddressesModule,
  customerContactsModule,
  customerGroupsModule,
  customerGroupMembersModule,
  customerTagsModule,
  customerTagMapsModule,
  customerNotesModule,
  customerActivitiesModule,
  customerDebtsModule,
  customerDebtTransactionsModule,
  loyaltyTiersModule,
  loyaltyAccountsModule,
  loyaltyTransactionsModule,
  salesChannelsModule,
  cartsModule,
  cartItemsModule,
  ordersModule,
  orderItemsModule,
  orderStatusHistoryModule,
  orderDiscountsModule,
  orderTaxesModule,
  orderNotesModule,
  fulfillmentsModule,
  fulfillmentItemsModule,
  shipmentsModule,
  shipmentItemsModule,
  returnsModule,
  returnItemsModule,
  exchangesModule,
  exchangeItemsModule,
  invoicesModule,
  invoiceItemsModule,
  paymentMethodsModule,
  paymentsModule,
  paymentTransactionsModule,
  paymentAllocationsModule,
  refundsModule,
  refundItemsModule,
  reconciliationsModule,
  reconciliationItemsModule,
  cashRegistersModule,
  cashSessionsModule,
  cashMovementsModule,
  cashbooksModule,
  receiptsModule,
  expensesModule,
  expenseCategoriesModule,
  financialAccountsModule,
  accountTransactionsModule,
  promotionsModule,
  promotionRulesModule,
  promotionActionsModule,
  promotionProductsModule,
  promotionCustomerGroupsModule,
  couponsModule,
  couponUsagesModule,
  vouchersModule,
  voucherTransactionsModule,
  giftCardsModule,
  giftCardTransactionsModule,
  shippingProvidersModule,
  shippingOrdersModule,
  notificationsModule,
  notificationRecipientsModule,
  filesModule,
  systemSettingsModule,
  webhooksModule,
  webhookDeliveriesModule,
  jobsModule,
  jobLogsModule,
  numberSequencesModule,
  tagsModule,
  entityTagsModule,
];

import { RETAIL_TENANTS_TYPES, TENANTS_RESOURCE } from "./tenants/tenants.types";
import { RETAIL_TENANT_SETTINGS_TYPES, TENANTSETTINGS_RESOURCE } from "./tenantSettings/tenantSettings.types";
import { RETAIL_STORES_TYPES, STORES_RESOURCE } from "./stores/stores.types";
import { RETAIL_BRANCHES_TYPES, BRANCHES_RESOURCE } from "./branches/branches.types";
import { RETAIL_WAREHOUSES_TYPES, WAREHOUSES_RESOURCE } from "./warehouses/warehouses.types";
import { RETAIL_USERS_TYPES, USERS_RESOURCE } from "./users/users.types";
import { RETAIL_ROLES_TYPES, ROLES_RESOURCE } from "./roles/roles.types";
import { RETAIL_PERMISSIONS_TYPES, PERMISSIONS_RESOURCE } from "./permissions/permissions.types";
import { RETAIL_USER_ROLES_TYPES, USERROLES_RESOURCE } from "./userRoles/userRoles.types";
import { RETAIL_ROLE_PERMISSIONS_TYPES, ROLEPERMISSIONS_RESOURCE } from "./rolePermissions/rolePermissions.types";
import { RETAIL_USER_SESSIONS_TYPES, USERSESSIONS_RESOURCE } from "./userSessions/userSessions.types";
import { RETAIL_API_KEYS_TYPES, APIKEYS_RESOURCE } from "./apiKeys/apiKeys.types";
import { RETAIL_AUDIT_LOGS_TYPES, AUDITLOGS_RESOURCE } from "./auditLogs/auditLogs.types";
import { RETAIL_DEPARTMENTS_TYPES, DEPARTMENTS_RESOURCE } from "./departments/departments.types";
import { RETAIL_POSITIONS_TYPES, POSITIONS_RESOURCE } from "./positions/positions.types";
import { RETAIL_EMPLOYEES_TYPES, EMPLOYEES_RESOURCE } from "./employees/employees.types";
import { RETAIL_EMPLOYEE_PROFILES_TYPES, EMPLOYEEPROFILES_RESOURCE } from "./employeeProfiles/employeeProfiles.types";
import { RETAIL_EMPLOYEE_CONTRACTS_TYPES, EMPLOYEECONTRACTS_RESOURCE } from "./employeeContracts/employeeContracts.types";
import { RETAIL_EMPLOYEE_DOCUMENTS_TYPES, EMPLOYEEDOCUMENTS_RESOURCE } from "./employeeDocuments/employeeDocuments.types";
import { RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES, EMPLOYEEBRANCHASSIGNMENTS_RESOURCE } from "./employeeBranchAssignments/employeeBranchAssignments.types";
import { RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES, EMPLOYEEPOSITIONHISTORY_RESOURCE } from "./employeePositionHistory/employeePositionHistory.types";
import { RETAIL_WORK_SHIFTS_TYPES, WORKSHIFTS_RESOURCE } from "./workShifts/workShifts.types";
import { RETAIL_SHIFT_ASSIGNMENTS_TYPES, SHIFTASSIGNMENTS_RESOURCE } from "./shiftAssignments/shiftAssignments.types";
import { RETAIL_ATTENDANCE_DEVICES_TYPES, ATTENDANCEDEVICES_RESOURCE } from "./attendanceDevices/attendanceDevices.types";
import { RETAIL_ATTENDANCE_LOGS_TYPES, ATTENDANCELOGS_RESOURCE } from "./attendanceLogs/attendanceLogs.types";
import { RETAIL_ATTENDANCES_TYPES, ATTENDANCES_RESOURCE } from "./attendances/attendances.types";
import { RETAIL_LEAVE_TYPES_TYPES, LEAVETYPES_RESOURCE } from "./leaveTypes/leaveTypes.types";
import { RETAIL_LEAVE_BALANCES_TYPES, LEAVEBALANCES_RESOURCE } from "./leaveBalances/leaveBalances.types";
import { RETAIL_LEAVE_REQUESTS_TYPES, LEAVEREQUESTS_RESOURCE } from "./leaveRequests/leaveRequests.types";
import { RETAIL_HOLIDAYS_TYPES, HOLIDAYS_RESOURCE } from "./holidays/holidays.types";
import { RETAIL_OVERTIME_REQUESTS_TYPES, OVERTIMEREQUESTS_RESOURCE } from "./overtimeRequests/overtimeRequests.types";
import { RETAIL_SALARY_COMPONENTS_TYPES, SALARYCOMPONENTS_RESOURCE } from "./salaryComponents/salaryComponents.types";
import { RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES, EMPLOYEESALARYCOMPONENTS_RESOURCE } from "./employeeSalaryComponents/employeeSalaryComponents.types";
import { RETAIL_PAYROLL_PERIODS_TYPES, PAYROLLPERIODS_RESOURCE } from "./payrollPeriods/payrollPeriods.types";
import { RETAIL_PAYROLLS_TYPES, PAYROLLS_RESOURCE } from "./payrolls/payrolls.types";
import { RETAIL_PAYROLL_ITEMS_TYPES, PAYROLLITEMS_RESOURCE } from "./payrollItems/payrollItems.types";
import { RETAIL_KPI_DEFINITIONS_TYPES, KPIDEFINITIONS_RESOURCE } from "./kpiDefinitions/kpiDefinitions.types";
import { RETAIL_EMPLOYEE_KPIS_TYPES, EMPLOYEEKPIS_RESOURCE } from "./employeeKpis/employeeKpis.types";
import { RETAIL_COMMISSION_POLICIES_TYPES, COMMISSIONPOLICIES_RESOURCE } from "./commissionPolicies/commissionPolicies.types";
import { RETAIL_EMPLOYEE_COMMISSIONS_TYPES, EMPLOYEECOMMISSIONS_RESOURCE } from "./employeeCommissions/employeeCommissions.types";
import { RETAIL_BONUSES_TYPES, BONUSES_RESOURCE } from "./bonuses/bonuses.types";
import { RETAIL_PENALTIES_TYPES, PENALTIES_RESOURCE } from "./penalties/penalties.types";
import { RETAIL_CATEGORIES_TYPES, CATEGORIES_RESOURCE } from "./categories/categories.types";
import { RETAIL_BRANDS_TYPES, BRANDS_RESOURCE } from "./brands/brands.types";
import { RETAIL_UNITS_TYPES, UNITS_RESOURCE } from "./units/units.types";
import { RETAIL_PRODUCTS_TYPES, PRODUCTS_RESOURCE } from "./products/products.types";
import { RETAIL_PRODUCT_VARIANTS_TYPES, PRODUCTVARIANTS_RESOURCE } from "./productVariants/productVariants.types";
import { RETAIL_PRODUCT_IMAGES_TYPES, PRODUCTIMAGES_RESOURCE } from "./productImages/productImages.types";
import { RETAIL_ATTRIBUTES_TYPES, ATTRIBUTES_RESOURCE } from "./attributes/attributes.types";
import { RETAIL_ATTRIBUTE_VALUES_TYPES, ATTRIBUTEVALUES_RESOURCE } from "./attributeValues/attributeValues.types";
import { RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES, VARIANTATTRIBUTEVALUES_RESOURCE } from "./variantAttributeValues/variantAttributeValues.types";
import { RETAIL_PRODUCT_BARCODES_TYPES, PRODUCTBARCODES_RESOURCE } from "./productBarcodes/productBarcodes.types";
import { RETAIL_PRODUCT_UNITS_TYPES, PRODUCTUNITS_RESOURCE } from "./productUnits/productUnits.types";
import { RETAIL_BUNDLES_TYPES, BUNDLES_RESOURCE } from "./bundles/bundles.types";
import { RETAIL_BUNDLE_ITEMS_TYPES, BUNDLEITEMS_RESOURCE } from "./bundleItems/bundleItems.types";
import { RETAIL_PRICE_BOOKS_TYPES, PRICEBOOKS_RESOURCE } from "./priceBooks/priceBooks.types";
import { RETAIL_PRICE_BOOK_ITEMS_TYPES, PRICEBOOKITEMS_RESOURCE } from "./priceBookItems/priceBookItems.types";
import { RETAIL_TAX_RATES_TYPES, TAXRATES_RESOURCE } from "./taxRates/taxRates.types";
import { RETAIL_PRODUCT_TAX_RATES_TYPES, PRODUCTTAXRATES_RESOURCE } from "./productTaxRates/productTaxRates.types";
import { RETAIL_INVENTORIES_TYPES, INVENTORIES_RESOURCE } from "./inventories/inventories.types";
import { RETAIL_STOCK_LEDGERS_TYPES, STOCKLEDGERS_RESOURCE } from "./stockLedgers/stockLedgers.types";
import { RETAIL_STOCK_RESERVATIONS_TYPES, STOCKRESERVATIONS_RESOURCE } from "./stockReservations/stockReservations.types";
import { RETAIL_STOCK_ADJUSTMENTS_TYPES, STOCKADJUSTMENTS_RESOURCE } from "./stockAdjustments/stockAdjustments.types";
import { RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES, STOCKADJUSTMENTITEMS_RESOURCE } from "./stockAdjustmentItems/stockAdjustmentItems.types";
import { RETAIL_STOCK_COUNTS_TYPES, STOCKCOUNTS_RESOURCE } from "./stockCounts/stockCounts.types";
import { RETAIL_STOCK_COUNT_ITEMS_TYPES, STOCKCOUNTITEMS_RESOURCE } from "./stockCountItems/stockCountItems.types";
import { RETAIL_STOCK_TRANSFERS_TYPES, STOCKTRANSFERS_RESOURCE } from "./stockTransfers/stockTransfers.types";
import { RETAIL_STOCK_TRANSFER_ITEMS_TYPES, STOCKTRANSFERITEMS_RESOURCE } from "./stockTransferItems/stockTransferItems.types";
import { RETAIL_INVENTORY_BATCHES_TYPES, INVENTORYBATCHES_RESOURCE } from "./inventoryBatches/inventoryBatches.types";
import { RETAIL_SERIAL_NUMBERS_TYPES, SERIALNUMBERS_RESOURCE } from "./serialNumbers/serialNumbers.types";
import { RETAIL_INVENTORY_COST_LAYERS_TYPES, INVENTORYCOSTLAYERS_RESOURCE } from "./inventoryCostLayers/inventoryCostLayers.types";
import { RETAIL_SUPPLIERS_TYPES, SUPPLIERS_RESOURCE } from "./suppliers/suppliers.types";
import { RETAIL_SUPPLIER_CONTACTS_TYPES, SUPPLIERCONTACTS_RESOURCE } from "./supplierContacts/supplierContacts.types";
import { RETAIL_SUPPLIER_ADDRESSES_TYPES, SUPPLIERADDRESSES_RESOURCE } from "./supplierAddresses/supplierAddresses.types";
import { RETAIL_PURCHASE_ORDERS_TYPES, PURCHASEORDERS_RESOURCE } from "./purchaseOrders/purchaseOrders.types";
import { RETAIL_PURCHASE_ORDER_ITEMS_TYPES, PURCHASEORDERITEMS_RESOURCE } from "./purchaseOrderItems/purchaseOrderItems.types";
import { RETAIL_GOODS_RECEIPTS_TYPES, GOODSRECEIPTS_RESOURCE } from "./goodsReceipts/goodsReceipts.types";
import { RETAIL_GOODS_RECEIPT_ITEMS_TYPES, GOODSRECEIPTITEMS_RESOURCE } from "./goodsReceiptItems/goodsReceiptItems.types";
import { RETAIL_PURCHASE_RETURNS_TYPES, PURCHASERETURNS_RESOURCE } from "./purchaseReturns/purchaseReturns.types";
import { RETAIL_PURCHASE_RETURN_ITEMS_TYPES, PURCHASERETURNITEMS_RESOURCE } from "./purchaseReturnItems/purchaseReturnItems.types";
import { RETAIL_SUPPLIER_DEBTS_TYPES, SUPPLIERDEBTS_RESOURCE } from "./supplierDebts/supplierDebts.types";
import { RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES, SUPPLIERDEBTTRANSACTIONS_RESOURCE } from "./supplierDebtTransactions/supplierDebtTransactions.types";
import { RETAIL_CUSTOMERS_TYPES, CUSTOMERS_RESOURCE } from "./customers/customers.types";
import { RETAIL_CUSTOMER_ADDRESSES_TYPES, CUSTOMERADDRESSES_RESOURCE } from "./customerAddresses/customerAddresses.types";
import { RETAIL_CUSTOMER_CONTACTS_TYPES, CUSTOMERCONTACTS_RESOURCE } from "./customerContacts/customerContacts.types";
import { RETAIL_CUSTOMER_GROUPS_TYPES, CUSTOMERGROUPS_RESOURCE } from "./customerGroups/customerGroups.types";
import { RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES, CUSTOMERGROUPMEMBERS_RESOURCE } from "./customerGroupMembers/customerGroupMembers.types";
import { RETAIL_CUSTOMER_TAGS_TYPES, CUSTOMERTAGS_RESOURCE } from "./customerTags/customerTags.types";
import { RETAIL_CUSTOMER_TAG_MAPS_TYPES, CUSTOMERTAGMAPS_RESOURCE } from "./customerTagMaps/customerTagMaps.types";
import { RETAIL_CUSTOMER_NOTES_TYPES, CUSTOMERNOTES_RESOURCE } from "./customerNotes/customerNotes.types";
import { RETAIL_CUSTOMER_ACTIVITIES_TYPES, CUSTOMERACTIVITIES_RESOURCE } from "./customerActivities/customerActivities.types";
import { RETAIL_CUSTOMER_DEBTS_TYPES, CUSTOMERDEBTS_RESOURCE } from "./customerDebts/customerDebts.types";
import { RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES, CUSTOMERDEBTTRANSACTIONS_RESOURCE } from "./customerDebtTransactions/customerDebtTransactions.types";
import { RETAIL_LOYALTY_TIERS_TYPES, LOYALTYTIERS_RESOURCE } from "./loyaltyTiers/loyaltyTiers.types";
import { RETAIL_LOYALTY_ACCOUNTS_TYPES, LOYALTYACCOUNTS_RESOURCE } from "./loyaltyAccounts/loyaltyAccounts.types";
import { RETAIL_LOYALTY_TRANSACTIONS_TYPES, LOYALTYTRANSACTIONS_RESOURCE } from "./loyaltyTransactions/loyaltyTransactions.types";
import { RETAIL_SALES_CHANNELS_TYPES, SALESCHANNELS_RESOURCE } from "./salesChannels/salesChannels.types";
import { RETAIL_CARTS_TYPES, CARTS_RESOURCE } from "./carts/carts.types";
import { RETAIL_CART_ITEMS_TYPES, CARTITEMS_RESOURCE } from "./cartItems/cartItems.types";
import { RETAIL_ORDERS_TYPES, ORDERS_RESOURCE } from "./orders/orders.types";
import { RETAIL_ORDER_ITEMS_TYPES, ORDERITEMS_RESOURCE } from "./orderItems/orderItems.types";
import { RETAIL_ORDER_STATUS_HISTORY_TYPES, ORDERSTATUSHISTORY_RESOURCE } from "./orderStatusHistory/orderStatusHistory.types";
import { RETAIL_ORDER_DISCOUNTS_TYPES, ORDERDISCOUNTS_RESOURCE } from "./orderDiscounts/orderDiscounts.types";
import { RETAIL_ORDER_TAXES_TYPES, ORDERTAXES_RESOURCE } from "./orderTaxes/orderTaxes.types";
import { RETAIL_ORDER_NOTES_TYPES, ORDERNOTES_RESOURCE } from "./orderNotes/orderNotes.types";
import { RETAIL_FULFILLMENTS_TYPES, FULFILLMENTS_RESOURCE } from "./fulfillments/fulfillments.types";
import { RETAIL_FULFILLMENT_ITEMS_TYPES, FULFILLMENTITEMS_RESOURCE } from "./fulfillmentItems/fulfillmentItems.types";
import { RETAIL_SHIPMENTS_TYPES, SHIPMENTS_RESOURCE } from "./shipments/shipments.types";
import { RETAIL_SHIPMENT_ITEMS_TYPES, SHIPMENTITEMS_RESOURCE } from "./shipmentItems/shipmentItems.types";
import { RETAIL_RETURNS_TYPES, RETURNS_RESOURCE } from "./returns/returns.types";
import { RETAIL_RETURN_ITEMS_TYPES, RETURNITEMS_RESOURCE } from "./returnItems/returnItems.types";
import { RETAIL_EXCHANGES_TYPES, EXCHANGES_RESOURCE } from "./exchanges/exchanges.types";
import { RETAIL_EXCHANGE_ITEMS_TYPES, EXCHANGEITEMS_RESOURCE } from "./exchangeItems/exchangeItems.types";
import { RETAIL_INVOICES_TYPES, INVOICES_RESOURCE } from "./invoices/invoices.types";
import { RETAIL_INVOICE_ITEMS_TYPES, INVOICEITEMS_RESOURCE } from "./invoiceItems/invoiceItems.types";
import { RETAIL_PAYMENT_METHODS_TYPES, PAYMENTMETHODS_RESOURCE } from "./paymentMethods/paymentMethods.types";
import { RETAIL_PAYMENTS_TYPES, PAYMENTS_RESOURCE } from "./payments/payments.types";
import { RETAIL_PAYMENT_TRANSACTIONS_TYPES, PAYMENTTRANSACTIONS_RESOURCE } from "./paymentTransactions/paymentTransactions.types";
import { RETAIL_PAYMENT_ALLOCATIONS_TYPES, PAYMENTALLOCATIONS_RESOURCE } from "./paymentAllocations/paymentAllocations.types";
import { RETAIL_REFUNDS_TYPES, REFUNDS_RESOURCE } from "./refunds/refunds.types";
import { RETAIL_REFUND_ITEMS_TYPES, REFUNDITEMS_RESOURCE } from "./refundItems/refundItems.types";
import { RETAIL_RECONCILIATIONS_TYPES, RECONCILIATIONS_RESOURCE } from "./reconciliations/reconciliations.types";
import { RETAIL_RECONCILIATION_ITEMS_TYPES, RECONCILIATIONITEMS_RESOURCE } from "./reconciliationItems/reconciliationItems.types";
import { RETAIL_CASH_REGISTERS_TYPES, CASHREGISTERS_RESOURCE } from "./cashRegisters/cashRegisters.types";
import { RETAIL_CASH_SESSIONS_TYPES, CASHSESSIONS_RESOURCE } from "./cashSessions/cashSessions.types";
import { RETAIL_CASH_MOVEMENTS_TYPES, CASHMOVEMENTS_RESOURCE } from "./cashMovements/cashMovements.types";
import { RETAIL_CASHBOOKS_TYPES, CASHBOOKS_RESOURCE } from "./cashbooks/cashbooks.types";
import { RETAIL_RECEIPTS_TYPES, RECEIPTS_RESOURCE } from "./receipts/receipts.types";
import { RETAIL_EXPENSES_TYPES, EXPENSES_RESOURCE } from "./expenses/expenses.types";
import { RETAIL_EXPENSE_CATEGORIES_TYPES, EXPENSECATEGORIES_RESOURCE } from "./expenseCategories/expenseCategories.types";
import { RETAIL_FINANCIAL_ACCOUNTS_TYPES, FINANCIALACCOUNTS_RESOURCE } from "./financialAccounts/financialAccounts.types";
import { RETAIL_ACCOUNT_TRANSACTIONS_TYPES, ACCOUNTTRANSACTIONS_RESOURCE } from "./accountTransactions/accountTransactions.types";
import { RETAIL_PROMOTIONS_TYPES, PROMOTIONS_RESOURCE } from "./promotions/promotions.types";
import { RETAIL_PROMOTION_RULES_TYPES, PROMOTIONRULES_RESOURCE } from "./promotionRules/promotionRules.types";
import { RETAIL_PROMOTION_ACTIONS_TYPES, PROMOTIONACTIONS_RESOURCE } from "./promotionActions/promotionActions.types";
import { RETAIL_PROMOTION_PRODUCTS_TYPES, PROMOTIONPRODUCTS_RESOURCE } from "./promotionProducts/promotionProducts.types";
import { RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES, PROMOTIONCUSTOMERGROUPS_RESOURCE } from "./promotionCustomerGroups/promotionCustomerGroups.types";
import { RETAIL_COUPONS_TYPES, COUPONS_RESOURCE } from "./coupons/coupons.types";
import { RETAIL_COUPON_USAGES_TYPES, COUPONUSAGES_RESOURCE } from "./couponUsages/couponUsages.types";
import { RETAIL_VOUCHERS_TYPES, VOUCHERS_RESOURCE } from "./vouchers/vouchers.types";
import { RETAIL_VOUCHER_TRANSACTIONS_TYPES, VOUCHERTRANSACTIONS_RESOURCE } from "./voucherTransactions/voucherTransactions.types";
import { RETAIL_GIFT_CARDS_TYPES, GIFTCARDS_RESOURCE } from "./giftCards/giftCards.types";
import { RETAIL_GIFT_CARD_TRANSACTIONS_TYPES, GIFTCARDTRANSACTIONS_RESOURCE } from "./giftCardTransactions/giftCardTransactions.types";
import { RETAIL_SHIPPING_PROVIDERS_TYPES, SHIPPINGPROVIDERS_RESOURCE } from "./shippingProviders/shippingProviders.types";
import { RETAIL_SHIPPING_ORDERS_TYPES, SHIPPINGORDERS_RESOURCE } from "./shippingOrders/shippingOrders.types";
import { RETAIL_NOTIFICATIONS_TYPES, NOTIFICATIONS_RESOURCE } from "./notifications/notifications.types";
import { RETAIL_NOTIFICATION_RECIPIENTS_TYPES, NOTIFICATIONRECIPIENTS_RESOURCE } from "./notificationRecipients/notificationRecipients.types";
import { RETAIL_FILES_TYPES, FILES_RESOURCE } from "./files/files.types";
import { RETAIL_SYSTEM_SETTINGS_TYPES, SYSTEMSETTINGS_RESOURCE } from "./systemSettings/systemSettings.types";
import { RETAIL_WEBHOOKS_TYPES, WEBHOOKS_RESOURCE } from "./webhooks/webhooks.types";
import { RETAIL_WEBHOOK_DELIVERIES_TYPES, WEBHOOKDELIVERIES_RESOURCE } from "./webhookDeliveries/webhookDeliveries.types";
import { RETAIL_JOBS_TYPES, JOBS_RESOURCE } from "./jobs/jobs.types";
import { RETAIL_JOB_LOGS_TYPES, JOBLOGS_RESOURCE } from "./jobLogs/jobLogs.types";
import { RETAIL_NUMBER_SEQUENCES_TYPES, NUMBERSEQUENCES_RESOURCE } from "./numberSequences/numberSequences.types";
import { RETAIL_TAGS_TYPES, TAGS_RESOURCE } from "./tags/tags.types";
import { RETAIL_ENTITY_TAGS_TYPES, ENTITYTAGS_RESOURCE } from "./entityTags/entityTags.types";

export const retailGeneratedRoutes = [
  { resource: TENANTS_RESOURCE, token: RETAIL_TENANTS_TYPES.Router },
  { resource: TENANTSETTINGS_RESOURCE, token: RETAIL_TENANT_SETTINGS_TYPES.Router },
  { resource: STORES_RESOURCE, token: RETAIL_STORES_TYPES.Router },
  { resource: BRANCHES_RESOURCE, token: RETAIL_BRANCHES_TYPES.Router },
  { resource: WAREHOUSES_RESOURCE, token: RETAIL_WAREHOUSES_TYPES.Router },
  { resource: USERS_RESOURCE, token: RETAIL_USERS_TYPES.Router },
  { resource: ROLES_RESOURCE, token: RETAIL_ROLES_TYPES.Router },
  { resource: PERMISSIONS_RESOURCE, token: RETAIL_PERMISSIONS_TYPES.Router },
  { resource: USERROLES_RESOURCE, token: RETAIL_USER_ROLES_TYPES.Router },
  { resource: ROLEPERMISSIONS_RESOURCE, token: RETAIL_ROLE_PERMISSIONS_TYPES.Router },
  { resource: USERSESSIONS_RESOURCE, token: RETAIL_USER_SESSIONS_TYPES.Router },
  { resource: APIKEYS_RESOURCE, token: RETAIL_API_KEYS_TYPES.Router },
  { resource: AUDITLOGS_RESOURCE, token: RETAIL_AUDIT_LOGS_TYPES.Router },
  { resource: DEPARTMENTS_RESOURCE, token: RETAIL_DEPARTMENTS_TYPES.Router },
  { resource: POSITIONS_RESOURCE, token: RETAIL_POSITIONS_TYPES.Router },
  { resource: EMPLOYEES_RESOURCE, token: RETAIL_EMPLOYEES_TYPES.Router },
  { resource: EMPLOYEEPROFILES_RESOURCE, token: RETAIL_EMPLOYEE_PROFILES_TYPES.Router },
  { resource: EMPLOYEECONTRACTS_RESOURCE, token: RETAIL_EMPLOYEE_CONTRACTS_TYPES.Router },
  { resource: EMPLOYEEDOCUMENTS_RESOURCE, token: RETAIL_EMPLOYEE_DOCUMENTS_TYPES.Router },
  { resource: EMPLOYEEBRANCHASSIGNMENTS_RESOURCE, token: RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES.Router },
  { resource: EMPLOYEEPOSITIONHISTORY_RESOURCE, token: RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES.Router },
  { resource: WORKSHIFTS_RESOURCE, token: RETAIL_WORK_SHIFTS_TYPES.Router },
  { resource: SHIFTASSIGNMENTS_RESOURCE, token: RETAIL_SHIFT_ASSIGNMENTS_TYPES.Router },
  { resource: ATTENDANCEDEVICES_RESOURCE, token: RETAIL_ATTENDANCE_DEVICES_TYPES.Router },
  { resource: ATTENDANCELOGS_RESOURCE, token: RETAIL_ATTENDANCE_LOGS_TYPES.Router },
  { resource: ATTENDANCES_RESOURCE, token: RETAIL_ATTENDANCES_TYPES.Router },
  { resource: LEAVETYPES_RESOURCE, token: RETAIL_LEAVE_TYPES_TYPES.Router },
  { resource: LEAVEBALANCES_RESOURCE, token: RETAIL_LEAVE_BALANCES_TYPES.Router },
  { resource: LEAVEREQUESTS_RESOURCE, token: RETAIL_LEAVE_REQUESTS_TYPES.Router },
  { resource: HOLIDAYS_RESOURCE, token: RETAIL_HOLIDAYS_TYPES.Router },
  { resource: OVERTIMEREQUESTS_RESOURCE, token: RETAIL_OVERTIME_REQUESTS_TYPES.Router },
  { resource: SALARYCOMPONENTS_RESOURCE, token: RETAIL_SALARY_COMPONENTS_TYPES.Router },
  { resource: EMPLOYEESALARYCOMPONENTS_RESOURCE, token: RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES.Router },
  { resource: PAYROLLPERIODS_RESOURCE, token: RETAIL_PAYROLL_PERIODS_TYPES.Router },
  { resource: PAYROLLS_RESOURCE, token: RETAIL_PAYROLLS_TYPES.Router },
  { resource: PAYROLLITEMS_RESOURCE, token: RETAIL_PAYROLL_ITEMS_TYPES.Router },
  { resource: KPIDEFINITIONS_RESOURCE, token: RETAIL_KPI_DEFINITIONS_TYPES.Router },
  { resource: EMPLOYEEKPIS_RESOURCE, token: RETAIL_EMPLOYEE_KPIS_TYPES.Router },
  { resource: COMMISSIONPOLICIES_RESOURCE, token: RETAIL_COMMISSION_POLICIES_TYPES.Router },
  { resource: EMPLOYEECOMMISSIONS_RESOURCE, token: RETAIL_EMPLOYEE_COMMISSIONS_TYPES.Router },
  { resource: BONUSES_RESOURCE, token: RETAIL_BONUSES_TYPES.Router },
  { resource: PENALTIES_RESOURCE, token: RETAIL_PENALTIES_TYPES.Router },
  { resource: CATEGORIES_RESOURCE, token: RETAIL_CATEGORIES_TYPES.Router },
  { resource: BRANDS_RESOURCE, token: RETAIL_BRANDS_TYPES.Router },
  { resource: UNITS_RESOURCE, token: RETAIL_UNITS_TYPES.Router },
  { resource: PRODUCTS_RESOURCE, token: RETAIL_PRODUCTS_TYPES.Router },
  { resource: PRODUCTVARIANTS_RESOURCE, token: RETAIL_PRODUCT_VARIANTS_TYPES.Router },
  { resource: PRODUCTIMAGES_RESOURCE, token: RETAIL_PRODUCT_IMAGES_TYPES.Router },
  { resource: ATTRIBUTES_RESOURCE, token: RETAIL_ATTRIBUTES_TYPES.Router },
  { resource: ATTRIBUTEVALUES_RESOURCE, token: RETAIL_ATTRIBUTE_VALUES_TYPES.Router },
  { resource: VARIANTATTRIBUTEVALUES_RESOURCE, token: RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES.Router },
  { resource: PRODUCTBARCODES_RESOURCE, token: RETAIL_PRODUCT_BARCODES_TYPES.Router },
  { resource: PRODUCTUNITS_RESOURCE, token: RETAIL_PRODUCT_UNITS_TYPES.Router },
  { resource: BUNDLES_RESOURCE, token: RETAIL_BUNDLES_TYPES.Router },
  { resource: BUNDLEITEMS_RESOURCE, token: RETAIL_BUNDLE_ITEMS_TYPES.Router },
  { resource: PRICEBOOKS_RESOURCE, token: RETAIL_PRICE_BOOKS_TYPES.Router },
  { resource: PRICEBOOKITEMS_RESOURCE, token: RETAIL_PRICE_BOOK_ITEMS_TYPES.Router },
  { resource: TAXRATES_RESOURCE, token: RETAIL_TAX_RATES_TYPES.Router },
  { resource: PRODUCTTAXRATES_RESOURCE, token: RETAIL_PRODUCT_TAX_RATES_TYPES.Router },
  { resource: INVENTORIES_RESOURCE, token: RETAIL_INVENTORIES_TYPES.Router },
  { resource: STOCKLEDGERS_RESOURCE, token: RETAIL_STOCK_LEDGERS_TYPES.Router },
  { resource: STOCKRESERVATIONS_RESOURCE, token: RETAIL_STOCK_RESERVATIONS_TYPES.Router },
  { resource: STOCKADJUSTMENTS_RESOURCE, token: RETAIL_STOCK_ADJUSTMENTS_TYPES.Router },
  { resource: STOCKADJUSTMENTITEMS_RESOURCE, token: RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES.Router },
  { resource: STOCKCOUNTS_RESOURCE, token: RETAIL_STOCK_COUNTS_TYPES.Router },
  { resource: STOCKCOUNTITEMS_RESOURCE, token: RETAIL_STOCK_COUNT_ITEMS_TYPES.Router },
  { resource: STOCKTRANSFERS_RESOURCE, token: RETAIL_STOCK_TRANSFERS_TYPES.Router },
  { resource: STOCKTRANSFERITEMS_RESOURCE, token: RETAIL_STOCK_TRANSFER_ITEMS_TYPES.Router },
  { resource: INVENTORYBATCHES_RESOURCE, token: RETAIL_INVENTORY_BATCHES_TYPES.Router },
  { resource: SERIALNUMBERS_RESOURCE, token: RETAIL_SERIAL_NUMBERS_TYPES.Router },
  { resource: INVENTORYCOSTLAYERS_RESOURCE, token: RETAIL_INVENTORY_COST_LAYERS_TYPES.Router },
  { resource: SUPPLIERS_RESOURCE, token: RETAIL_SUPPLIERS_TYPES.Router },
  { resource: SUPPLIERCONTACTS_RESOURCE, token: RETAIL_SUPPLIER_CONTACTS_TYPES.Router },
  { resource: SUPPLIERADDRESSES_RESOURCE, token: RETAIL_SUPPLIER_ADDRESSES_TYPES.Router },
  { resource: PURCHASEORDERS_RESOURCE, token: RETAIL_PURCHASE_ORDERS_TYPES.Router },
  { resource: PURCHASEORDERITEMS_RESOURCE, token: RETAIL_PURCHASE_ORDER_ITEMS_TYPES.Router },
  { resource: GOODSRECEIPTS_RESOURCE, token: RETAIL_GOODS_RECEIPTS_TYPES.Router },
  { resource: GOODSRECEIPTITEMS_RESOURCE, token: RETAIL_GOODS_RECEIPT_ITEMS_TYPES.Router },
  { resource: PURCHASERETURNS_RESOURCE, token: RETAIL_PURCHASE_RETURNS_TYPES.Router },
  { resource: PURCHASERETURNITEMS_RESOURCE, token: RETAIL_PURCHASE_RETURN_ITEMS_TYPES.Router },
  { resource: SUPPLIERDEBTS_RESOURCE, token: RETAIL_SUPPLIER_DEBTS_TYPES.Router },
  { resource: SUPPLIERDEBTTRANSACTIONS_RESOURCE, token: RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES.Router },
  { resource: CUSTOMERS_RESOURCE, token: RETAIL_CUSTOMERS_TYPES.Router },
  { resource: CUSTOMERADDRESSES_RESOURCE, token: RETAIL_CUSTOMER_ADDRESSES_TYPES.Router },
  { resource: CUSTOMERCONTACTS_RESOURCE, token: RETAIL_CUSTOMER_CONTACTS_TYPES.Router },
  { resource: CUSTOMERGROUPS_RESOURCE, token: RETAIL_CUSTOMER_GROUPS_TYPES.Router },
  { resource: CUSTOMERGROUPMEMBERS_RESOURCE, token: RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES.Router },
  { resource: CUSTOMERTAGS_RESOURCE, token: RETAIL_CUSTOMER_TAGS_TYPES.Router },
  { resource: CUSTOMERTAGMAPS_RESOURCE, token: RETAIL_CUSTOMER_TAG_MAPS_TYPES.Router },
  { resource: CUSTOMERNOTES_RESOURCE, token: RETAIL_CUSTOMER_NOTES_TYPES.Router },
  { resource: CUSTOMERACTIVITIES_RESOURCE, token: RETAIL_CUSTOMER_ACTIVITIES_TYPES.Router },
  { resource: CUSTOMERDEBTS_RESOURCE, token: RETAIL_CUSTOMER_DEBTS_TYPES.Router },
  { resource: CUSTOMERDEBTTRANSACTIONS_RESOURCE, token: RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES.Router },
  { resource: LOYALTYTIERS_RESOURCE, token: RETAIL_LOYALTY_TIERS_TYPES.Router },
  { resource: LOYALTYACCOUNTS_RESOURCE, token: RETAIL_LOYALTY_ACCOUNTS_TYPES.Router },
  { resource: LOYALTYTRANSACTIONS_RESOURCE, token: RETAIL_LOYALTY_TRANSACTIONS_TYPES.Router },
  { resource: SALESCHANNELS_RESOURCE, token: RETAIL_SALES_CHANNELS_TYPES.Router },
  { resource: CARTS_RESOURCE, token: RETAIL_CARTS_TYPES.Router },
  { resource: CARTITEMS_RESOURCE, token: RETAIL_CART_ITEMS_TYPES.Router },
  { resource: ORDERS_RESOURCE, token: RETAIL_ORDERS_TYPES.Router },
  { resource: ORDERITEMS_RESOURCE, token: RETAIL_ORDER_ITEMS_TYPES.Router },
  { resource: ORDERSTATUSHISTORY_RESOURCE, token: RETAIL_ORDER_STATUS_HISTORY_TYPES.Router },
  { resource: ORDERDISCOUNTS_RESOURCE, token: RETAIL_ORDER_DISCOUNTS_TYPES.Router },
  { resource: ORDERTAXES_RESOURCE, token: RETAIL_ORDER_TAXES_TYPES.Router },
  { resource: ORDERNOTES_RESOURCE, token: RETAIL_ORDER_NOTES_TYPES.Router },
  { resource: FULFILLMENTS_RESOURCE, token: RETAIL_FULFILLMENTS_TYPES.Router },
  { resource: FULFILLMENTITEMS_RESOURCE, token: RETAIL_FULFILLMENT_ITEMS_TYPES.Router },
  { resource: SHIPMENTS_RESOURCE, token: RETAIL_SHIPMENTS_TYPES.Router },
  { resource: SHIPMENTITEMS_RESOURCE, token: RETAIL_SHIPMENT_ITEMS_TYPES.Router },
  { resource: RETURNS_RESOURCE, token: RETAIL_RETURNS_TYPES.Router },
  { resource: RETURNITEMS_RESOURCE, token: RETAIL_RETURN_ITEMS_TYPES.Router },
  { resource: EXCHANGES_RESOURCE, token: RETAIL_EXCHANGES_TYPES.Router },
  { resource: EXCHANGEITEMS_RESOURCE, token: RETAIL_EXCHANGE_ITEMS_TYPES.Router },
  { resource: INVOICES_RESOURCE, token: RETAIL_INVOICES_TYPES.Router },
  { resource: INVOICEITEMS_RESOURCE, token: RETAIL_INVOICE_ITEMS_TYPES.Router },
  { resource: PAYMENTMETHODS_RESOURCE, token: RETAIL_PAYMENT_METHODS_TYPES.Router },
  { resource: PAYMENTS_RESOURCE, token: RETAIL_PAYMENTS_TYPES.Router },
  { resource: PAYMENTTRANSACTIONS_RESOURCE, token: RETAIL_PAYMENT_TRANSACTIONS_TYPES.Router },
  { resource: PAYMENTALLOCATIONS_RESOURCE, token: RETAIL_PAYMENT_ALLOCATIONS_TYPES.Router },
  { resource: REFUNDS_RESOURCE, token: RETAIL_REFUNDS_TYPES.Router },
  { resource: REFUNDITEMS_RESOURCE, token: RETAIL_REFUND_ITEMS_TYPES.Router },
  { resource: RECONCILIATIONS_RESOURCE, token: RETAIL_RECONCILIATIONS_TYPES.Router },
  { resource: RECONCILIATIONITEMS_RESOURCE, token: RETAIL_RECONCILIATION_ITEMS_TYPES.Router },
  { resource: CASHREGISTERS_RESOURCE, token: RETAIL_CASH_REGISTERS_TYPES.Router },
  { resource: CASHSESSIONS_RESOURCE, token: RETAIL_CASH_SESSIONS_TYPES.Router },
  { resource: CASHMOVEMENTS_RESOURCE, token: RETAIL_CASH_MOVEMENTS_TYPES.Router },
  { resource: CASHBOOKS_RESOURCE, token: RETAIL_CASHBOOKS_TYPES.Router },
  { resource: RECEIPTS_RESOURCE, token: RETAIL_RECEIPTS_TYPES.Router },
  { resource: EXPENSES_RESOURCE, token: RETAIL_EXPENSES_TYPES.Router },
  { resource: EXPENSECATEGORIES_RESOURCE, token: RETAIL_EXPENSE_CATEGORIES_TYPES.Router },
  { resource: FINANCIALACCOUNTS_RESOURCE, token: RETAIL_FINANCIAL_ACCOUNTS_TYPES.Router },
  { resource: ACCOUNTTRANSACTIONS_RESOURCE, token: RETAIL_ACCOUNT_TRANSACTIONS_TYPES.Router },
  { resource: PROMOTIONS_RESOURCE, token: RETAIL_PROMOTIONS_TYPES.Router },
  { resource: PROMOTIONRULES_RESOURCE, token: RETAIL_PROMOTION_RULES_TYPES.Router },
  { resource: PROMOTIONACTIONS_RESOURCE, token: RETAIL_PROMOTION_ACTIONS_TYPES.Router },
  { resource: PROMOTIONPRODUCTS_RESOURCE, token: RETAIL_PROMOTION_PRODUCTS_TYPES.Router },
  { resource: PROMOTIONCUSTOMERGROUPS_RESOURCE, token: RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES.Router },
  { resource: COUPONS_RESOURCE, token: RETAIL_COUPONS_TYPES.Router },
  { resource: COUPONUSAGES_RESOURCE, token: RETAIL_COUPON_USAGES_TYPES.Router },
  { resource: VOUCHERS_RESOURCE, token: RETAIL_VOUCHERS_TYPES.Router },
  { resource: VOUCHERTRANSACTIONS_RESOURCE, token: RETAIL_VOUCHER_TRANSACTIONS_TYPES.Router },
  { resource: GIFTCARDS_RESOURCE, token: RETAIL_GIFT_CARDS_TYPES.Router },
  { resource: GIFTCARDTRANSACTIONS_RESOURCE, token: RETAIL_GIFT_CARD_TRANSACTIONS_TYPES.Router },
  { resource: SHIPPINGPROVIDERS_RESOURCE, token: RETAIL_SHIPPING_PROVIDERS_TYPES.Router },
  { resource: SHIPPINGORDERS_RESOURCE, token: RETAIL_SHIPPING_ORDERS_TYPES.Router },
  { resource: NOTIFICATIONS_RESOURCE, token: RETAIL_NOTIFICATIONS_TYPES.Router },
  { resource: NOTIFICATIONRECIPIENTS_RESOURCE, token: RETAIL_NOTIFICATION_RECIPIENTS_TYPES.Router },
  { resource: FILES_RESOURCE, token: RETAIL_FILES_TYPES.Router },
  { resource: SYSTEMSETTINGS_RESOURCE, token: RETAIL_SYSTEM_SETTINGS_TYPES.Router },
  { resource: WEBHOOKS_RESOURCE, token: RETAIL_WEBHOOKS_TYPES.Router },
  { resource: WEBHOOKDELIVERIES_RESOURCE, token: RETAIL_WEBHOOK_DELIVERIES_TYPES.Router },
  { resource: JOBS_RESOURCE, token: RETAIL_JOBS_TYPES.Router },
  { resource: JOBLOGS_RESOURCE, token: RETAIL_JOB_LOGS_TYPES.Router },
  { resource: NUMBERSEQUENCES_RESOURCE, token: RETAIL_NUMBER_SEQUENCES_TYPES.Router },
  { resource: TAGS_RESOURCE, token: RETAIL_TAGS_TYPES.Router },
  { resource: ENTITYTAGS_RESOURCE, token: RETAIL_ENTITY_TAGS_TYPES.Router },
];
