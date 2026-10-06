import { injectable, inject } from "inversify";
import { EntityManager } from "typeorm";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { BadRequestError } from "@/shared/types/errors";
import DatabaseConfig from "@/database/database";
import { RetailAttendance, RetailBranch, RetailCustomer, RetailEmployee, RetailInventory, RetailOrder, RetailOrderItem, RetailPayment, RetailPayroll, RetailProduct, RetailProductVariant, RetailStockLedger, RetailWarehouse } from "@/database/models";
import { RetailCashMovements, RetailCashRegisters, RetailCashSessions, RetailCouponUsages, RetailCoupons, RetailCustomerDebtTransactions, RetailCustomerDebts, RetailExchangeItems, RetailExchanges, RetailFulfillmentItems, RetailFulfillments, RetailGiftCardTransactions, RetailGiftCards, RetailGoodsReceiptItems, RetailGoodsReceipts, RetailInvoiceItems, RetailInvoices, RetailLoyaltyAccounts, RetailLoyaltyTiers, RetailLoyaltyTransactions, RetailOrderDiscounts, RetailOrderTaxes, RetailOrderStatusHistory, RetailPaymentMethods, RetailPaymentTransactions, RetailPriceBookItems, RetailPriceBooks, RetailProductTaxRates, RetailPromotions, RetailPurchaseOrderItems, RetailPurchaseOrders, RetailPurchaseReturnItems, RetailPurchaseReturns, RetailReceipts, RetailReconciliationItems, RetailReconciliations, RetailRefundItems, RetailRefunds, RetailReturnItems, RetailReturns, RetailShipmentItems, RetailShipments, RetailShippingOrders, RetailShippingProviders, RetailStockAdjustments, RetailStockCountItems, RetailStockCounts, RetailStockTransferItems, RetailStockTransfers, RetailSupplierDebtTransactions, RetailSupplierDebts, RetailSuppliers, RetailTaxRates, RetailWorkShifts, RetailPayrollItems, RetailPayrollPeriods, RetailVoucherTransactions, RetailVouchers } from "@/database/models/retail/RetailGenericEntities";
import { RETAIL_DATA_RELATIONS, RETAIL_REFERENCE_RESOURCES, RETAIL_TYPES, RETAIL_RESOURCES, RetailResource, RetailRelationDefinition, RetailTableDefinition } from "./retail.types";
import { RetailRepository } from "./retail.repository";
import { RetailAttendancePunchDto, RetailCashSessionCloseDto, RetailCashSessionOpenDto, RetailCheckoutDto, RetailCustomerDebtPaymentDto, RetailExchangeDto, RetailGiftCardIssueDto, RetailGiftCardRedeemDto, RetailGoodsReceiptDto, RetailInventoryAdjustmentDto, RetailInventoryTransferDto, RetailOrderCancelDto, RetailOrderDeliverDto, RetailOrderShipDto, RetailPayrollGenerateDto, RetailPurchaseOrderCreateDto, RetailPurchaseReturnDto, RetailQueryDto, RetailReconciliationDto, RetailSalesReturnDto, RetailStockCountDto, RetailSupplierDebtPaymentDto, RetailVoucherIssueDto, RetailVoucherRedeemDto } from "./retail.validator";

@injectable()
export class RetailService {
  constructor(@inject(RETAIL_TYPES.RetailRepository) private readonly repository: RetailRepository) {}

  getDefinitions() {
    return Object.values(RETAIL_RESOURCES).map((definition) => {
      const { entity: _entity, ...publicDefinition } = definition;
      return {
      ...publicDefinition,
      fields: this.getFields(definition),
      dataRelations: this.getDataRelations(definition),
      };
    });
  }

  async list(resource: string, query: RetailQueryDto, tenantId?: string) {
    const definition = this.definition(resource);
    this.assertTenant(definition, tenantId);
    const result = await this.repository.list(definition, { ...query, tenantId });
    return ApiResponseHandler.getSuccess("OK", result.rows, {
      currentPage: query.page,
      size: query.size,
      totalRecords: result.total,
      totalPages: Math.ceil(result.total / query.size),
    });
  }

  async punchAttendance(input: RetailAttendancePunchDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const employee = await manager.getRepository(RetailEmployee).createQueryBuilder("employee").where("employee.id = :id", { id: input.employeeId }).andWhere("employee.tenant_id = :tenantId", { tenantId }).getOne();
      if (!employee || employee.employmentStatus !== "ACTIVE") throw new BadRequestError(`Employee not found or inactive: ${input.employeeId}`);
      let shift: RetailWorkShifts | null = null;
      if (input.shiftId) {
        shift = await manager.getRepository(RetailWorkShifts).createQueryBuilder("shift").where("shift.id = :id", { id: input.shiftId }).andWhere("shift.tenant_id = :tenantId", { tenantId }).getOne();
        if (!shift || shift.status !== "ACTIVE") throw new BadRequestError(`Work shift not found or inactive: ${input.shiftId}`);
      }
      const attendanceRepository = manager.getRepository(RetailAttendance);
      const query = attendanceRepository.createQueryBuilder("attendance").setLock("pessimistic_write").where("attendance.employee_id = :employeeId", { employeeId: input.employeeId }).andWhere("attendance.tenant_id = :tenantId", { tenantId }).andWhere("attendance.work_date = :workDate", { workDate: input.workDate });
      if (input.shiftId) query.andWhere("attendance.shift_id = :shiftId", { shiftId: input.shiftId });
      else query.andWhere("attendance.shift_id IS NULL");
      let attendance = await query.getOne();
      const punchedAt = input.at ? new Date(input.at) : new Date();
      if (Number.isNaN(punchedAt.getTime())) throw new BadRequestError("Attendance time is invalid");
      const shiftData = (shift?.data || {}) as Record<string, unknown>;
      const timeMinutes = (value: unknown): number | null => {
        const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
        if (!match) return null;
        return Number(match[1]) * 60 + Number(match[2]);
      };
      const actualMinutes = punchedAt.getHours() * 60 + punchedAt.getMinutes();
      const scheduledStart = timeMinutes(shiftData.startTime ?? shiftData.startAt ?? shiftData.start);
      const scheduledEnd = timeMinutes(shiftData.endTime ?? shiftData.endAt ?? shiftData.end);
      if (input.action === "CHECK_IN") {
        if (attendance?.checkIn) throw new BadRequestError(`Employee has already checked in for ${input.workDate}`);
        attendance = attendance || attendanceRepository.create({ tenantId, employeeId: input.employeeId, workDate: input.workDate, shiftId: input.shiftId || null, workedMinutes: 0, lateMinutes: 0, earlyLeaveMinutes: 0, overtimeMinutes: 0, status: "PRESENT" });
        attendance.checkIn = punchedAt;
        attendance.lateMinutes = scheduledStart === null ? 0 : Math.max(0, actualMinutes - scheduledStart);
        attendance.status = attendance.lateMinutes > 0 ? "LATE" : "PRESENT";
      } else {
        if (!attendance?.checkIn) throw new BadRequestError(`Employee has not checked in for ${input.workDate}`);
        if (attendance.checkOut) throw new BadRequestError(`Employee has already checked out for ${input.workDate}`);
        const checkedInAt = new Date(attendance.checkIn);
        attendance.checkOut = punchedAt;
        attendance.workedMinutes = Math.max(0, Math.floor((punchedAt.getTime() - checkedInAt.getTime()) / 60000));
        attendance.earlyLeaveMinutes = scheduledEnd === null ? 0 : Math.max(0, scheduledEnd - actualMinutes);
        attendance.overtimeMinutes = scheduledEnd === null ? 0 : Math.max(0, actualMinutes - scheduledEnd);
        attendance.status = attendance.lateMinutes > 0 ? "LATE" : attendance.earlyLeaveMinutes > 0 ? "EARLY_LEAVE" : "COMPLETED";
      }
      const saved = await attendanceRepository.save(attendance);
      return ApiResponseHandler.createSuccess(input.action === "CHECK_IN" ? "Attendance checked in" : "Attendance checked out", { attendance: saved, employee, shift, punchedBy: userId });
    });
  }

  async generatePayroll(input: RetailPayrollGenerateDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      let startDate = input.startDate;
      let endDate = input.endDate;
      let period: RetailPayrollPeriods | null = null;
      if (input.payrollPeriodId) {
        period = await manager.getRepository(RetailPayrollPeriods).createQueryBuilder("period").where("period.id = :id", { id: input.payrollPeriodId }).andWhere("period.tenant_id = :tenantId", { tenantId }).getOne();
        if (!period) throw new BadRequestError(`Payroll period not found: ${input.payrollPeriodId}`);
        const periodData = period.data || {};
        startDate = startDate || String(periodData.startDate || periodData.from || "");
        endDate = endDate || String(periodData.endDate || periodData.to || "");
      }
      if (!startDate || !endDate || startDate > endDate) throw new BadRequestError("A valid payroll startDate and endDate are required");
      const employeeRepository = manager.getRepository(RetailEmployee);
      const employeeQuery = employeeRepository.createQueryBuilder("employee").where("employee.tenant_id = :tenantId", { tenantId }).andWhere("employee.employment_status = 'ACTIVE'");
      if (input.employeeIds?.length) employeeQuery.andWhere("employee.id IN (:...employeeIds)", { employeeIds: input.employeeIds });
      const employees = await employeeQuery.getMany();
      const attendanceRepository = manager.getRepository(RetailAttendance);
      const payrollRepository = manager.getRepository(RetailPayroll);
      const itemRepository = manager.getRepository(RetailPayrollItems);
      const payrolls: RetailPayroll[] = [];
      const items: RetailPayrollItems[] = [];
      const skipped: string[] = [];
      for (const employee of employees) {
        if (period) {
          const existing = await payrollRepository.createQueryBuilder("payroll").where("payroll.employee_id = :employeeId", { employeeId: employee.id }).andWhere("payroll.payroll_period_id = :periodId", { periodId: period.id }).andWhere("payroll.tenant_id = :tenantId", { tenantId }).getOne();
          if (existing) {
            skipped.push(employee.id);
            continue;
          }
        }
        const attendanceRows = await attendanceRepository.createQueryBuilder("attendance").where("attendance.employee_id = :employeeId", { employeeId: employee.id }).andWhere("attendance.tenant_id = :tenantId", { tenantId }).andWhere("attendance.work_date BETWEEN :startDate AND :endDate", { startDate, endDate }).getMany();
        const attendanceDays = new Set(attendanceRows.map((row) => String(row.workDate)));
        const workedMinutes = attendanceRows.reduce((sum, row) => sum + Number(row.workedMinutes || 0), 0);
        const overtimeMinutes = attendanceRows.reduce((sum, row) => sum + Number(row.overtimeMinutes || 0), 0);
        const baseSalary = Number(employee.baseSalary || 0);
        const earnedBaseSalary = baseSalary / 26 * Math.min(26, attendanceDays.size);
        const overtimeTotal = baseSalary / (26 * 8) * (overtimeMinutes / 60) * 1.5;
        const grossSalary = earnedBaseSalary + overtimeTotal;
        const payroll = await payrollRepository.save(payrollRepository.create({ tenantId, payrollPeriodId: period?.id || null, employeeId: employee.id, baseSalary: earnedBaseSalary, allowanceTotal: 0, overtimeTotal, commissionTotal: 0, bonusTotal: 0, deductionTotal: 0, grossSalary, netSalary: grossSalary, status: "DRAFT" }));
        payrolls.push(payroll);
        items.push(await itemRepository.save(itemRepository.create({ tenantId, code: `PAY-ITEM-${payroll.id.slice(0, 8)}`, name: `Tổng hợp công ${employee.fullName}`, status: "COMPLETED", referenceId: payroll.id, amount: grossSalary, quantity: attendanceDays.size, data: { payrollId: payroll.id, employeeId: employee.id, payrollPeriodId: period?.id || null, startDate, endDate, attendanceDays: attendanceDays.size, workedMinutes, overtimeMinutes, earnedBaseSalary, overtimeTotal, generatedBy: userId } })));
      }
      return ApiResponseHandler.createSuccess("Payroll generated", { period, payrolls, items, skipped, startDate, endDate });
    });
  }

  async issueGiftCard(input: RetailGiftCardIssueDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const repository = manager.getRepository(RetailGiftCards);
      const existing = await repository.createQueryBuilder("gift_card").where("gift_card.tenant_id = :tenantId", { tenantId }).andWhere("gift_card.code = :code", { code: input.code }).getOne();
      if (existing) throw new BadRequestError(`Gift card code already exists: ${input.code}`);
      if (input.customerId) {
        const customer = await manager.getRepository(RetailCustomer).createQueryBuilder("customer").where("customer.id = :id", { id: input.customerId }).andWhere("customer.tenant_id = :tenantId", { tenantId }).getOne();
        if (!customer || customer.status !== "ACTIVE") throw new BadRequestError(`Customer not found or inactive: ${input.customerId}`);
      }
      const giftCard = await repository.save(repository.create({ tenantId, code: input.code, name: `Gift card ${input.code}`, status: "ACTIVE", amount: input.amount, data: { originalAmount: input.amount, balance: input.amount, customerId: input.customerId || null, expiresAt: input.expiresAt || null, issuedBy: userId, issuedAt: new Date().toISOString() } }));
      const transaction = await manager.getRepository(RetailGiftCardTransactions).save(manager.getRepository(RetailGiftCardTransactions).create({ tenantId, code: `GIFT-ISSUE-${input.code}`, name: `Phát hành gift card ${input.code}`, status: "COMPLETED", referenceId: giftCard.id, amount: input.amount, data: { giftCardId: giftCard.id, direction: "ISSUE", balance: input.amount, createdBy: userId } }));
      return ApiResponseHandler.createSuccess("Gift card issued", { giftCard, transaction });
    });
  }

  async redeemGiftCard(input: RetailGiftCardRedeemDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      if (!input.code && !input.giftCardId) throw new BadRequestError("Gift card code or giftCardId is required");
      const repository = manager.getRepository(RetailGiftCards);
      const query = repository.createQueryBuilder("gift_card").setLock("pessimistic_write").where("gift_card.tenant_id = :tenantId", { tenantId });
      if (input.giftCardId) query.andWhere("gift_card.id = :id", { id: input.giftCardId });
      else query.andWhere("gift_card.code = :code", { code: input.code });
      const giftCard = await query.getOne();
      if (!giftCard || giftCard.status !== "ACTIVE") throw new BadRequestError("Gift card not found or inactive");
      const data = giftCard.data || {};
      if (data.expiresAt && new Date(String(data.expiresAt)) < new Date()) throw new BadRequestError("Gift card has expired");
      const balance = Number(data.balance ?? giftCard.amount ?? 0);
      if (input.amount > balance) throw new BadRequestError("Gift card balance is insufficient");
      if (input.orderId) {
        const order = await manager.getRepository(RetailOrder).createQueryBuilder("order").where("order.id = :id", { id: input.orderId }).andWhere("order.tenant_id = :tenantId", { tenantId }).getOne();
        if (!order) throw new BadRequestError(`Order not found: ${input.orderId}`);
      }
      const nextBalance = balance - input.amount;
      giftCard.amount = nextBalance;
      giftCard.status = nextBalance === 0 ? "REDEEMED" : "ACTIVE";
      giftCard.data = { ...data, balance: nextBalance, lastOrderId: input.orderId || null, lastRedeemedAt: new Date().toISOString() };
      await repository.save(giftCard);
      const transaction = await manager.getRepository(RetailGiftCardTransactions).save(manager.getRepository(RetailGiftCardTransactions).create({ tenantId, code: `GIFT-REDEEM-${giftCard.code}-${Date.now()}`, name: `Sử dụng gift card ${giftCard.code}`, status: "COMPLETED", referenceId: giftCard.id, amount: input.amount, data: { giftCardId: giftCard.id, orderId: input.orderId || null, direction: "REDEEM", balance: nextBalance, createdBy: userId } }));
      return ApiResponseHandler.updateSuccess("Gift card redeemed", { giftCard, transaction, remainingBalance: nextBalance });
    });
  }

  async issueVoucher(input: RetailVoucherIssueDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const repository = manager.getRepository(RetailVouchers);
      const existing = await repository.createQueryBuilder("voucher").where("voucher.tenant_id = :tenantId", { tenantId }).andWhere("voucher.code = :code", { code: input.code }).getOne();
      if (existing) throw new BadRequestError(`Voucher code already exists: ${input.code}`);
      const voucher = await repository.save(repository.create({ tenantId, code: input.code, name: `Voucher ${input.code}`, status: "ACTIVE", amount: input.amount, data: { originalAmount: input.amount, balance: input.amount, maxUses: input.maxUses || null, usedCount: 0, expiresAt: input.expiresAt || null, issuedBy: userId, issuedAt: new Date().toISOString() } }));
      const transaction = await manager.getRepository(RetailVoucherTransactions).save(manager.getRepository(RetailVoucherTransactions).create({ tenantId, code: `VOUCHER-ISSUE-${input.code}`, name: `Phát hành voucher ${input.code}`, status: "COMPLETED", referenceId: voucher.id, amount: input.amount, data: { voucherId: voucher.id, direction: "ISSUE", balance: input.amount, createdBy: userId } }));
      return ApiResponseHandler.createSuccess("Voucher issued", { voucher, transaction });
    });
  }

  async redeemVoucher(input: RetailVoucherRedeemDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const repository = manager.getRepository(RetailVouchers);
      const voucher = await repository.createQueryBuilder("voucher").setLock("pessimistic_write").where("voucher.tenant_id = :tenantId", { tenantId }).andWhere("voucher.code = :code", { code: input.code }).getOne();
      if (!voucher || voucher.status !== "ACTIVE") throw new BadRequestError("Voucher not found or inactive");
      const data = voucher.data || {};
      if (data.expiresAt && new Date(String(data.expiresAt)) < new Date()) throw new BadRequestError("Voucher has expired");
      const usedCount = Number(data.usedCount || 0);
      if (data.maxUses !== null && data.maxUses !== undefined && usedCount >= Number(data.maxUses)) throw new BadRequestError("Voucher has reached its usage limit");
      const balance = Number(data.balance ?? voucher.amount ?? 0);
      if (input.amount > balance) throw new BadRequestError("Voucher balance is insufficient");
      if (input.orderId) {
        const order = await manager.getRepository(RetailOrder).createQueryBuilder("order").where("order.id = :id", { id: input.orderId }).andWhere("order.tenant_id = :tenantId", { tenantId }).getOne();
        if (!order) throw new BadRequestError(`Order not found: ${input.orderId}`);
      }
      const nextBalance = balance - input.amount;
      voucher.amount = nextBalance;
      voucher.status = nextBalance === 0 ? "USED" : "ACTIVE";
      voucher.data = { ...data, balance: nextBalance, usedCount: usedCount + 1, lastOrderId: input.orderId || null, lastRedeemedAt: new Date().toISOString() };
      await repository.save(voucher);
      const transaction = await manager.getRepository(RetailVoucherTransactions).save(manager.getRepository(RetailVoucherTransactions).create({ tenantId, code: `VOUCHER-REDEEM-${voucher.code}-${Date.now()}`, name: `Sử dụng voucher ${voucher.code}`, status: "COMPLETED", referenceId: voucher.id, amount: input.amount, data: { voucherId: voucher.id, orderId: input.orderId || null, direction: "REDEEM", balance: nextBalance, usedCount: usedCount + 1, createdBy: userId } }));
      return ApiResponseHandler.updateSuccess("Voucher redeemed", { voucher, transaction, remainingBalance: nextBalance });
    });
  }

  async openCashSession(input: RetailCashSessionOpenDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const register = await manager.getRepository(RetailCashRegisters).createQueryBuilder("register").where("register.id = :id", { id: input.cashRegisterId }).andWhere("register.tenant_id = :tenantId", { tenantId }).getOne();
      if (!register) throw new BadRequestError(`Cash register not found: ${input.cashRegisterId}`);
      if (register.status !== "ACTIVE") throw new BadRequestError(`Cash register is not active: ${input.cashRegisterId}`);
      const existing = await manager.getRepository(RetailCashSessions).createQueryBuilder("session").where("session.tenant_id = :tenantId", { tenantId }).andWhere("session.status = 'OPEN'").andWhere("session.data ->> 'cashRegisterId' = :cashRegisterId", { cashRegisterId: input.cashRegisterId }).getOne();
      if (existing) throw new BadRequestError(`Cash register already has an open session: ${input.cashRegisterId}`);
      const code = input.code || `CS${Date.now().toString().slice(-10)}`;
      const session = await manager.getRepository(RetailCashSessions).save(manager.getRepository(RetailCashSessions).create({ tenantId, code, name: input.note || `Ca mở ${register.name || register.code || input.cashRegisterId}`, status: "OPEN", amount: input.openingAmount, data: { cashRegisterId: input.cashRegisterId, openingAmount: input.openingAmount, openedBy: userId, openedAt: new Date().toISOString(), note: input.note || null } }));
      return ApiResponseHandler.createSuccess("Cash session opened", { session, register });
    });
  }

  async closeCashSession(sessionId: string, input: RetailCashSessionCloseDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const sessionRepository = manager.getRepository(RetailCashSessions);
      const session = await sessionRepository.createQueryBuilder("session").setLock("pessimistic_write").where("session.id = :id", { id: sessionId }).andWhere("session.tenant_id = :tenantId", { tenantId }).getOne();
      if (!session) throw new BadRequestError(`Cash session not found: ${sessionId}`);
      if (session.status !== "OPEN") throw new BadRequestError(`Cash session is not open: ${sessionId}`);
      const movements = await manager.getRepository(RetailCashMovements).createQueryBuilder("cash_movement").where("cash_movement.tenant_id = :tenantId", { tenantId }).andWhere("cash_movement.data ->> 'cashSessionId' = :sessionId", { sessionId }).getMany();
      const movementTotal = movements.reduce((sum, movement) => sum + Number(movement.amount || 0), 0);
      const openingAmount = Number((session.data || {}).openingAmount || session.amount || 0);
      const expectedAmount = openingAmount + movementTotal;
      const difference = input.closingAmount - expectedAmount;
      session.status = "CLOSED";
      session.amount = input.closingAmount;
      session.data = { ...(session.data || {}), closingAmount: input.closingAmount, expectedAmount, movementTotal, difference, closedBy: userId, closedAt: new Date().toISOString(), note: input.note || null };
      await sessionRepository.save(session);
      return ApiResponseHandler.updateSuccess("Cash session closed", { session, movements, expectedAmount, difference });
    });
  }

  async findById(resource: string, id: string, tenantId?: string) {
    const definition = this.definition(resource);
    this.assertTenant(definition, tenantId);
    return ApiResponseHandler.getSuccess("OK", await this.repository.findById(definition, id, tenantId));
  }

  async create(resource: string, body: Record<string, unknown>, tenantId?: string) {
    const definition = this.definition(resource);
    this.assertTenant(definition, tenantId);
    const data = this.prepare(definition, body, tenantId);
    await this.assertReferences(definition, data, tenantId);
    return ApiResponseHandler.createSuccess("Created", await this.repository.create(definition, data));
  }

  async update(resource: string, id: string, body: Record<string, unknown>, tenantId?: string) {
    const definition = this.definition(resource);
    this.assertTenant(definition, tenantId);
    if (resource === "orders" && ["CANCELLED", "RETURNED", "PARTIALLY_RETURNED"].includes(String(body.status))) throw new BadRequestError("Use the transactional order cancellation or return endpoint instead of changing order status directly");
    const data = this.prepare(definition, body);
    await this.assertReferences(definition, data, tenantId);
    return ApiResponseHandler.updateSuccess("Updated", await this.repository.update(definition, id, tenantId, data));
  }

  async delete(resource: string, id: string, tenantId?: string) {
    const definition = this.definition(resource);
    this.assertTenant(definition, tenantId);
    await this.repository.delete(definition, id, tenantId);
    return ApiResponseHandler.deleteSuccess("Deleted", id);
  }

  async checkout(input: RetailCheckoutDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const variantRepository = manager.getRepository(RetailProductVariant);
      const orderRepository = manager.getRepository(RetailOrder);
      const itemRepository = manager.getRepository(RetailOrderItem);
      const paymentRepository = manager.getRepository(RetailPayment);
      const paymentMethodRepository = manager.getRepository(RetailPaymentMethods);
      const productRepository = manager.getRepository(RetailProduct);
      const inventoryRepository = manager.getRepository(RetailInventory);
      const ledgerRepository = manager.getRepository(RetailStockLedger);
      const branchRepository = manager.getRepository(RetailBranch);
      const warehouseRepository = manager.getRepository(RetailWarehouse);

      const branch = await branchRepository.createQueryBuilder("branch")
        .where("branch.id = :id", { id: input.branchId })
        .andWhere("branch.tenant_id = :tenantId", { tenantId })
        .getOne();
      if (!branch) throw new BadRequestError(`Branch not found: ${input.branchId}`);
      if (branch.status !== "ACTIVE") throw new BadRequestError(`Branch is not active: ${input.branchId}`);
      if (input.warehouseId) {
        const warehouse = await warehouseRepository.createQueryBuilder("warehouse")
          .where("warehouse.id = :id", { id: input.warehouseId })
          .andWhere("warehouse.tenant_id = :tenantId", { tenantId })
          .getOne();
        if (!warehouse) throw new BadRequestError(`Warehouse not found: ${input.warehouseId}`);
        if (warehouse.branchId && warehouse.branchId !== input.branchId) throw new BadRequestError("Warehouse does not belong to the selected branch");
        if (warehouse.status !== "ACTIVE") throw new BadRequestError(`Warehouse is not active: ${input.warehouseId}`);
      }
      if (input.customerId) {
        const customer = await manager.getRepository(RetailCustomer).createQueryBuilder("customer")
          .where("customer.id = :id", { id: input.customerId })
          .andWhere("customer.tenant_id = :tenantId", { tenantId })
          .getOne();
        if (!customer) throw new BadRequestError(`Customer not found: ${input.customerId}`);
        if (customer.status !== "ACTIVE") throw new BadRequestError(`Customer is not active: ${input.customerId}`);
      }

      const orderCode = input.orderCode || `DH${Date.now().toString().slice(-9)}`;
      let priceBook: RetailPriceBooks | null = null;
      const priceBookPrices = new Map<string, number>();
      if (input.priceBookId) {
        priceBook = await manager.getRepository(RetailPriceBooks).createQueryBuilder("priceBook").where("priceBook.id = :id", { id: input.priceBookId }).andWhere("priceBook.tenant_id = :tenantId", { tenantId }).getOne();
        if (!priceBook || priceBook.status !== "ACTIVE") throw new BadRequestError(`Price book not found or inactive: ${input.priceBookId}`);
        const priceItems = await manager.getRepository(RetailPriceBookItems).createQueryBuilder("price_item").where("price_item.tenant_id = :tenantId", { tenantId }).andWhere("price_item.status = 'ACTIVE'").andWhere("(price_item.reference_id::text = :priceBookId OR price_item.data ->> 'priceBookId' = :priceBookId)", { priceBookId: input.priceBookId }).getMany();
        for (const priceItem of priceItems) {
          const data = priceItem.data || {};
          const variantId = data.variantId ? String(data.variantId) : undefined;
          const unitPrice = data.unitPrice ?? priceItem.amount;
          if (variantId && unitPrice !== null && unitPrice !== undefined) priceBookPrices.set(variantId, Number(unitPrice));
        }
      }

      const variants = new Map<string, RetailProductVariant>();
      for (const item of input.items) {
        if (variants.has(item.variantId)) throw new BadRequestError(`Duplicate product variant in order: ${item.variantId}`);
        const variant = await variantRepository.createQueryBuilder("variant")
          .where("variant.id = :id", { id: item.variantId })
          .andWhere("variant.tenant_id = :tenantId", { tenantId })
          .getOne();
        if (!variant) throw new BadRequestError(`Product variant not found: ${item.variantId}`);
        if (variant.status !== "ACTIVE") throw new BadRequestError(`Product variant is not active: ${item.variantId}`);
        const product = await productRepository.createQueryBuilder("product")
          .where("product.id = :id", { id: variant.productId })
          .andWhere("product.tenant_id = :tenantId", { tenantId })
          .getOne();
        if (!product || product.status !== "ACTIVE") throw new BadRequestError(`Product is not active for variant: ${item.variantId}`);
        variants.set(item.variantId, variant);
      }

      let coupon: RetailCoupons | null = null;
      let promotion: RetailPromotions | null = null;
      if (input.couponCode) {
        coupon = await manager.getRepository(RetailCoupons).createQueryBuilder("coupon").where("coupon.tenant_id = :tenantId", { tenantId }).andWhere("coupon.code = :code OR coupon.data ->> 'code' = :code", { code: input.couponCode }).getOne();
        if (!coupon || coupon.status !== "ACTIVE") throw new BadRequestError(`Coupon not found or inactive: ${input.couponCode}`);
        const couponData = coupon.data || {};
        const maxUses = couponData.maxUses === undefined ? undefined : Number(couponData.maxUses);
        if (maxUses !== undefined) {
          const usageCount = await manager.getRepository(RetailCouponUsages).createQueryBuilder("usage").where("usage.tenant_id = :tenantId", { tenantId }).andWhere("usage.status = 'COMPLETED'").andWhere("(usage.data ->> 'couponId' = :couponId OR usage.reference_id::text = :couponId)", { couponId: coupon.id }).getCount();
          if (usageCount >= maxUses) throw new BadRequestError(`Coupon has reached its usage limit: ${input.couponCode}`);
        }
        const promotionId = couponData.promotionId ? String(couponData.promotionId) : undefined;
        if (promotionId) promotion = await manager.getRepository(RetailPromotions).findOne({ where: { id: promotionId, tenantId } });
      }
      if (input.promotionId) promotion = await manager.getRepository(RetailPromotions).findOne({ where: { id: input.promotionId, tenantId } });
      if ((input.promotionId || input.couponCode) && (!promotion || promotion.status !== "ACTIVE")) throw new BadRequestError(`Promotion not found or inactive: ${input.promotionId || input.couponCode}`);
      if (input.couponCode && !promotion) throw new BadRequestError(`Coupon is not linked to an active promotion: ${input.couponCode}`);
      const now = new Date();
      const promotionData = promotion?.data || {};
      if (promotion) {
        const startsAt = promotionData.startsAt ? new Date(String(promotionData.startsAt)) : null;
        const endsAt = promotionData.endsAt ? new Date(String(promotionData.endsAt)) : null;
        if (startsAt && now < startsAt) throw new BadRequestError("Promotion has not started");
        if (endsAt && now > endsAt) throw new BadRequestError("Promotion has expired");
      }
      const taxApplications: Array<{ variantId: string; taxRateId: string; rate: number; amount: number }> = [];
      const lines = [];
      for (const item of input.items) {
        const unitPrice = priceBookPrices.get(item.variantId) ?? item.unitPrice;
        let taxTotal = item.taxTotal;
        if (taxTotal === 0) {
          const variant = variants.get(item.variantId);
          const productTaxRates = await manager.getRepository(RetailProductTaxRates).createQueryBuilder("product_tax").where("product_tax.tenant_id = :tenantId", { tenantId }).andWhere("product_tax.status = 'ACTIVE'").andWhere("(product_tax.data ->> 'variantId' = :variantId OR product_tax.data ->> 'productId' = :productId)", { variantId: item.variantId, productId: variant?.productId }).getMany();
          for (const productTaxRate of productTaxRates) {
            const productTaxData = productTaxRate.data || {};
            const taxRateId = productTaxData.taxRateId ? String(productTaxData.taxRateId) : productTaxRate.referenceId ? String(productTaxRate.referenceId) : undefined;
            const taxRate = taxRateId ? await manager.getRepository(RetailTaxRates).createQueryBuilder("tax_rate").where("tax_rate.id = :id", { id: taxRateId }).andWhere("tax_rate.tenant_id = :tenantId", { tenantId }).getOne() : null;
            const rateData = taxRate?.data || {};
            const rate = Number(productTaxData.rate ?? productTaxData.percent ?? rateData.rate ?? rateData.percent ?? taxRate?.amount ?? 0);
            if (taxRateId && rate > 0) {
              const amount = item.quantity * unitPrice * rate / 100;
              taxTotal += amount;
              taxApplications.push({ variantId: item.variantId, taxRateId, rate, amount });
            }
          }
        }
        lines.push({ ...item, unitPrice, taxTotal, lineTotal: item.quantity * unitPrice - item.discountTotal + taxTotal });
      }
      const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
      const explicitDiscountTotal = lines.reduce((sum, line) => sum + line.discountTotal, 0);
      const promotionMinimum = promotionData.minSubtotal === undefined ? 0 : Number(promotionData.minSubtotal);
      if (promotion && subtotal < promotionMinimum) throw new BadRequestError(`Order does not meet promotion minimum subtotal: ${promotionMinimum}`);
      const promotionType = String(promotionData.discountType || (promotionData.percent !== undefined ? "PERCENT" : "FIXED")).toUpperCase();
      const promotionValue = promotion ? Number(promotionData.value ?? promotionData.percent ?? promotion.amount ?? 0) : 0;
      const promotionBase = Math.max(0, subtotal - explicitDiscountTotal);
      const uncappedPromotionDiscount = promotionType === "PERCENT" ? promotionBase * promotionValue / 100 : promotionValue;
      const promotionDiscount = Math.min(promotionBase, Math.max(0, Math.min(uncappedPromotionDiscount, promotionData.maxDiscount === undefined ? uncappedPromotionDiscount : Number(promotionData.maxDiscount))));
      const discountTotal = explicitDiscountTotal + promotionDiscount;
      const taxTotal = lines.reduce((sum, line) => sum + line.taxTotal, 0);
      const grandTotal = Math.max(0, lines.reduce((sum, line) => sum + line.lineTotal, 0) - promotionDiscount);
      const paidAmount = input.paidAmount ?? grandTotal;
      if (paidAmount > grandTotal) throw new BadRequestError("paidAmount cannot exceed the order total");
      if (paidAmount < grandTotal && !input.customerId) throw new BadRequestError("A customer is required for an unpaid or partially paid order");
      const paymentMethod = paidAmount > 0
        ? (input.paymentMethodId
          ? await paymentMethodRepository.createQueryBuilder("paymentMethod").where("paymentMethod.id = :id", { id: input.paymentMethodId }).andWhere("paymentMethod.tenant_id = :tenantId", { tenantId }).getOne()
          : await paymentMethodRepository.createQueryBuilder("paymentMethod").where("paymentMethod.code = :code", { code: input.paymentMethod || "CASH" }).andWhere("paymentMethod.tenant_id = :tenantId", { tenantId }).getOne())
        : null;
      if (paidAmount > 0 && !paymentMethod) throw new BadRequestError(`Payment method not found: ${input.paymentMethodId || input.paymentMethod || "CASH"}`);
      let cashSession: RetailCashSessions | null = null;
      if (input.cashSessionId) {
        cashSession = await manager.getRepository(RetailCashSessions).createQueryBuilder("session").where("session.id = :id", { id: input.cashSessionId }).andWhere("session.tenant_id = :tenantId", { tenantId }).getOne();
        if (!cashSession || cashSession.status !== "OPEN") throw new BadRequestError(`Cash session not found or closed: ${input.cashSessionId}`);
        if (paymentMethod?.code !== "CASH") throw new BadRequestError("A cash session can only be used with the CASH payment method");
        if (paidAmount <= 0) throw new BadRequestError("A cash session requires a positive cash payment");
      }
      const debtTotal = grandTotal - paidAmount;

      const order = await orderRepository.save(orderRepository.create({
        tenantId,
        branchId: input.branchId,
        warehouseId: input.warehouseId ?? null,
        customerId: input.customerId ?? null,
        orderCode,
        channel: "POS",
        status: "COMPLETED",
        paymentStatus: paidAmount >= grandTotal ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID",
        fulfillmentStatus: input.warehouseId ? "UNFULFILLED" : "FULFILLED",
        subtotal,
        discountTotal,
        taxTotal,
        shippingTotal: 0,
        grandTotal,
        paidTotal: paidAmount,
        debtTotal,
        orderedAt: new Date(),
      }));

      const orderTaxes = [];
      for (const taxApplication of taxApplications) {
        orderTaxes.push(await manager.getRepository(RetailOrderTaxes).save(manager.getRepository(RetailOrderTaxes).create({ tenantId, code: `TAX-${orderCode}-${orderTaxes.length + 1}`, name: `Thuế ${taxApplication.rate}%`, status: "COMPLETED", referenceId: order.id, amount: taxApplication.amount, data: { orderId: order.id, variantId: taxApplication.variantId, taxRateId: taxApplication.taxRateId, rate: taxApplication.rate } })));
      }

      let orderDiscount: RetailOrderDiscounts | null = null;
      if (promotion && promotionDiscount > 0) {
        orderDiscount = await manager.getRepository(RetailOrderDiscounts).save(manager.getRepository(RetailOrderDiscounts).create({ tenantId, code: `DISC-${orderCode}`, name: promotion.name || promotion.code || "Khuyến mãi", status: "COMPLETED", referenceId: order.id, amount: promotionDiscount, data: { orderId: order.id, promotionId: promotion.id, couponId: coupon?.id || null, type: promotionType, value: promotionValue, baseAmount: promotionBase } }));
      }
      let couponUsage: RetailCouponUsages | null = null;
      if (coupon) {
        couponUsage = await manager.getRepository(RetailCouponUsages).save(manager.getRepository(RetailCouponUsages).create({ tenantId, code: `USE-${coupon.code || input.couponCode}-${orderCode}`, name: `Sử dụng mã ${coupon.code || input.couponCode}`, status: "COMPLETED", referenceId: coupon.id, amount: promotionDiscount, data: { couponId: coupon.id, couponCode: coupon.code || input.couponCode, promotionId: promotion?.id || null, orderId: order.id, customerId: input.customerId || null } }));
      }

      const items = [];
      for (const line of lines) {
        const variant = variants.get(line.variantId);
        if (!variant) throw new BadRequestError(`Product variant not found: ${line.variantId}`);

        if (input.warehouseId) {
          const inventory = await inventoryRepository.createQueryBuilder("inventory")
            .setLock("pessimistic_write")
            .where("inventory.warehouse_id = :warehouseId", { warehouseId: input.warehouseId })
            .andWhere("inventory.variant_id = :variantId", { variantId: line.variantId })
            .andWhere("inventory.tenant_id = :tenantId", { tenantId })
            .getOne();
          if (!inventory) throw new BadRequestError(`Inventory not found for variant: ${line.variantId}`);
          const available = Number(inventory.onHand) - Number(inventory.reserved);
          if (available < line.quantity) throw new BadRequestError(`Insufficient inventory for variant: ${line.variantId}`);
          inventory.onHand = Number(inventory.onHand) - line.quantity;
          inventory.version = Number(inventory.version || 0) + 1;
          await inventoryRepository.save(inventory);
          await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: input.warehouseId, variantId: line.variantId, movementType: "SALE", quantity: -line.quantity, unitCost: variant.costPrice, referenceType: "ORDER", referenceId: order.id, occurredAt: new Date(), createdBy: userId, metadata: { orderCode } }));
        }

        items.push(await itemRepository.save(itemRepository.create({ tenantId, orderId: order.id, variantId: line.variantId, quantity: line.quantity, unitPrice: line.unitPrice, discountTotal: line.discountTotal, taxTotal: line.taxTotal, lineTotal: line.lineTotal, costTotal: line.quantity * Number(variant.costPrice || 0) })));
      }

      const invoiceRepository = manager.getRepository(RetailInvoices);
      const invoice = await invoiceRepository.save(invoiceRepository.create({ tenantId, code: `INV-${orderCode}`, name: `Hóa đơn ${orderCode}`, status: "COMPLETED", referenceId: order.id, amount: grandTotal, data: { orderId: order.id, orderCode, customerId: input.customerId || null, subtotal, discountTotal, taxTotal, grandTotal } }));
      const invoiceItems = [];
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        invoiceItems.push(await manager.getRepository(RetailInvoiceItems).save(manager.getRepository(RetailInvoiceItems).create({ tenantId, code: `${invoice.code}-${index + 1}`, name: item.variantId, status: "COMPLETED", referenceId: invoice.id, quantity: item.quantity, amount: item.lineTotal, data: { invoiceId: invoice.id, orderId: order.id, orderItemId: item.id, variantId: item.variantId, unitPrice: item.unitPrice } })));
      }
      const fulfillment = input.warehouseId
        ? await manager.getRepository(RetailFulfillments).save(manager.getRepository(RetailFulfillments).create({ tenantId, code: `FUL-${orderCode}`, name: `Xuất hàng ${orderCode}`, status: "PENDING", referenceId: order.id, quantity: lines.reduce((sum, line) => sum + line.quantity, 0), data: { orderId: order.id, warehouseId: input.warehouseId, status: "PENDING" } }))
        : null;
      const fulfillmentItems = [];
      if (fulfillment) {
        for (let index = 0; index < items.length; index += 1) {
          const item = items[index];
          fulfillmentItems.push(await manager.getRepository(RetailFulfillmentItems).save(manager.getRepository(RetailFulfillmentItems).create({ tenantId, code: `${fulfillment.code}-${index + 1}`, name: item.variantId, status: "PENDING", referenceId: fulfillment.id, quantity: item.quantity, data: { fulfillmentId: fulfillment.id, orderId: order.id, orderItemId: item.id, variantId: item.variantId, warehouseId: input.warehouseId } })));
        }
      }
      const statusHistory = await manager.getRepository(RetailOrderStatusHistory).save(manager.getRepository(RetailOrderStatusHistory).create({ tenantId, code: `HIS-${orderCode}`, name: `Hoàn tất đơn ${orderCode}`, status: "COMPLETED", referenceId: order.id, data: { orderId: order.id, from: "DRAFT", to: "COMPLETED", fulfillmentId: fulfillment?.id || null, invoiceId: invoice.id, createdBy: userId } }));

      const payment = paidAmount > 0 && paymentMethod
        ? await paymentRepository.save(paymentRepository.create({ tenantId, orderId: order.id, customerId: input.customerId ?? null, paymentMethodId: paymentMethod.id, amount: paidAmount, status: "PAID", externalReference: input.paymentMethod || paymentMethod.code, paidAt: new Date(), idempotencyKey: orderCode }))
        : null;
      let paymentTransaction: RetailPaymentTransactions | null = null;
      if (payment) {
        paymentTransaction = await manager.getRepository(RetailPaymentTransactions).save(manager.getRepository(RetailPaymentTransactions).create({ tenantId, code: `PAY-TXN-${orderCode}`, name: `Giao dịch thanh toán ${orderCode}`, status: "COMPLETED", referenceId: payment.id, amount: paidAmount, data: { paymentId: payment.id, orderId: order.id, paymentMethodId: paymentMethod?.id, direction: "IN", completedAt: new Date().toISOString() } }));
      }
      if (payment) {
        await manager.getRepository(RetailCashMovements).save(manager.getRepository(RetailCashMovements).create({ tenantId, code: `CASH-IN-${orderCode}`, name: `Thu tiền đơn ${orderCode}`, status: "COMPLETED", referenceId: payment.id, amount: paidAmount, data: { direction: "IN", cashSessionId: cashSession?.id || null, orderId: order.id, paymentId: payment.id, paymentMethodId: paymentMethod?.id, orderCode, createdBy: userId } }));
      }
      if (input.customerId && debtTotal > 0) {
        const debt = await manager.getRepository(RetailCustomerDebts).save(manager.getRepository(RetailCustomerDebts).create({ tenantId, code: `DEBT-${orderCode}`, name: `Công nợ ${orderCode}`, status: "ACTIVE", referenceId: order.id, amount: debtTotal, data: { customerId: input.customerId, orderId: order.id, orderCode, originalAmount: grandTotal, paidAmount, balance: debtTotal } }));
        await manager.getRepository(RetailCustomerDebtTransactions).save(manager.getRepository(RetailCustomerDebtTransactions).create({ tenantId, code: `DEBT-TXN-${orderCode}`, name: `Phát sinh công nợ ${orderCode}`, status: "ACTIVE", referenceId: debt.id, amount: debtTotal, data: { debtId: debt.id, customerId: input.customerId, orderId: order.id, direction: "CHARGE", balance: debtTotal } }));
      }
      if (input.customerId) {
        const customerRepository = manager.getRepository(RetailCustomer);
        const customer = await customerRepository.createQueryBuilder("customer").setLock("pessimistic_write").where("customer.id = :id", { id: input.customerId }).andWhere("customer.tenant_id = :tenantId", { tenantId }).getOne();
        if (customer) {
          customer.totalSpent = Number(customer.totalSpent || 0) + grandTotal;
          customer.orderCount = Number(customer.orderCount || 0) + 1;
          await customerRepository.save(customer);
        }
      }
      let loyaltyAccount: RetailLoyaltyAccounts | null = null;
      let loyaltyTransaction: RetailLoyaltyTransactions | null = null;
      if (input.customerId) {
        const loyaltyRepository = manager.getRepository(RetailLoyaltyAccounts);
        loyaltyAccount = await loyaltyRepository.createQueryBuilder("loyalty_account").setLock("pessimistic_write").where("loyalty_account.tenant_id = :tenantId", { tenantId }).andWhere("loyalty_account.data ->> 'customerId' = :customerId", { customerId: input.customerId }).getOne();
        if (!loyaltyAccount) {
          loyaltyAccount = await loyaltyRepository.save(loyaltyRepository.create({ tenantId, code: `LOY-${input.customerId.slice(0, 8)}`, name: `Điểm ${input.customerId}`, status: "ACTIVE", referenceId: input.customerId, quantity: 0, data: { customerId: input.customerId, points: 0, lifetimePoints: 0, pointRate: 10000 } }));
        }
        const accountData = loyaltyAccount.data || {};
        const currentPoints = Number(accountData.points || loyaltyAccount.quantity || 0);
        const tiers = await manager.getRepository(RetailLoyaltyTiers).createQueryBuilder("loyalty_tier").where("loyalty_tier.tenant_id = :tenantId", { tenantId }).andWhere("loyalty_tier.status = 'ACTIVE'").getMany();
        const eligibleTiers = tiers.filter((tier) => Number((tier.data || {}).minPoints || tier.quantity || 0) <= currentPoints).sort((left, right) => Number((right.data || {}).minPoints || right.quantity || 0) - Number((left.data || {}).minPoints || left.quantity || 0));
        const tier = eligibleTiers[0];
        const multiplier = Number((tier?.data || {}).multiplier || 1);
        const pointRate = Math.max(1, Number(accountData.pointRate || 10000));
        const earnedPoints = Math.floor(grandTotal / pointRate * multiplier);
        if (earnedPoints > 0) {
          const nextPoints = currentPoints + earnedPoints;
          loyaltyAccount.quantity = nextPoints;
          loyaltyAccount.data = { ...accountData, customerId: input.customerId, points: nextPoints, lifetimePoints: Number(accountData.lifetimePoints || 0) + earnedPoints, tierId: tier?.id || accountData.tierId || null, lastOrderId: order.id };
          await loyaltyRepository.save(loyaltyAccount);
          loyaltyTransaction = await manager.getRepository(RetailLoyaltyTransactions).save(manager.getRepository(RetailLoyaltyTransactions).create({ tenantId, code: `LOY-TXN-${orderCode}`, name: `Tích điểm đơn ${orderCode}`, status: "COMPLETED", referenceId: loyaltyAccount.id, amount: earnedPoints, quantity: earnedPoints, data: { loyaltyAccountId: loyaltyAccount.id, customerId: input.customerId, orderId: order.id, direction: "EARN", points: earnedPoints, grandTotal } }));
        }
      }
      return ApiResponseHandler.createSuccess("Checkout completed", { order, items, payment, paymentTransaction, invoice, invoiceItems, fulfillment, fulfillmentItems, statusHistory, orderDiscount, orderTaxes, couponUsage, promotion, priceBook, loyaltyAccount, loyaltyTransaction });
    });
  }

  async countInventory(input: RetailStockCountDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const warehouse = await manager.getRepository(RetailWarehouse).createQueryBuilder("warehouse").where("warehouse.id = :id", { id: input.warehouseId }).andWhere("warehouse.tenant_id = :tenantId", { tenantId }).getOne();
      if (!warehouse || warehouse.status !== "ACTIVE") throw new BadRequestError(`Warehouse not found or inactive: ${input.warehouseId}`);
      const variantRepository = manager.getRepository(RetailProductVariant);
      const inventoryRepository = manager.getRepository(RetailInventory);
      const ledgerRepository = manager.getRepository(RetailStockLedger);
      const countRepository = manager.getRepository(RetailStockCounts);
      const itemRepository = manager.getRepository(RetailStockCountItems);
      const variantIds = new Set<string>();
      const code = input.code || `CNT${Date.now().toString().slice(-10)}`;
      const stockCount = await countRepository.save(countRepository.create({ tenantId, code, name: input.reason || "Kiểm kê tồn kho", status: "COMPLETED", data: { warehouseId: input.warehouseId, reason: input.reason || null, createdBy: userId } }));
      const items = [];
      const inventories: RetailInventory[] = [];
      const ledgers: RetailStockLedger[] = [];
      let totalDifference = 0;
      for (const line of input.items) {
        if (variantIds.has(line.variantId)) throw new BadRequestError(`Duplicate product variant in stock count: ${line.variantId}`);
        variantIds.add(line.variantId);
        const variant = await variantRepository.createQueryBuilder("variant").where("variant.id = :id", { id: line.variantId }).andWhere("variant.tenant_id = :tenantId", { tenantId }).getOne();
        if (!variant || variant.status !== "ACTIVE") throw new BadRequestError(`Product variant not found or inactive: ${line.variantId}`);
        const inventory = await inventoryRepository.createQueryBuilder("inventory").setLock("pessimistic_write").where("inventory.warehouse_id = :warehouseId", { warehouseId: input.warehouseId }).andWhere("inventory.variant_id = :variantId", { variantId: line.variantId }).andWhere("inventory.tenant_id = :tenantId", { tenantId }).getOne() || inventoryRepository.create({ tenantId, warehouseId: input.warehouseId, variantId: line.variantId, onHand: 0, reserved: 0, version: 0 });
        const previousQuantity = Number(inventory.onHand || 0);
        const reserved = Number(inventory.reserved || 0);
        if (line.countedQuantity < reserved) throw new BadRequestError(`Counted quantity cannot be below reserved quantity for variant: ${line.variantId}`);
        const difference = line.countedQuantity - previousQuantity;
        inventory.onHand = line.countedQuantity;
        inventory.version = Number(inventory.version || 0) + 1;
        inventories.push(await inventoryRepository.save(inventory));
        totalDifference += difference;
        items.push(await itemRepository.save(itemRepository.create({ tenantId, code: `${code}-${items.length + 1}`, name: variant.sku, status: "COMPLETED", referenceId: stockCount.id, quantity: line.countedQuantity, amount: difference * Number(line.unitCost ?? variant.costPrice ?? 0), data: { stockCountId: stockCount.id, warehouseId: input.warehouseId, variantId: line.variantId, previousQuantity, countedQuantity: line.countedQuantity, difference, unitCost: line.unitCost ?? variant.costPrice } })));
        if (difference !== 0) {
          ledgers.push(await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: input.warehouseId, variantId: line.variantId, movementType: "COUNT_ADJUSTMENT", quantity: difference, unitCost: line.unitCost ?? variant.costPrice, referenceType: "STOCK_COUNT", referenceId: stockCount.id, occurredAt: new Date(), createdBy: userId, metadata: { code, previousQuantity, countedQuantity: line.countedQuantity, reason: input.reason || null } })));
        }
      }
      stockCount.quantity = input.items.reduce((sum, line) => sum + line.countedQuantity, 0);
      stockCount.amount = totalDifference;
      stockCount.data = { ...(stockCount.data || {}), totalDifference, itemCount: items.length };
      await countRepository.save(stockCount);
      return ApiResponseHandler.createSuccess("Inventory counted", { stockCount, items, inventories, ledgers });
    });
  }

  async adjustInventory(input: RetailInventoryAdjustmentDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const warehouse = await manager.getRepository(RetailWarehouse).createQueryBuilder("warehouse")
        .where("warehouse.id = :id", { id: input.warehouseId })
        .andWhere("warehouse.tenant_id = :tenantId", { tenantId })
        .getOne();
      if (!warehouse) throw new BadRequestError(`Warehouse not found: ${input.warehouseId}`);
      if (warehouse.status !== "ACTIVE") throw new BadRequestError(`Warehouse is not active: ${input.warehouseId}`);

      const variantRepository = manager.getRepository(RetailProductVariant);
      const inventoryRepository = manager.getRepository(RetailInventory);
      const ledgerRepository = manager.getRepository(RetailStockLedger);
      const adjustmentRepository = manager.getRepository(RetailStockAdjustments);
      const code = input.code || `ADJ${Date.now().toString().slice(-10)}`;
      const adjustment = await adjustmentRepository.save(adjustmentRepository.create({
        tenantId,
        code,
        name: input.reason || "Điều chỉnh tồn kho",
        status: "COMPLETED",
        data: { warehouseId: input.warehouseId, reason: input.reason || null, items: input.items, createdBy: userId },
      }));
      const inventories: RetailInventory[] = [];
      const ledgers: RetailStockLedger[] = [];
      const variantIds = new Set<string>();

      for (const line of input.items) {
        if (variantIds.has(line.variantId)) throw new BadRequestError(`Duplicate product variant in adjustment: ${line.variantId}`);
        variantIds.add(line.variantId);
        const variant = await variantRepository.createQueryBuilder("variant")
          .where("variant.id = :id", { id: line.variantId })
          .andWhere("variant.tenant_id = :tenantId", { tenantId })
          .getOne();
        if (!variant) throw new BadRequestError(`Product variant not found: ${line.variantId}`);
        if (variant.status !== "ACTIVE") throw new BadRequestError(`Product variant is not active: ${line.variantId}`);
        const inventory = await inventoryRepository.createQueryBuilder("inventory")
          .setLock("pessimistic_write")
          .where("inventory.warehouse_id = :warehouseId", { warehouseId: input.warehouseId })
          .andWhere("inventory.variant_id = :variantId", { variantId: line.variantId })
          .andWhere("inventory.tenant_id = :tenantId", { tenantId })
          .getOne();
        const current = inventory || inventoryRepository.create({ tenantId, warehouseId: input.warehouseId, variantId: line.variantId, onHand: 0, reserved: 0, version: 0 });
        const nextOnHand = Number(current.onHand || 0) + line.quantityDelta;
        if (nextOnHand < Number(current.reserved || 0)) throw new BadRequestError(`Adjustment would make available inventory negative for variant: ${line.variantId}`);
        current.onHand = nextOnHand;
        current.version = Number(current.version || 0) + 1;
        inventories.push(await inventoryRepository.save(current));
        ledgers.push(await ledgerRepository.save(ledgerRepository.create({
          tenantId,
          warehouseId: input.warehouseId,
          variantId: line.variantId,
          movementType: "ADJUSTMENT",
          quantity: line.quantityDelta,
          unitCost: line.unitCost ?? variant.costPrice,
          referenceType: "STOCK_ADJUSTMENT",
          referenceId: adjustment.id,
          occurredAt: new Date(),
          createdBy: userId,
          metadata: { code, reason: input.reason || null },
        })));
      }
      return ApiResponseHandler.createSuccess("Inventory adjusted", { adjustment, inventories, ledgers });
    });
  }

  async transferInventory(input: RetailInventoryTransferDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      if (input.fromWarehouseId === input.toWarehouseId) throw new BadRequestError("Source and destination warehouses must be different");
      const warehouseRepository = manager.getRepository(RetailWarehouse);
      const sourceWarehouse = await warehouseRepository.createQueryBuilder("warehouse").where("warehouse.id = :id", { id: input.fromWarehouseId }).andWhere("warehouse.tenant_id = :tenantId", { tenantId }).getOne();
      const destinationWarehouse = await warehouseRepository.createQueryBuilder("warehouse").where("warehouse.id = :id", { id: input.toWarehouseId }).andWhere("warehouse.tenant_id = :tenantId", { tenantId }).getOne();
      if (!sourceWarehouse) throw new BadRequestError(`Warehouse not found: ${input.fromWarehouseId}`);
      if (!destinationWarehouse) throw new BadRequestError(`Warehouse not found: ${input.toWarehouseId}`);
      if (sourceWarehouse.status !== "ACTIVE" || destinationWarehouse.status !== "ACTIVE") throw new BadRequestError("Both warehouses must be active");

      const variantRepository = manager.getRepository(RetailProductVariant);
      const inventoryRepository = manager.getRepository(RetailInventory);
      const ledgerRepository = manager.getRepository(RetailStockLedger);
      const transferRepository = manager.getRepository(RetailStockTransfers);
      const itemRepository = manager.getRepository(RetailStockTransferItems);
      const variantIds = new Set<string>();
      const code = input.code || `TRF${Date.now().toString().slice(-10)}`;
      const transfer = await transferRepository.save(transferRepository.create({ tenantId, code, name: input.reason || "Chuyển kho", status: "COMPLETED", data: { fromWarehouseId: input.fromWarehouseId, toWarehouseId: input.toWarehouseId, reason: input.reason || null, items: input.items, createdBy: userId } }));
      const items = [];
      const inventories: RetailInventory[] = [];
      const ledgers: RetailStockLedger[] = [];

      for (const line of input.items) {
        if (variantIds.has(line.variantId)) throw new BadRequestError(`Duplicate product variant in transfer: ${line.variantId}`);
        variantIds.add(line.variantId);
        const variant = await variantRepository.createQueryBuilder("variant").where("variant.id = :id", { id: line.variantId }).andWhere("variant.tenant_id = :tenantId", { tenantId }).getOne();
        if (!variant) throw new BadRequestError(`Product variant not found: ${line.variantId}`);
        if (variant.status !== "ACTIVE") throw new BadRequestError(`Product variant is not active: ${line.variantId}`);
        const sourceInventory = await inventoryRepository.createQueryBuilder("inventory").setLock("pessimistic_write").where("inventory.warehouse_id = :warehouseId", { warehouseId: input.fromWarehouseId }).andWhere("inventory.variant_id = :variantId", { variantId: line.variantId }).andWhere("inventory.tenant_id = :tenantId", { tenantId }).getOne();
        if (!sourceInventory) throw new BadRequestError(`Source inventory not found for variant: ${line.variantId}`);
        if (Number(sourceInventory.onHand) - Number(sourceInventory.reserved) < line.quantity) throw new BadRequestError(`Insufficient inventory for variant: ${line.variantId}`);
        sourceInventory.onHand = Number(sourceInventory.onHand) - line.quantity;
        sourceInventory.version = Number(sourceInventory.version || 0) + 1;
        const destinationInventory = await inventoryRepository.createQueryBuilder("inventory").setLock("pessimistic_write").where("inventory.warehouse_id = :warehouseId", { warehouseId: input.toWarehouseId }).andWhere("inventory.variant_id = :variantId", { variantId: line.variantId }).andWhere("inventory.tenant_id = :tenantId", { tenantId }).getOne() || inventoryRepository.create({ tenantId, warehouseId: input.toWarehouseId, variantId: line.variantId, onHand: 0, reserved: 0, version: 0 });
        destinationInventory.onHand = Number(destinationInventory.onHand || 0) + line.quantity;
        destinationInventory.version = Number(destinationInventory.version || 0) + 1;
        inventories.push(await inventoryRepository.save(sourceInventory), await inventoryRepository.save(destinationInventory));
        items.push(await itemRepository.save(itemRepository.create({ tenantId, code: `${code}-${items.length + 1}`, name: variant.sku, status: "COMPLETED", referenceId: transfer.id, quantity: line.quantity, data: { transferId: transfer.id, variantId: line.variantId, fromWarehouseId: input.fromWarehouseId, toWarehouseId: input.toWarehouseId, unitCost: line.unitCost ?? variant.costPrice } })));
        ledgers.push(await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: input.fromWarehouseId, variantId: line.variantId, movementType: "TRANSFER_OUT", quantity: -line.quantity, unitCost: line.unitCost ?? variant.costPrice, referenceType: "STOCK_TRANSFER", referenceId: transfer.id, occurredAt: new Date(), createdBy: userId, metadata: { code, toWarehouseId: input.toWarehouseId } })), await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: input.toWarehouseId, variantId: line.variantId, movementType: "TRANSFER_IN", quantity: line.quantity, unitCost: line.unitCost ?? variant.costPrice, referenceType: "STOCK_TRANSFER", referenceId: transfer.id, occurredAt: new Date(), createdBy: userId, metadata: { code, fromWarehouseId: input.fromWarehouseId } })));
      }
      return ApiResponseHandler.createSuccess("Inventory transferred", { transfer, items, inventories, ledgers });
    });
  }

  async createPurchaseOrder(input: RetailPurchaseOrderCreateDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const warehouse = await manager.getRepository(RetailWarehouse).createQueryBuilder("warehouse").where("warehouse.id = :id", { id: input.warehouseId }).andWhere("warehouse.tenant_id = :tenantId", { tenantId }).getOne();
      if (!warehouse || warehouse.status !== "ACTIVE") throw new BadRequestError(`Warehouse not found or inactive: ${input.warehouseId}`);
      if (input.supplierId) {
        const supplier = await manager.getRepository(RetailSuppliers).createQueryBuilder("supplier").where("supplier.id = :id", { id: input.supplierId }).andWhere("supplier.tenant_id = :tenantId", { tenantId }).getOne();
        if (!supplier || supplier.status !== "ACTIVE") throw new BadRequestError(`Supplier not found or inactive: ${input.supplierId}`);
      }
      const variantRepository = manager.getRepository(RetailProductVariant);
      const purchaseOrderRepository = manager.getRepository(RetailPurchaseOrders);
      const itemRepository = manager.getRepository(RetailPurchaseOrderItems);
      const variantIds = new Set<string>();
      const code = input.code || `PO${Date.now().toString().slice(-10)}`;
      const purchaseOrder = await purchaseOrderRepository.save(purchaseOrderRepository.create({ tenantId, code, name: input.reason || `Đơn mua hàng ${code}`, status: "OPEN", data: { warehouseId: input.warehouseId, supplierId: input.supplierId || null, reason: input.reason || null, createdBy: userId } }));
      const items = [];
      let totalAmount = 0;
      let totalQuantity = 0;
      for (const line of input.items) {
        if (variantIds.has(line.variantId)) throw new BadRequestError(`Duplicate product variant in purchase order: ${line.variantId}`);
        variantIds.add(line.variantId);
        const variant = await variantRepository.createQueryBuilder("variant").where("variant.id = :id", { id: line.variantId }).andWhere("variant.tenant_id = :tenantId", { tenantId }).getOne();
        if (!variant || variant.status !== "ACTIVE") throw new BadRequestError(`Product variant not found or inactive: ${line.variantId}`);
        const unitCost = line.unitCost ?? Number(variant.costPrice || 0);
        totalQuantity += line.quantity;
        totalAmount += line.quantity * unitCost;
        items.push(await itemRepository.save(itemRepository.create({ tenantId, code: `${code}-${items.length + 1}`, name: variant.sku, status: "OPEN", referenceId: purchaseOrder.id, amount: line.quantity * unitCost, quantity: line.quantity, data: { purchaseOrderId: purchaseOrder.id, variantId: line.variantId, warehouseId: input.warehouseId, supplierId: input.supplierId || null, orderedQuantity: line.quantity, receivedQuantity: 0, unitCost } })));
      }
      purchaseOrder.amount = totalAmount;
      purchaseOrder.quantity = totalQuantity;
      purchaseOrder.data = { ...(purchaseOrder.data || {}), totalAmount, totalQuantity };
      await purchaseOrderRepository.save(purchaseOrder);
      return ApiResponseHandler.createSuccess("Purchase order created", { purchaseOrder, items, warehouse, supplierId: input.supplierId || null });
    });
  }

  async receiveGoods(input: RetailGoodsReceiptDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const warehouse = await manager.getRepository(RetailWarehouse).createQueryBuilder("warehouse").where("warehouse.id = :id", { id: input.warehouseId }).andWhere("warehouse.tenant_id = :tenantId", { tenantId }).getOne();
      if (!warehouse) throw new BadRequestError(`Warehouse not found: ${input.warehouseId}`);
      if (warehouse.status !== "ACTIVE") throw new BadRequestError(`Warehouse is not active: ${input.warehouseId}`);
      if (input.supplierId) {
        const supplier = await manager.getRepository(RetailSuppliers).createQueryBuilder("supplier").where("supplier.id = :id", { id: input.supplierId }).andWhere("supplier.tenant_id = :tenantId", { tenantId }).getOne();
        if (!supplier || supplier.status !== "ACTIVE") throw new BadRequestError(`Supplier not found or inactive: ${input.supplierId}`);
      }
      let purchaseOrder: RetailPurchaseOrders | null = null;
      let purchaseOrderItems: RetailPurchaseOrderItems[] = [];
      if (input.purchaseOrderId) {
        purchaseOrder = await manager.getRepository(RetailPurchaseOrders).createQueryBuilder("purchaseOrder").setLock("pessimistic_write").where("purchaseOrder.id = :id", { id: input.purchaseOrderId }).andWhere("purchaseOrder.tenant_id = :tenantId", { tenantId }).getOne();
        if (!purchaseOrder) throw new BadRequestError(`Purchase order not found: ${input.purchaseOrderId}`);
        if (["CANCELLED", "RECEIVED"].includes(purchaseOrder.status)) throw new BadRequestError(`Purchase order cannot receive goods in status ${purchaseOrder.status}`);
        const purchaseOrderData = purchaseOrder.data || {};
        if (String(purchaseOrderData.warehouseId || "") !== input.warehouseId) throw new BadRequestError("Receipt warehouse must match the purchase order warehouse");
        if (input.supplierId && purchaseOrderData.supplierId && String(purchaseOrderData.supplierId) !== input.supplierId) throw new BadRequestError("Receipt supplier must match the purchase order supplier");
        purchaseOrderItems = await manager.getRepository(RetailPurchaseOrderItems).createQueryBuilder("purchase_item").where("purchase_item.reference_id = :purchaseOrderId", { purchaseOrderId: purchaseOrder.id }).andWhere("purchase_item.tenant_id = :tenantId", { tenantId }).getMany();
        if (!purchaseOrderItems.length) throw new BadRequestError(`Purchase order has no items: ${purchaseOrder.id}`);
      }
      const resolvedSupplierId = input.supplierId || (purchaseOrder?.data?.supplierId ? String(purchaseOrder.data.supplierId) : undefined);
      if (resolvedSupplierId && !input.supplierId) {
        const supplier = await manager.getRepository(RetailSuppliers).createQueryBuilder("supplier").where("supplier.id = :id", { id: resolvedSupplierId }).andWhere("supplier.tenant_id = :tenantId", { tenantId }).getOne();
        if (!supplier || supplier.status !== "ACTIVE") throw new BadRequestError(`Supplier not found or inactive: ${resolvedSupplierId}`);
      }
      const variantRepository = manager.getRepository(RetailProductVariant);
      const inventoryRepository = manager.getRepository(RetailInventory);
      const ledgerRepository = manager.getRepository(RetailStockLedger);
      const receiptRepository = manager.getRepository(RetailGoodsReceipts);
      const itemRepository = manager.getRepository(RetailGoodsReceiptItems);
      const purchaseOrderItemRepository = manager.getRepository(RetailPurchaseOrderItems);
      const variantIds = new Set<string>();
      const code = input.code || `GRN${Date.now().toString().slice(-10)}`;
      const receipt = await receiptRepository.save(receiptRepository.create({ tenantId, code, name: input.reason || "Nhập hàng", status: "COMPLETED", data: { warehouseId: input.warehouseId, supplierId: resolvedSupplierId || null, purchaseOrderId: input.purchaseOrderId || null, reason: input.reason || null, items: input.items, createdBy: userId } }));
      const items = [];
      const inventories: RetailInventory[] = [];
      const ledgers: RetailStockLedger[] = [];
      let totalAmount = 0;
      let totalQuantity = 0;
      for (const line of input.items) {
        if (variantIds.has(line.variantId)) throw new BadRequestError(`Duplicate product variant in receipt: ${line.variantId}`);
        variantIds.add(line.variantId);
        const variant = await variantRepository.createQueryBuilder("variant").where("variant.id = :id", { id: line.variantId }).andWhere("variant.tenant_id = :tenantId", { tenantId }).getOne();
        if (!variant) throw new BadRequestError(`Product variant not found: ${line.variantId}`);
        if (variant.status !== "ACTIVE") throw new BadRequestError(`Product variant is not active: ${line.variantId}`);
        const purchaseItem = purchaseOrderItems.find((candidate) => String((candidate.data || {}).variantId || "") === line.variantId);
        if (purchaseOrder && !purchaseItem) throw new BadRequestError(`Variant is not included in purchase order: ${line.variantId}`);
        if (purchaseItem) {
          const purchaseData = purchaseItem.data || {};
          const orderedQuantity = Number(purchaseData.orderedQuantity ?? purchaseItem.quantity ?? 0);
          const receivedQuantity = Number(purchaseData.receivedQuantity || 0);
          if (receivedQuantity + line.quantity > orderedQuantity) throw new BadRequestError(`Receipt quantity exceeds purchase order quantity for variant: ${line.variantId}`);
          purchaseItem.data = { ...purchaseData, receivedQuantity: receivedQuantity + line.quantity, lastReceiptId: receipt.id };
          purchaseItem.status = receivedQuantity + line.quantity >= orderedQuantity ? "RECEIVED" : "PARTIALLY_RECEIVED";
          await purchaseOrderItemRepository.save(purchaseItem);
        }
        const inventory = await inventoryRepository.createQueryBuilder("inventory").setLock("pessimistic_write").where("inventory.warehouse_id = :warehouseId", { warehouseId: input.warehouseId }).andWhere("inventory.variant_id = :variantId", { variantId: line.variantId }).andWhere("inventory.tenant_id = :tenantId", { tenantId }).getOne() || inventoryRepository.create({ tenantId, warehouseId: input.warehouseId, variantId: line.variantId, onHand: 0, reserved: 0, version: 0 });
        inventory.onHand = Number(inventory.onHand || 0) + line.quantity;
        inventory.version = Number(inventory.version || 0) + 1;
        inventories.push(await inventoryRepository.save(inventory));
        const unitCost = line.unitCost ?? Number(variant.costPrice || 0);
        totalAmount += line.quantity * unitCost;
        totalQuantity += line.quantity;
        items.push(await itemRepository.save(itemRepository.create({ tenantId, code: `${code}-${items.length + 1}`, name: variant.sku, status: "COMPLETED", referenceId: receipt.id, amount: line.quantity * unitCost, quantity: line.quantity, data: { receiptId: receipt.id, variantId: line.variantId, warehouseId: input.warehouseId, unitCost } })));
        ledgers.push(await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: input.warehouseId, variantId: line.variantId, movementType: "PURCHASE_RECEIPT", quantity: line.quantity, unitCost, referenceType: "GOODS_RECEIPT", referenceId: receipt.id, occurredAt: new Date(), createdBy: userId, metadata: { code, supplierId: resolvedSupplierId || null, purchaseOrderId: input.purchaseOrderId || null } })));
      }
      receipt.amount = totalAmount;
      receipt.quantity = totalQuantity;
      await receiptRepository.save(receipt);
      if (purchaseOrder) {
        const completed = purchaseOrderItems.every((item) => {
          const data = item.data || {};
          return Number(data.receivedQuantity || 0) >= Number(data.orderedQuantity ?? item.quantity ?? 0);
        });
        purchaseOrder.status = completed ? "RECEIVED" : "PARTIALLY_RECEIVED";
        purchaseOrder.data = { ...(purchaseOrder.data || {}), lastReceiptId: receipt.id, receivedQuantity: purchaseOrderItems.reduce((sum, item) => sum + Number((item.data || {}).receivedQuantity || 0), 0), receivedAmount: purchaseOrderItems.reduce((sum, item) => sum + Number((item.data || {}).receivedQuantity || 0) * Number((item.data || {}).unitCost || 0), 0) };
        await manager.getRepository(RetailPurchaseOrders).save(purchaseOrder);
      }
      let supplierDebt: RetailSupplierDebts | null = null;
      if (resolvedSupplierId && totalAmount > 0) {
        const debtRepository = manager.getRepository(RetailSupplierDebts);
        supplierDebt = await debtRepository.save(debtRepository.create({ tenantId, code: `SUP-${code}`, name: `Công nợ nhập hàng ${code}`, status: "ACTIVE", referenceId: receipt.id, amount: totalAmount, data: { supplierId: resolvedSupplierId, goodsReceiptId: receipt.id, balance: totalAmount, createdBy: userId } }));
        await manager.getRepository(RetailSupplierDebtTransactions).save(manager.getRepository(RetailSupplierDebtTransactions).create({ tenantId, code: `SUP-TXN-${code}`, name: `Ghi nhận công nợ nhập hàng ${code}`, status: "COMPLETED", referenceId: supplierDebt.id, amount: totalAmount, data: { supplierDebtId: supplierDebt.id, supplierId: resolvedSupplierId, goodsReceiptId: receipt.id, direction: "PURCHASE" } }));
      }
      return ApiResponseHandler.createSuccess("Goods received", { receipt, items, inventories, ledgers, supplierDebt });
    });
  }

  async returnGoods(input: RetailPurchaseReturnDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const warehouse = await manager.getRepository(RetailWarehouse).createQueryBuilder("warehouse").where("warehouse.id = :id", { id: input.warehouseId }).andWhere("warehouse.tenant_id = :tenantId", { tenantId }).getOne();
      if (!warehouse || warehouse.status !== "ACTIVE") throw new BadRequestError(`Warehouse not found or inactive: ${input.warehouseId}`);
      const receipt = await manager.getRepository(RetailGoodsReceipts).createQueryBuilder("receipt").setLock("pessimistic_write").where("receipt.id = :id", { id: input.goodsReceiptId }).andWhere("receipt.tenant_id = :tenantId", { tenantId }).getOne();
      if (!receipt || receipt.status !== "COMPLETED") throw new BadRequestError(`Completed goods receipt not found: ${input.goodsReceiptId}`);
      const receiptData = receipt.data || {};
      if (String(receiptData.warehouseId || "") !== input.warehouseId) throw new BadRequestError("Return warehouse must match the original goods receipt");
      const receiptSupplierId = receiptData.supplierId ? String(receiptData.supplierId) : undefined;
      if (input.supplierId && receiptSupplierId && input.supplierId !== receiptSupplierId) throw new BadRequestError("Supplier does not match the original goods receipt");
      const supplierId = input.supplierId || receiptSupplierId;
      if (supplierId) {
        const supplier = await manager.getRepository(RetailSuppliers).createQueryBuilder("supplier").where("supplier.id = :id", { id: supplierId }).andWhere("supplier.tenant_id = :tenantId", { tenantId }).getOne();
        if (!supplier || supplier.status !== "ACTIVE") throw new BadRequestError(`Supplier not found or inactive: ${supplierId}`);
      }
      const receiptItems = await manager.getRepository(RetailGoodsReceiptItems).createQueryBuilder("item").where("item.reference_id = :receiptId", { receiptId: receipt.id }).andWhere("item.tenant_id = :tenantId", { tenantId }).getMany();
      const itemById = new Map(receiptItems.map((item) => [item.id, item]));
      const returnItemRepository = manager.getRepository(RetailPurchaseReturnItems);
      const requestedIds = new Set<string>();
      const lines: Array<{ source: RetailGoodsReceiptItems; quantity: number; unitCost: number; variantId: string }> = [];
      for (const line of input.items) {
        if (requestedIds.has(line.goodsReceiptItemId)) throw new BadRequestError(`Duplicate goods receipt item in return: ${line.goodsReceiptItemId}`);
        requestedIds.add(line.goodsReceiptItemId);
        const source = itemById.get(line.goodsReceiptItemId);
        if (!source) throw new BadRequestError(`Goods receipt item not found: ${line.goodsReceiptItemId}`);
        const sourceData = source.data || {};
        const variantId = String(sourceData.variantId || "");
        if (!variantId) throw new BadRequestError(`Goods receipt item has no product variant: ${source.id}`);
        const previous = await returnItemRepository.createQueryBuilder("returnItem").where("returnItem.tenant_id = :tenantId", { tenantId }).andWhere("returnItem.data ->> 'goodsReceiptItemId' = :goodsReceiptItemId", { goodsReceiptItemId: source.id }).getMany();
        const returned = previous.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        if (returned + line.quantity > Number(source.quantity || 0)) throw new BadRequestError(`Return quantity exceeds received quantity for item: ${source.id}`);
        lines.push({ source, quantity: line.quantity, unitCost: line.unitCost ?? Number(sourceData.unitCost || 0), variantId });
      }
      const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
      const totalAmount = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
      const code = input.code || `PRT${Date.now().toString().slice(-10)}`;
      const returnRepository = manager.getRepository(RetailPurchaseReturns);
      const purchaseReturn = await returnRepository.save(returnRepository.create({ tenantId, code, name: input.reason || `Trả hàng nhà cung cấp ${receipt.code}`, status: "COMPLETED", referenceId: receipt.id, amount: totalAmount, quantity: totalQuantity, data: { warehouseId: input.warehouseId, goodsReceiptId: receipt.id, supplierId: supplierId || null, reason: input.reason || null, createdBy: userId } }));
      const inventoryRepository = manager.getRepository(RetailInventory);
      const ledgerRepository = manager.getRepository(RetailStockLedger);
      const returnedItems = [];
      const ledgers = [];
      for (const line of lines) {
        const inventory = await inventoryRepository.createQueryBuilder("inventory").setLock("pessimistic_write").where("inventory.warehouse_id = :warehouseId", { warehouseId: input.warehouseId }).andWhere("inventory.variant_id = :variantId", { variantId: line.variantId }).andWhere("inventory.tenant_id = :tenantId", { tenantId }).getOne();
        if (!inventory) throw new BadRequestError(`Inventory not found while returning variant: ${line.variantId}`);
        if (Number(inventory.onHand) - Number(inventory.reserved) < line.quantity) throw new BadRequestError(`Insufficient inventory for returned variant: ${line.variantId}`);
        inventory.onHand = Number(inventory.onHand) - line.quantity;
        inventory.version = Number(inventory.version || 0) + 1;
        await inventoryRepository.save(inventory);
        returnedItems.push(await returnItemRepository.save(returnItemRepository.create({ tenantId, code: `${code}-${returnedItems.length + 1}`, name: line.variantId, status: "COMPLETED", referenceId: purchaseReturn.id, amount: line.quantity * line.unitCost, quantity: line.quantity, data: { purchaseReturnId: purchaseReturn.id, goodsReceiptId: receipt.id, goodsReceiptItemId: line.source.id, variantId: line.variantId, warehouseId: input.warehouseId, unitCost: line.unitCost } })));
        ledgers.push(await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: input.warehouseId, variantId: line.variantId, movementType: "PURCHASE_RETURN", quantity: -line.quantity, unitCost: line.unitCost, referenceType: "PURCHASE_RETURN", referenceId: purchaseReturn.id, occurredAt: new Date(), createdBy: userId, metadata: { code, goodsReceiptId: receipt.id, supplierId: supplierId || null, reason: input.reason || null } })));
      }
      let supplierDebt: RetailSupplierDebts | null = null;
      if (supplierId && totalAmount > 0) {
        supplierDebt = await manager.getRepository(RetailSupplierDebts).createQueryBuilder("debt").setLock("pessimistic_write").where("debt.reference_id = :receiptId", { receiptId: receipt.id }).andWhere("debt.tenant_id = :tenantId", { tenantId }).getOne();
        if (supplierDebt) {
          const balance = Math.max(0, Number((supplierDebt.data || {}).balance || supplierDebt.amount || 0) - totalAmount);
          supplierDebt.amount = balance;
          supplierDebt.status = balance === 0 ? "SETTLED" : "ACTIVE";
          supplierDebt.data = { ...(supplierDebt.data || {}), balance, lastReturnId: purchaseReturn.id };
          await manager.getRepository(RetailSupplierDebts).save(supplierDebt);
          await manager.getRepository(RetailSupplierDebtTransactions).save(manager.getRepository(RetailSupplierDebtTransactions).create({ tenantId, code: `SUP-RET-${code}`, name: `Giảm công nợ do trả hàng ${receipt.code}`, status: "COMPLETED", referenceId: supplierDebt.id, amount: totalAmount, data: { supplierDebtId: supplierDebt.id, supplierId, goodsReceiptId: receipt.id, purchaseReturnId: purchaseReturn.id, direction: "RETURN" } }));
        }
      }
      return ApiResponseHandler.createSuccess("Goods returned", { purchaseReturn, items: returnedItems, ledgers, supplierDebt });
    });
  }

  async cancelOrder(orderId: string, input: RetailOrderCancelDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const orderRepository = manager.getRepository(RetailOrder);
      const order = await orderRepository.createQueryBuilder("order").setLock("pessimistic_write").where("order.id = :id", { id: orderId }).andWhere("order.tenant_id = :tenantId", { tenantId }).getOne();
      if (!order) throw new BadRequestError(`Order not found: ${orderId}`);
      if (["CANCELLED", "RETURNED"].includes(order.status)) throw new BadRequestError(`Order cannot be cancelled in status ${order.status}: ${order.orderCode}`);
      if (["SHIPPED", "DELIVERED"].includes(order.fulfillmentStatus)) throw new BadRequestError(`Shipped orders must use the return flow: ${order.orderCode}`);
      const orderItems = await manager.getRepository(RetailOrderItem).createQueryBuilder("item").where("item.order_id = :orderId", { orderId }).andWhere("item.tenant_id = :tenantId", { tenantId }).getMany();
      const inventoryRepository = manager.getRepository(RetailInventory);
      const ledgerRepository = manager.getRepository(RetailStockLedger);
      const ledgers: RetailStockLedger[] = [];
      if (order.warehouseId && order.status !== "DRAFT") {
        for (const item of orderItems) {
          const inventory = await inventoryRepository.createQueryBuilder("inventory").setLock("pessimistic_write").where("inventory.warehouse_id = :warehouseId", { warehouseId: order.warehouseId }).andWhere("inventory.variant_id = :variantId", { variantId: item.variantId }).andWhere("inventory.tenant_id = :tenantId", { tenantId }).getOne();
          if (!inventory) throw new BadRequestError(`Inventory not found while cancelling variant: ${item.variantId}`);
          inventory.onHand = Number(inventory.onHand) + Number(item.quantity);
          inventory.version = Number(inventory.version || 0) + 1;
          await inventoryRepository.save(inventory);
          ledgers.push(await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: order.warehouseId, variantId: item.variantId, movementType: "SALE_REVERSAL", quantity: Number(item.quantity), unitCost: Number(item.costTotal || 0) / Number(item.quantity || 1), referenceType: "ORDER_CANCEL", referenceId: order.id, occurredAt: new Date(), createdBy: userId, metadata: { orderCode: order.orderCode, reason: input.reason || null } })));
        }
      }

      const paymentRepository = manager.getRepository(RetailPayment);
      const payments = await paymentRepository.createQueryBuilder("payment").setLock("pessimistic_write").where("payment.order_id = :orderId", { orderId }).andWhere("payment.tenant_id = :tenantId", { tenantId }).getMany();
      const paidPayments = payments.filter((payment) => payment.status === "PAID");
      for (const payment of paidPayments) {
        payment.status = "REFUNDED";
        await paymentRepository.save(payment);
      }
      const refundRepository = manager.getRepository(RetailRefunds);
      const refundItemRepository = manager.getRepository(RetailRefundItems);
      let refund: RetailRefunds | null = null;
      if (paidPayments.length) {
        const refundAmount = paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        refund = await refundRepository.save(refundRepository.create({ tenantId, code: `RF${Date.now().toString().slice(-10)}`, name: `Hoàn tiền ${order.orderCode}`, status: "COMPLETED", amount: refundAmount, referenceId: order.id, data: { orderId: order.id, orderCode: order.orderCode, reason: input.reason || null, createdBy: userId } }));
        for (const item of orderItems) await refundItemRepository.save(refundItemRepository.create({ tenantId, code: `${refund.code}-${item.id.slice(0, 8)}`, name: item.variantId, status: "COMPLETED", referenceId: refund.id, quantity: item.quantity, amount: item.lineTotal, data: { refundId: refund.id, orderId: order.id, itemId: item.id, variantId: item.variantId } }));
      }
      const debtRepository = manager.getRepository(RetailCustomerDebts);
      const debt = await debtRepository.createQueryBuilder("debt").setLock("pessimistic_write").where("debt.reference_id = :orderId", { orderId: order.id }).andWhere("debt.tenant_id = :tenantId", { tenantId }).getOne();
      if (debt) {
        debt.status = "CANCELLED";
        debt.data = { ...(debt.data || {}), cancelledAt: new Date().toISOString(), cancelledBy: userId, reason: input.reason || null, balance: 0 };
        await debtRepository.save(debt);
        await manager.getRepository(RetailCustomerDebtTransactions).save(manager.getRepository(RetailCustomerDebtTransactions).create({ tenantId, code: `DEBT-REV-${order.orderCode}`, name: `Hủy công nợ ${order.orderCode}`, status: "COMPLETED", referenceId: debt.id, amount: Number(order.debtTotal || 0), data: { debtId: debt.id, customerId: order.customerId, orderId: order.id, direction: "REVERSAL", reason: input.reason || null } }));
      }

      const previousStatus = order.status;
      order.status = "CANCELLED";
      order.fulfillmentStatus = "CANCELLED";
      order.paymentStatus = paidPayments.length ? "REFUNDED" : "CANCELLED";
      order.paidTotal = 0;
      order.debtTotal = 0;
      await orderRepository.save(order);
      const invoice = await manager.getRepository(RetailInvoices).createQueryBuilder("invoice").setLock("pessimistic_write").where("invoice.reference_id = :orderId", { orderId: order.id }).andWhere("invoice.tenant_id = :tenantId", { tenantId }).getOne();
      if (invoice) {
        invoice.status = "CANCELLED";
        invoice.data = { ...(invoice.data || {}), cancelledAt: new Date().toISOString(), reason: input.reason || null };
        await manager.getRepository(RetailInvoices).save(invoice);
      }
      const fulfillment = await manager.getRepository(RetailFulfillments).createQueryBuilder("fulfillment").setLock("pessimistic_write").where("fulfillment.reference_id = :orderId", { orderId: order.id }).andWhere("fulfillment.tenant_id = :tenantId", { tenantId }).getOne();
      if (fulfillment) {
        fulfillment.status = "CANCELLED";
        fulfillment.data = { ...(fulfillment.data || {}), cancelledAt: new Date().toISOString(), reason: input.reason || null };
        await manager.getRepository(RetailFulfillments).save(fulfillment);
      }
      const history = await manager.getRepository(RetailOrderStatusHistory).save(manager.getRepository(RetailOrderStatusHistory).create({ tenantId, code: `HIS${Date.now().toString().slice(-10)}`, name: `Hủy đơn ${order.orderCode}`, status: "COMPLETED", referenceId: order.id, data: { orderId: order.id, from: previousStatus, to: "CANCELLED", reason: input.reason || null, createdBy: userId } }));
      if (order.customerId && previousStatus === "COMPLETED") {
        const customerRepository = manager.getRepository(RetailCustomer);
        const customer = await customerRepository.createQueryBuilder("customer").setLock("pessimistic_write").where("customer.id = :id", { id: order.customerId }).andWhere("customer.tenant_id = :tenantId", { tenantId }).getOne();
        if (customer) {
          customer.totalSpent = Math.max(0, Number(customer.totalSpent || 0) - Number(order.grandTotal || 0));
          customer.orderCount = Math.max(0, Number(customer.orderCount || 0) - 1);
          await customerRepository.save(customer);
        }
      }
      const loyaltyReversal = order.customerId && previousStatus === "COMPLETED" ? await this.reverseLoyalty(manager, order.customerId, order.id, Number(order.grandTotal || 0), tenantId, `LOY-REV-${order.orderCode}`, userId) : null;
      return ApiResponseHandler.updateSuccess("Order cancelled", { order, refund, invoice, fulfillment, history, ledgers, loyaltyReversal });
    });
  }

  async shipOrder(orderId: string, input: RetailOrderShipDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const orderRepository = manager.getRepository(RetailOrder);
      const order = await orderRepository.createQueryBuilder("order").setLock("pessimistic_write").where("order.id = :id", { id: orderId }).andWhere("order.tenant_id = :tenantId", { tenantId }).getOne();
      if (!order) throw new BadRequestError(`Order not found: ${orderId}`);
      if (["CANCELLED", "RETURNED"].includes(order.status)) throw new BadRequestError(`Order cannot be shipped in status ${order.status}`);
      if (order.status !== "COMPLETED") throw new BadRequestError(`Only completed orders can be shipped: ${order.orderCode}`);
      if (["SHIPPED", "DELIVERED"].includes(order.fulfillmentStatus)) throw new BadRequestError(`Order has already been shipped: ${order.orderCode}`);
      let provider: RetailShippingProviders | null = null;
      if (input.shippingProviderId) {
        provider = await manager.getRepository(RetailShippingProviders).createQueryBuilder("provider").where("provider.id = :id", { id: input.shippingProviderId }).andWhere("provider.tenant_id = :tenantId", { tenantId }).getOne();
        if (!provider || provider.status !== "ACTIVE") throw new BadRequestError(`Shipping provider not found or inactive: ${input.shippingProviderId}`);
      }
      const orderItems = await manager.getRepository(RetailOrderItem).createQueryBuilder("item").where("item.order_id = :orderId", { orderId }).andWhere("item.tenant_id = :tenantId", { tenantId }).getMany();
      if (!orderItems.length) throw new BadRequestError(`Order has no items: ${order.orderCode}`);
      const code = input.code || `SHP${Date.now().toString().slice(-10)}`;
      const shippingOrder = await manager.getRepository(RetailShippingOrders).save(manager.getRepository(RetailShippingOrders).create({ tenantId, code: `SO-${code}`, name: `Vận chuyển ${order.orderCode}`, status: "SHIPPED", referenceId: order.id, quantity: orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0), data: { orderId: order.id, orderCode: order.orderCode, shippingProviderId: provider?.id || null, trackingCode: input.trackingCode || null, recipientName: input.recipientName || null, recipientPhone: input.recipientPhone || null, address: input.address || null, note: input.note || null, createdBy: userId, shippedAt: new Date().toISOString() } }));
      const shipment = await manager.getRepository(RetailShipments).save(manager.getRepository(RetailShipments).create({ tenantId, code, name: `Giao hàng ${order.orderCode}`, status: "SHIPPED", referenceId: order.id, quantity: shippingOrder.quantity, data: { orderId: order.id, shippingOrderId: shippingOrder.id, shippingProviderId: provider?.id || null, trackingCode: input.trackingCode || null, shippedAt: new Date().toISOString() } }));
      const shipmentItems = [];
      for (const item of orderItems) {
        shipmentItems.push(await manager.getRepository(RetailShipmentItems).save(manager.getRepository(RetailShipmentItems).create({ tenantId, code: `${code}-${shipmentItems.length + 1}`, name: item.variantId, status: "SHIPPED", referenceId: shipment.id, quantity: item.quantity, data: { shipmentId: shipment.id, shippingOrderId: shippingOrder.id, orderId: order.id, orderItemId: item.id, variantId: item.variantId } })));
      }
      const fulfillment = await manager.getRepository(RetailFulfillments).createQueryBuilder("fulfillment").setLock("pessimistic_write").where("fulfillment.reference_id = :orderId", { orderId }).andWhere("fulfillment.tenant_id = :tenantId", { tenantId }).getOne();
      if (fulfillment) {
        fulfillment.status = "SHIPPED";
        fulfillment.data = { ...(fulfillment.data || {}), shipmentId: shipment.id, shippingOrderId: shippingOrder.id, shippedAt: new Date().toISOString() };
        await manager.getRepository(RetailFulfillments).save(fulfillment);
      }
      const previousFulfillmentStatus = order.fulfillmentStatus;
      order.fulfillmentStatus = "SHIPPED";
      await orderRepository.save(order);
      const history = await manager.getRepository(RetailOrderStatusHistory).save(manager.getRepository(RetailOrderStatusHistory).create({ tenantId, code: `HIS-${code}`, name: `Giao hàng ${order.orderCode}`, status: "COMPLETED", referenceId: order.id, data: { orderId: order.id, from: previousFulfillmentStatus, to: "SHIPPED", shipmentId: shipment.id, shippingOrderId: shippingOrder.id, trackingCode: input.trackingCode || null, createdBy: userId } }));
      return ApiResponseHandler.createSuccess("Order shipped", { order, shippingOrder, shipment, shipmentItems, fulfillment, history, provider });
    });
  }

  async deliverOrder(orderId: string, input: RetailOrderDeliverDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const orderRepository = manager.getRepository(RetailOrder);
      const order = await orderRepository.createQueryBuilder("order").setLock("pessimistic_write").where("order.id = :id", { id: orderId }).andWhere("order.tenant_id = :tenantId", { tenantId }).getOne();
      if (!order) throw new BadRequestError(`Order not found: ${orderId}`);
      if (["CANCELLED", "RETURNED"].includes(order.status)) throw new BadRequestError(`Order cannot be delivered in status ${order.status}`);
      if (order.status !== "COMPLETED") throw new BadRequestError(`Only completed orders can be delivered: ${order.orderCode}`);
      if (order.fulfillmentStatus !== "SHIPPED") throw new BadRequestError(`Order must be SHIPPED before delivery: ${order.orderCode}`);
      const shipmentRepository = manager.getRepository(RetailShipments);
      const shipment = await shipmentRepository.createQueryBuilder("shipment").setLock("pessimistic_write").where("shipment.reference_id = :orderId", { orderId }).andWhere("shipment.tenant_id = :tenantId", { tenantId }).getOne();
      if (!shipment) throw new BadRequestError(`Shipment not found for order: ${order.orderCode}`);
      const shippingOrderRepository = manager.getRepository(RetailShippingOrders);
      const shippingOrder = await shippingOrderRepository.createQueryBuilder("shipping_order").setLock("pessimistic_write").where("shipping_order.reference_id = :orderId", { orderId }).andWhere("shipping_order.tenant_id = :tenantId", { tenantId }).getOne();
      const deliveredAt = new Date().toISOString();
      shipment.status = "DELIVERED";
      shipment.data = { ...(shipment.data || {}), deliveredAt, deliveryNote: input.note || null };
      await shipmentRepository.save(shipment);
      if (shippingOrder) {
        shippingOrder.status = "DELIVERED";
        shippingOrder.data = { ...(shippingOrder.data || {}), deliveredAt, deliveryNote: input.note || null };
        await shippingOrderRepository.save(shippingOrder);
      }
      const shipmentItems = await manager.getRepository(RetailShipmentItems).createQueryBuilder("shipment_item").setLock("pessimistic_write").where("shipment_item.reference_id = :shipmentId", { shipmentId: shipment.id }).andWhere("shipment_item.tenant_id = :tenantId", { tenantId }).getMany();
      for (const item of shipmentItems) {
        item.status = "DELIVERED";
        item.data = { ...(item.data || {}), deliveredAt };
      }
      if (shipmentItems.length) await manager.getRepository(RetailShipmentItems).save(shipmentItems);
      const fulfillment = await manager.getRepository(RetailFulfillments).createQueryBuilder("fulfillment").setLock("pessimistic_write").where("fulfillment.reference_id = :orderId", { orderId }).andWhere("fulfillment.tenant_id = :tenantId", { tenantId }).getOne();
      if (fulfillment) {
        fulfillment.status = "DELIVERED";
        fulfillment.data = { ...(fulfillment.data || {}), deliveredAt, deliveryNote: input.note || null };
        await manager.getRepository(RetailFulfillments).save(fulfillment);
      }
      order.fulfillmentStatus = "DELIVERED";
      await orderRepository.save(order);
      const history = await manager.getRepository(RetailOrderStatusHistory).save(manager.getRepository(RetailOrderStatusHistory).create({ tenantId, code: `HIS-DEL-${shipment.code}`, name: `Đã giao ${order.orderCode}`, status: "COMPLETED", referenceId: order.id, data: { orderId: order.id, from: "SHIPPED", to: "DELIVERED", shipmentId: shipment.id, shippingOrderId: shippingOrder?.id || null, note: input.note || null, createdBy: userId, deliveredAt } }));
      return ApiResponseHandler.updateSuccess("Order delivered", { order, shippingOrder, shipment, shipmentItems, fulfillment, history });
    });
  }

  async exchangeOrder(orderId: string, input: RetailExchangeDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const orderRepository = manager.getRepository(RetailOrder);
      const order = await orderRepository.createQueryBuilder("order").setLock("pessimistic_write")
        .where("order.id = :id", { id: orderId }).andWhere("order.tenant_id = :tenantId", { tenantId }).getOne();
      if (!order) throw new BadRequestError(`Order not found: ${orderId}`);
      if (["CANCELLED", "RETURNED"].includes(order.status)) throw new BadRequestError(`Order cannot be exchanged in status ${order.status}`);
      if (!order.warehouseId) throw new BadRequestError("Exchange requires the original order to have a warehouse");

      const orderItems = await manager.getRepository(RetailOrderItem).createQueryBuilder("item")
        .where("item.order_id = :orderId", { orderId }).andWhere("item.tenant_id = :tenantId", { tenantId }).getMany();
      const itemById = new Map(orderItems.map((item) => [item.id, item]));
      const refundItemRepository = manager.getRepository(RetailRefundItems);
      const exchangeItemRepository = manager.getRepository(RetailExchangeItems);
      const returnLines: Array<{ item: RetailOrderItem; quantity: number; amount: number }> = [];
      const selectedReturnIds = new Set<string>();
      for (const line of input.items) {
        if (selectedReturnIds.has(line.orderItemId)) throw new BadRequestError(`Duplicate order item in exchange: ${line.orderItemId}`);
        selectedReturnIds.add(line.orderItemId);
        const item = itemById.get(line.orderItemId);
        if (!item) throw new BadRequestError(`Order item not found: ${line.orderItemId}`);
        const previousRefunds = await refundItemRepository.createQueryBuilder("refundItem")
          .where("refundItem.tenant_id = :tenantId", { tenantId }).andWhere("refundItem.data ->> 'orderItemId' = :orderItemId", { orderItemId: item.id }).getMany();
        const previousExchanges = await exchangeItemRepository.createQueryBuilder("exchangeItem")
          .where("exchangeItem.tenant_id = :tenantId", { tenantId })
          .andWhere("exchangeItem.data ->> 'orderItemId' = :orderItemId", { orderItemId: item.id })
          .andWhere("exchangeItem.data ->> 'type' = 'RETURN'", { orderItemId: item.id }).getMany();
        const alreadyReturned = previousRefunds.reduce((sum, row) => sum + Number(row.quantity || 0), 0) + previousExchanges.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
        if (alreadyReturned + line.quantity > Number(item.quantity)) throw new BadRequestError(`Exchange quantity exceeds remaining sold quantity for item: ${item.id}`);
        returnLines.push({ item, quantity: line.quantity, amount: Number(item.lineTotal || 0) * line.quantity / Number(item.quantity || 1) });
      }

      const variantRepository = manager.getRepository(RetailProductVariant);
      const replacementLines: Array<{ variant: RetailProductVariant; quantity: number; unitPrice: number; amount: number }> = [];
      const replacementVariantIds = new Set<string>();
      for (const line of input.replacementItems) {
        if (replacementVariantIds.has(line.variantId)) throw new BadRequestError(`Duplicate replacement variant: ${line.variantId}`);
        replacementVariantIds.add(line.variantId);
        const variant = await variantRepository.createQueryBuilder("variant")
          .where("variant.id = :id", { id: line.variantId }).andWhere("variant.tenant_id = :tenantId", { tenantId }).getOne();
        if (!variant || variant.status !== "ACTIVE") throw new BadRequestError(`Replacement variant not found or inactive: ${line.variantId}`);
        const unitPrice = line.unitPrice ?? Number(variant.salePrice || 0);
        replacementLines.push({ variant, quantity: line.quantity, unitPrice, amount: line.quantity * unitPrice });
      }

      const returnAmount = returnLines.reduce((sum, line) => sum + line.amount, 0);
      const replacementAmount = replacementLines.reduce((sum, line) => sum + line.amount, 0);
      if (returnAmount <= 0 || replacementAmount <= 0) throw new BadRequestError("Exchange must contain positive return and replacement values");
      const difference = replacementAmount - returnAmount;
      const code = input.code || `EX${Date.now().toString().slice(-10)}`;
      const exchangeOrderCode = `EX-${code}`.slice(0, 60);
      const exchange = await manager.getRepository(RetailExchanges).save(manager.getRepository(RetailExchanges).create({
        tenantId, code, name: input.reason || `Đổi hàng ${order.orderCode}`, status: "COMPLETED", referenceId: order.id,
        amount: difference, quantity: returnLines.reduce((sum, line) => sum + line.quantity, 0),
        data: { orderId: order.id, orderCode: order.orderCode, returnAmount, replacementAmount, difference, reason: input.reason || null, createdBy: userId },
      }));
      const salesReturn = await manager.getRepository(RetailReturns).save(manager.getRepository(RetailReturns).create({
        tenantId, code: `${code}-RET`.slice(0, 80), name: input.reason || `Hàng trả trong đổi hàng ${order.orderCode}`, status: "COMPLETED", referenceId: order.id,
        amount: returnAmount, quantity: returnLines.reduce((sum, line) => sum + line.quantity, 0),
        data: { orderId: order.id, orderCode: order.orderCode, exchangeId: exchange.id, type: "EXCHANGE_RETURN", reason: input.reason || null, createdBy: userId },
      }));
      exchange.data = { ...(exchange.data || {}), returnId: salesReturn.id };
      await manager.getRepository(RetailExchanges).save(exchange);

      const inventoryRepository = manager.getRepository(RetailInventory);
      const ledgerRepository = manager.getRepository(RetailStockLedger);
      const exchangeItems = [];
      const returnItems = [];
      const ledgers = [];
      for (const line of returnLines) {
        returnItems.push(await manager.getRepository(RetailReturnItems).save(manager.getRepository(RetailReturnItems).create({
          tenantId, code: `${code}-RET-${returnItems.length + 1}`.slice(0, 80), name: line.item.variantId, status: "COMPLETED", referenceId: salesReturn.id,
          quantity: line.quantity, amount: line.amount, data: { returnId: salesReturn.id, exchangeId: exchange.id, orderId: order.id, orderItemId: line.item.id, variantId: line.item.variantId, type: "EXCHANGE_RETURN", unitPrice: line.item.unitPrice },
        })));
        exchangeItems.push(await exchangeItemRepository.save(exchangeItemRepository.create({
          tenantId, code: `${code}-OUT-${exchangeItems.length + 1}`.slice(0, 80), name: line.item.variantId, status: "COMPLETED", referenceId: exchange.id,
          quantity: line.quantity, amount: -line.amount, data: { exchangeId: exchange.id, orderId: order.id, orderItemId: line.item.id, variantId: line.item.variantId, type: "RETURN", unitPrice: line.item.unitPrice },
        })));
        const inventory = await inventoryRepository.createQueryBuilder("inventory").setLock("pessimistic_write")
          .where("inventory.warehouse_id = :warehouseId", { warehouseId: order.warehouseId }).andWhere("inventory.variant_id = :variantId", { variantId: line.item.variantId }).andWhere("inventory.tenant_id = :tenantId", { tenantId }).getOne()
          || inventoryRepository.create({ tenantId, warehouseId: order.warehouseId, variantId: line.item.variantId, onHand: 0, reserved: 0, version: 0 });
        inventory.onHand = Number(inventory.onHand || 0) + line.quantity;
        inventory.version = Number(inventory.version || 0) + 1;
        await inventoryRepository.save(inventory);
        ledgers.push(await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: order.warehouseId, variantId: line.item.variantId, movementType: "EXCHANGE_RETURN", quantity: line.quantity, unitCost: Number(line.item.costTotal || 0) / Number(line.item.quantity || 1), referenceType: "EXCHANGE", referenceId: exchange.id, occurredAt: new Date(), createdBy: userId, metadata: { orderCode: order.orderCode, code } })));
      }
      for (const line of replacementLines) {
        const inventory = await inventoryRepository.createQueryBuilder("inventory").setLock("pessimistic_write")
          .where("inventory.warehouse_id = :warehouseId", { warehouseId: order.warehouseId }).andWhere("inventory.variant_id = :variantId", { variantId: line.variant.id }).andWhere("inventory.tenant_id = :tenantId", { tenantId }).getOne();
        if (!inventory || Number(inventory.onHand) - Number(inventory.reserved) < line.quantity) throw new BadRequestError(`Insufficient inventory for replacement variant: ${line.variant.id}`);
        inventory.onHand = Number(inventory.onHand) - line.quantity;
        inventory.version = Number(inventory.version || 0) + 1;
        await inventoryRepository.save(inventory);
        exchangeItems.push(await exchangeItemRepository.save(exchangeItemRepository.create({
          tenantId, code: `${code}-IN-${exchangeItems.length + 1}`.slice(0, 80), name: line.variant.sku, status: "COMPLETED", referenceId: exchange.id,
          quantity: line.quantity, amount: line.amount, data: { exchangeId: exchange.id, orderId: order.id, variantId: line.variant.id, type: "REPLACEMENT", unitPrice: line.unitPrice },
        })));
        ledgers.push(await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: order.warehouseId, variantId: line.variant.id, movementType: "EXCHANGE_SALE", quantity: -line.quantity, unitCost: line.variant.costPrice, referenceType: "EXCHANGE", referenceId: exchange.id, occurredAt: new Date(), createdBy: userId, metadata: { orderCode: order.orderCode, code } })));
      }

      const exchangeOrder = await orderRepository.save(orderRepository.create({
        tenantId, branchId: order.branchId, warehouseId: order.warehouseId, customerId: order.customerId, employeeId: order.employeeId,
        orderCode: exchangeOrderCode, channel: "EXCHANGE", status: "COMPLETED", paymentStatus: difference < 0 ? "REFUNDED" : difference === 0 ? "PAID" : "UNPAID",
        fulfillmentStatus: "FULFILLED", subtotal: replacementAmount, discountTotal: 0, taxTotal: 0, shippingTotal: 0, grandTotal: replacementAmount,
        paidTotal: 0, debtTotal: 0, orderedAt: new Date(),
      }));
      exchange.data = { ...(exchange.data || {}), exchangeOrderId: exchangeOrder.id };
      await manager.getRepository(RetailExchanges).save(exchange);
      const exchangeOrderItems = [];
      for (const line of replacementLines) {
        exchangeOrderItems.push(await manager.getRepository(RetailOrderItem).save(manager.getRepository(RetailOrderItem).create({ tenantId, orderId: exchangeOrder.id, variantId: line.variant.id, employeeId: order.employeeId, quantity: line.quantity, unitPrice: line.unitPrice, discountTotal: 0, taxTotal: 0, lineTotal: line.amount, costTotal: line.quantity * Number(line.variant.costPrice || 0) })));
      }
      const invoice = await manager.getRepository(RetailInvoices).save(manager.getRepository(RetailInvoices).create({ tenantId, code: `INV-${exchangeOrderCode}`, name: `Hóa đơn đổi hàng ${order.orderCode}`, status: "COMPLETED", referenceId: exchangeOrder.id, amount: replacementAmount, data: { orderId: exchangeOrder.id, exchangeId: exchange.id, originalOrderId: order.id, grandTotal: replacementAmount } }));
      const invoiceItems = [];
      for (const item of exchangeOrderItems) invoiceItems.push(await manager.getRepository(RetailInvoiceItems).save(manager.getRepository(RetailInvoiceItems).create({ tenantId, code: `${invoice.code}-${invoiceItems.length + 1}`, name: item.variantId, status: "COMPLETED", referenceId: invoice.id, quantity: item.quantity, amount: item.lineTotal, data: { invoiceId: invoice.id, orderId: exchangeOrder.id, orderItemId: item.id, exchangeId: exchange.id, variantId: item.variantId, unitPrice: item.unitPrice } })));

      let payment = null;
      let paymentTransaction = null;
      let refund = null;
      let debt = null;
      if (difference !== 0) {
        const paymentMethod = input.paymentMethodId
          ? await manager.getRepository(RetailPaymentMethods).createQueryBuilder("paymentMethod").where("paymentMethod.id = :id", { id: input.paymentMethodId }).andWhere("paymentMethod.tenant_id = :tenantId", { tenantId }).getOne()
          : await manager.getRepository(RetailPaymentMethods).createQueryBuilder("paymentMethod").where("paymentMethod.code = :code", { code: input.paymentMethod || "CASH" }).andWhere("paymentMethod.tenant_id = :tenantId", { tenantId }).getOne();
        if (!paymentMethod) throw new BadRequestError(`Payment method not found: ${input.paymentMethodId || input.paymentMethod || "CASH"}`);
        if (difference > 0) {
          const paidAmount = Math.min(Number(input.paidAmount ?? difference), difference);
          const debtAmount = difference - paidAmount;
          if (debtAmount > 0 && !order.customerId) throw new BadRequestError("A customer is required when an exchange has an unpaid difference");
          exchangeOrder.paidTotal = paidAmount;
          exchangeOrder.debtTotal = debtAmount;
          exchangeOrder.paymentStatus = debtAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID";
          await orderRepository.save(exchangeOrder);
          if (paidAmount > 0) {
            payment = await manager.getRepository(RetailPayment).save(manager.getRepository(RetailPayment).create({ tenantId, orderId: exchangeOrder.id, customerId: order.customerId, paymentMethodId: paymentMethod.id, amount: paidAmount, status: "PAID", externalReference: input.paymentMethod || paymentMethod.code, paidAt: new Date(), idempotencyKey: `${exchangeOrderCode}-PAY` }));
            paymentTransaction = await manager.getRepository(RetailPaymentTransactions).save(manager.getRepository(RetailPaymentTransactions).create({ tenantId, code: `PAY-TXN-${exchangeOrderCode}`, name: `Thu chênh lệch đổi hàng ${order.orderCode}`, status: "COMPLETED", referenceId: payment.id, amount: paidAmount, data: { paymentId: payment.id, orderId: exchangeOrder.id, exchangeId: exchange.id, direction: "IN", completedAt: new Date().toISOString() } }));
            await manager.getRepository(RetailCashMovements).save(manager.getRepository(RetailCashMovements).create({ tenantId, code: `CASH-IN-${exchangeOrderCode}`, name: `Thu chênh lệch đổi hàng ${order.orderCode}`, status: "COMPLETED", referenceId: payment.id, amount: paidAmount, data: { direction: "IN", orderId: exchangeOrder.id, exchangeId: exchange.id, paymentId: payment.id, paymentMethodId: paymentMethod.id, createdBy: userId } }));
          }
          if (debtAmount > 0) {
            debt = await manager.getRepository(RetailCustomerDebts).save(manager.getRepository(RetailCustomerDebts).create({ tenantId, code: `DEBT-${exchangeOrderCode}`, name: `Công nợ đổi hàng ${order.orderCode}`, status: "ACTIVE", referenceId: exchangeOrder.id, amount: debtAmount, data: { customerId: order.customerId, orderId: exchangeOrder.id, exchangeId: exchange.id, originalAmount: difference, paidAmount, balance: debtAmount } }));
            await manager.getRepository(RetailCustomerDebtTransactions).save(manager.getRepository(RetailCustomerDebtTransactions).create({ tenantId, code: `DEBT-TXN-${exchangeOrderCode}`, name: `Phát sinh công nợ đổi hàng ${order.orderCode}`, status: "ACTIVE", referenceId: debt.id, amount: debtAmount, data: { debtId: debt.id, customerId: order.customerId, orderId: exchangeOrder.id, exchangeId: exchange.id, direction: "CHARGE", balance: debtAmount } }));
          }
        } else {
          const refundAmount = Math.abs(difference);
          refund = await manager.getRepository(RetailRefunds).save(manager.getRepository(RetailRefunds).create({ tenantId, code: `RF-${exchangeOrderCode}`, name: `Hoàn chênh lệch đổi hàng ${order.orderCode}`, status: "COMPLETED", referenceId: order.id, amount: refundAmount, data: { orderId: order.id, exchangeId: exchange.id, exchangeOrderId: exchangeOrder.id, reason: input.reason || null, createdBy: userId } }));
          for (const line of returnLines) await refundItemRepository.save(refundItemRepository.create({ tenantId, code: `${refund.code}-${line.item.id.slice(0, 8)}`, name: line.item.variantId, status: "COMPLETED", referenceId: refund.id, quantity: line.quantity, amount: line.amount, data: { refundId: refund.id, orderId: order.id, exchangeId: exchange.id, orderItemId: line.item.id, variantId: line.item.variantId } }));
          payment = await manager.getRepository(RetailPayment).save(manager.getRepository(RetailPayment).create({ tenantId, orderId: exchangeOrder.id, customerId: order.customerId, paymentMethodId: paymentMethod.id, amount: refundAmount, status: "REFUNDED", externalReference: input.paymentMethod || paymentMethod.code, paidAt: new Date(), idempotencyKey: `${exchangeOrderCode}-REFUND` }));
          paymentTransaction = await manager.getRepository(RetailPaymentTransactions).save(manager.getRepository(RetailPaymentTransactions).create({ tenantId, code: `REFUND-TXN-${exchangeOrderCode}`, name: `Hoàn chênh lệch đổi hàng ${order.orderCode}`, status: "COMPLETED", referenceId: payment.id, amount: refundAmount, data: { paymentId: payment.id, orderId: exchangeOrder.id, exchangeId: exchange.id, refundId: refund.id, direction: "OUT", completedAt: new Date().toISOString() } }));
          await manager.getRepository(RetailCashMovements).save(manager.getRepository(RetailCashMovements).create({ tenantId, code: `CASH-OUT-${exchangeOrderCode}`, name: `Hoàn chênh lệch đổi hàng ${order.orderCode}`, status: "COMPLETED", referenceId: payment.id, amount: -refundAmount, data: { direction: "OUT", orderId: exchangeOrder.id, exchangeId: exchange.id, refundId: refund.id, paymentId: payment.id, paymentMethodId: paymentMethod.id, createdBy: userId } }));
        }
      }

      if (order.customerId) {
        const customerRepository = manager.getRepository(RetailCustomer);
        const customer = await customerRepository.createQueryBuilder("customer").setLock("pessimistic_write").where("customer.id = :id", { id: order.customerId }).andWhere("customer.tenant_id = :tenantId", { tenantId }).getOne();
        if (customer) {
          customer.totalSpent = Math.max(0, Number(customer.totalSpent || 0) + difference);
          await customerRepository.save(customer);
        }
      }
      const loyaltyReversal = order.customerId ? await this.reverseLoyalty(manager, order.customerId, order.id, returnAmount, tenantId, `LOY-EX-RET-${code}`, userId) : null;
      const history = await manager.getRepository(RetailOrderStatusHistory).save(manager.getRepository(RetailOrderStatusHistory).create({ tenantId, code: `HIS-EX-${code}`.slice(0, 80), name: `Đổi hàng ${order.orderCode}`, status: "COMPLETED", referenceId: order.id, data: { orderId: order.id, exchangeId: exchange.id, exchangeOrderId: exchangeOrder.id, returnAmount, replacementAmount, difference, createdBy: userId } }));
      return ApiResponseHandler.createSuccess("Order exchanged", { order, exchange, salesReturn, exchangeItems, returnItems, exchangeOrder, exchangeOrderItems, invoice, invoiceItems, payment, paymentTransaction, refund, debt, ledgers, history, loyaltyReversal });
    });
  }

  async returnOrder(orderId: string, input: RetailSalesReturnDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const orderRepository = manager.getRepository(RetailOrder);
      const order = await orderRepository.createQueryBuilder("order").setLock("pessimistic_write").where("order.id = :id", { id: orderId }).andWhere("order.tenant_id = :tenantId", { tenantId }).getOne();
      if (!order) throw new BadRequestError(`Order not found: ${orderId}`);
      if (["CANCELLED", "RETURNED"].includes(order.status)) throw new BadRequestError(`Order cannot receive a return in status ${order.status}`);
      const orderItems = await manager.getRepository(RetailOrderItem).createQueryBuilder("item").where("item.order_id = :orderId", { orderId }).andWhere("item.tenant_id = :tenantId", { tenantId }).getMany();
      const itemById = new Map(orderItems.map((item) => [item.id, item]));
      const refundItemRepository = manager.getRepository(RetailRefundItems);
      const requestedIds = new Set<string>();
      const returnedQuantities = new Map<string, number>();
      const returnLines: Array<{ item: RetailOrderItem; quantity: number; amount: number; subtotal: number; discount: number; tax: number }> = [];
      for (const line of input.items) {
        if (requestedIds.has(line.orderItemId)) throw new BadRequestError(`Duplicate order item in return: ${line.orderItemId}`);
        requestedIds.add(line.orderItemId);
        const item = itemById.get(line.orderItemId);
        if (!item) throw new BadRequestError(`Order item not found: ${line.orderItemId}`);
        const previousRows = await refundItemRepository.createQueryBuilder("refundItem").where("refundItem.tenant_id = :tenantId", { tenantId }).andWhere("refundItem.data ->> 'orderItemId' = :orderItemId", { orderItemId: item.id }).getMany();
        const previouslyReturned = previousRows.reduce((sum, previous) => sum + Number(previous.quantity || 0), 0);
        if (previouslyReturned + line.quantity > Number(item.quantity)) throw new BadRequestError(`Return quantity exceeds sold quantity for item: ${item.id}`);
        returnedQuantities.set(item.id, previouslyReturned + line.quantity);
        const ratio = line.quantity / Number(item.quantity);
        returnLines.push({ item, quantity: line.quantity, amount: Number(item.lineTotal || 0) * ratio, subtotal: Number(item.unitPrice || 0) * line.quantity, discount: Number(item.discountTotal || 0) * ratio, tax: Number(item.taxTotal || 0) * ratio });
      }
      const refundAmount = returnLines.reduce((sum, line) => sum + line.amount, 0);
      if (refundAmount <= 0 || refundAmount > Number(order.grandTotal || 0)) throw new BadRequestError("Return amount is outside the remaining order total");
      const paidRefundAmount = Math.min(Number(order.paidTotal || 0), refundAmount);
      const debtReduction = refundAmount - paidRefundAmount;
      const code = input.code || `RET${Date.now().toString().slice(-10)}`;
      const refundRepository = manager.getRepository(RetailRefunds);
      const refund = await refundRepository.save(refundRepository.create({ tenantId, code, name: input.reason || `Trả hàng ${order.orderCode}`, status: "COMPLETED", referenceId: order.id, amount: refundAmount, data: { orderId: order.id, orderCode: order.orderCode, type: "SALE_RETURN", reason: input.reason || null, paidRefundAmount, debtReduction, createdBy: userId } }));
      const salesReturn = await manager.getRepository(RetailReturns).save(manager.getRepository(RetailReturns).create({ tenantId, code, name: input.reason || `Trả hàng ${order.orderCode}`, status: "COMPLETED", referenceId: order.id, amount: refundAmount, data: { orderId: order.id, orderCode: order.orderCode, refundId: refund.id, type: "SALE_RETURN", reason: input.reason || null, createdBy: userId } }));
      const inventoryRepository = manager.getRepository(RetailInventory);
      const ledgerRepository = manager.getRepository(RetailStockLedger);
      const ledgers: RetailStockLedger[] = [];
      const refundItems = [];
      const returnItems = [];
      for (const line of returnLines) {
        refundItems.push(await refundItemRepository.save(refundItemRepository.create({ tenantId, code: `${code}-${refundItems.length + 1}`, name: line.item.variantId, status: "COMPLETED", referenceId: refund.id, quantity: line.quantity, amount: line.amount, data: { refundId: refund.id, orderId: order.id, orderItemId: line.item.id, variantId: line.item.variantId, unitPrice: line.item.unitPrice } })));
        returnItems.push(await manager.getRepository(RetailReturnItems).save(manager.getRepository(RetailReturnItems).create({ tenantId, code: `${code}-RET-${returnItems.length + 1}`, name: line.item.variantId, status: "COMPLETED", referenceId: salesReturn.id, quantity: line.quantity, amount: line.amount, data: { returnId: salesReturn.id, refundId: refund.id, orderId: order.id, orderItemId: line.item.id, variantId: line.item.variantId, unitPrice: line.item.unitPrice } })));
        if (order.warehouseId) {
          const inventory = await inventoryRepository.createQueryBuilder("inventory").setLock("pessimistic_write").where("inventory.warehouse_id = :warehouseId", { warehouseId: order.warehouseId }).andWhere("inventory.variant_id = :variantId", { variantId: line.item.variantId }).andWhere("inventory.tenant_id = :tenantId", { tenantId }).getOne();
          if (!inventory) throw new BadRequestError(`Inventory not found while returning variant: ${line.item.variantId}`);
          inventory.onHand = Number(inventory.onHand) + line.quantity;
          inventory.version = Number(inventory.version || 0) + 1;
          await inventoryRepository.save(inventory);
          ledgers.push(await ledgerRepository.save(ledgerRepository.create({ tenantId, warehouseId: order.warehouseId, variantId: line.item.variantId, movementType: "SALE_RETURN", quantity: line.quantity, unitCost: Number(line.item.costTotal || 0) / Number(line.item.quantity || 1), referenceType: "REFUND", referenceId: refund.id, occurredAt: new Date(), createdBy: userId, metadata: { orderCode: order.orderCode, reason: input.reason || null } })));
        }
      }

      const paymentRepository = manager.getRepository(RetailPayment);
      const payments = await paymentRepository.createQueryBuilder("payment").setLock("pessimistic_write").where("payment.order_id = :orderId", { orderId }).andWhere("payment.tenant_id = :tenantId", { tenantId }).getMany();
      let paymentRefundRemaining = paidRefundAmount;
      for (const payment of payments.filter((item) => ["PAID", "PARTIALLY_REFUNDED"].includes(item.status))) {
        const refundable = Math.min(paymentRefundRemaining, Number(payment.amount || 0));
        if (refundable > 0) {
          payment.status = refundable >= Number(payment.amount || 0) ? "REFUNDED" : "PARTIALLY_REFUNDED";
          await paymentRepository.save(payment);
          paymentRefundRemaining -= refundable;
        }
      }

      const previousStatus = order.status;
      order.subtotal = Math.max(0, Number(order.subtotal || 0) - returnLines.reduce((sum, line) => sum + line.subtotal, 0));
      order.discountTotal = Math.max(0, Number(order.discountTotal || 0) - returnLines.reduce((sum, line) => sum + line.discount, 0));
      order.taxTotal = Math.max(0, Number(order.taxTotal || 0) - returnLines.reduce((sum, line) => sum + line.tax, 0));
      order.grandTotal = Math.max(0, Number(order.grandTotal || 0) - refundAmount);
      order.paidTotal = Math.max(0, Number(order.paidTotal || 0) - paidRefundAmount);
      order.debtTotal = Math.max(0, Number(order.debtTotal || 0) - debtReduction);
      const fullyReturned = orderItems.every((item) => {
        return Number(returnedQuantities.get(item.id) || 0) >= Number(item.quantity);
      });
      order.status = fullyReturned ? "RETURNED" : "PARTIALLY_RETURNED";
      order.fulfillmentStatus = fullyReturned ? "RETURNED" : "PARTIALLY_RETURNED";
      order.paymentStatus = fullyReturned && paidRefundAmount > 0 ? "REFUNDED" : order.paidTotal <= 0 ? "UNPAID" : order.paidTotal >= order.grandTotal ? "PAID" : "PARTIAL";
      await orderRepository.save(order);
      const invoice = await manager.getRepository(RetailInvoices).createQueryBuilder("invoice").setLock("pessimistic_write").where("invoice.reference_id = :orderId", { orderId }).andWhere("invoice.tenant_id = :tenantId", { tenantId }).getOne();
      if (invoice) {
        invoice.status = fullyReturned ? "REFUNDED" : "PARTIALLY_REFUNDED";
        invoice.data = { ...(invoice.data || {}), lastReturnId: salesReturn.id, refundedAmount: Number(invoice.data?.refundedAmount || 0) + refundAmount };
        await manager.getRepository(RetailInvoices).save(invoice);
      }

      if (order.customerId) {
        const customerRepository = manager.getRepository(RetailCustomer);
        const customer = await customerRepository.createQueryBuilder("customer").setLock("pessimistic_write").where("customer.id = :id", { id: order.customerId }).andWhere("customer.tenant_id = :tenantId", { tenantId }).getOne();
        if (customer) {
          customer.totalSpent = Math.max(0, Number(customer.totalSpent || 0) - refundAmount);
          if (fullyReturned) customer.orderCount = Math.max(0, Number(customer.orderCount || 0) - 1);
          await customerRepository.save(customer);
        }
      }
      const loyaltyReversal = order.customerId ? await this.reverseLoyalty(manager, order.customerId, order.id, refundAmount, tenantId, `LOY-RET-${code}`, userId) : null;
      if (debtReduction > 0) {
        const debtRepository = manager.getRepository(RetailCustomerDebts);
        const debt = await debtRepository.createQueryBuilder("debt").setLock("pessimistic_write").where("debt.reference_id = :orderId", { orderId }).andWhere("debt.tenant_id = :tenantId", { tenantId }).getOne();
        if (debt) {
          const balance = Math.max(0, Number((debt.data as Record<string, unknown>)?.balance || debt.amount || 0) - debtReduction);
          debt.amount = balance;
          debt.status = balance === 0 ? "SETTLED" : "ACTIVE";
          debt.data = { ...(debt.data || {}), balance, lastReturnId: refund.id };
          await debtRepository.save(debt);
          await manager.getRepository(RetailCustomerDebtTransactions).save(manager.getRepository(RetailCustomerDebtTransactions).create({ tenantId, code: `DEBT-RET-${code}`, name: `Giảm công nợ do trả hàng ${order.orderCode}`, status: "COMPLETED", referenceId: debt.id, amount: debtReduction, data: { debtId: debt.id, orderId: order.id, refundId: refund.id, direction: "RETURN" } }));
        }
      }
      const history = await manager.getRepository(RetailOrderStatusHistory).save(manager.getRepository(RetailOrderStatusHistory).create({ tenantId, code: `HIS${Date.now().toString().slice(-10)}`, name: `Trả hàng ${order.orderCode}`, status: "COMPLETED", referenceId: order.id, data: { orderId: order.id, from: previousStatus, to: order.status, refundId: refund.id, reason: input.reason || null, createdBy: userId } }));
      return ApiResponseHandler.createSuccess("Order returned", { order, refund, salesReturn, refundItems, returnItems, history, ledgers, invoice, loyaltyReversal });
    });
  }

  async reconcileFinancials(input: RetailReconciliationDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const start = new Date(`${input.startDate}T00:00:00.000+07:00`);
      const end = new Date(`${input.endDate}T23:59:59.999+07:00`);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) throw new BadRequestError("Invalid reconciliation date range");
      const paymentQuery = manager.getRepository(RetailPayment).createQueryBuilder("payment")
        .where("payment.tenant_id = :tenantId", { tenantId })
        .andWhere("payment.created_at >= :start AND payment.created_at <= :end", { start, end });
      if (input.paymentMethodId) paymentQuery.andWhere("payment.payment_method_id = :paymentMethodId", { paymentMethodId: input.paymentMethodId });
      const payments = await paymentQuery.orderBy("payment.created_at", "ASC").getMany();
      if (input.paymentMethodId) {
        const method = await manager.getRepository(RetailPaymentMethods).createQueryBuilder("paymentMethod")
          .where("paymentMethod.id = :id", { id: input.paymentMethodId }).andWhere("paymentMethod.tenant_id = :tenantId", { tenantId }).getOne();
        if (!method) throw new BadRequestError(`Payment method not found: ${input.paymentMethodId}`);
      }
      const paymentIds = payments.map((payment) => payment.id);
      const transactions = paymentIds.length
        ? await manager.getRepository(RetailPaymentTransactions).createQueryBuilder("transaction").where("transaction.tenant_id = :tenantId", { tenantId }).andWhere("transaction.reference_id IN (:...paymentIds)", { paymentIds }).getMany()
        : [];
      const cashMovements = await manager.getRepository(RetailCashMovements).createQueryBuilder("movement")
        .where("movement.tenant_id = :tenantId", { tenantId }).andWhere("movement.created_at >= :start AND movement.created_at <= :end", { start, end }).getMany();
      const scopedCashMovements = input.paymentMethodId
        ? cashMovements.filter((movement) => movement.data?.paymentMethodId === input.paymentMethodId || paymentIds.includes(movement.referenceId || ""))
        : cashMovements;
      const transactionsByPayment = new Map<string, RetailPaymentTransactions[]>();
      for (const transaction of transactions) {
        const rows = transactionsByPayment.get(transaction.referenceId || "") || [];
        rows.push(transaction);
        transactionsByPayment.set(transaction.referenceId || "", rows);
      }
      const linkedPaymentIds = new Set<string>();
      const items: Array<{ code: string; name: string; amount: number; status: string; data: Record<string, unknown> }> = [];
      let matchedCount = 0;
      let varianceCount = 0;
      let expectedTotal = 0;
      let transactionTotal = 0;
      let cashTotal = 0;
      for (const payment of payments) {
        const direction = payment.status === "REFUNDED" ? "OUT" : "IN";
        const expectedAmount = direction === "OUT" ? -Number(payment.amount || 0) : Number(payment.amount || 0);
        const linkedTransactions = transactionsByPayment.get(payment.id) || [];
        const linkedCashMovements = scopedCashMovements.filter((movement) => movement.referenceId === payment.id || movement.data?.paymentId === payment.id);
        if (linkedCashMovements.length) linkedPaymentIds.add(payment.id);
        const transactionAmount = linkedTransactions.reduce((sum, transaction) => sum + (transaction.data?.direction === "OUT" ? -Number(transaction.amount || 0) : Number(transaction.amount || 0)), 0);
        const cashAmount = linkedCashMovements.reduce((sum, movement) => {
          const amount = Math.abs(Number(movement.amount || 0));
          return sum + (movement.data?.direction === "OUT" ? -amount : amount);
        }, 0);
        const transactionMatched = linkedTransactions.length > 0 && Math.abs(transactionAmount - expectedAmount) < 0.01;
        const cashMatched = linkedCashMovements.length > 0 && Math.abs(cashAmount - expectedAmount) < 0.01;
        const issues = [] as string[];
        if (!transactionMatched) issues.push(linkedTransactions.length ? "TRANSACTION_AMOUNT_MISMATCH" : "MISSING_PAYMENT_TRANSACTION");
        if (!cashMatched) issues.push(linkedCashMovements.length ? "CASH_MOVEMENT_AMOUNT_MISMATCH" : "MISSING_CASH_MOVEMENT");
        const status = issues.length ? "VARIANCE" : "MATCHED";
        if (status === "MATCHED") matchedCount += 1; else varianceCount += 1;
        expectedTotal += expectedAmount;
        transactionTotal += transactionAmount;
        cashTotal += cashAmount;
        items.push({ code: `PAY-${payment.id.slice(0, 8)}`, name: `Đối soát payment ${payment.id.slice(0, 8)}`, amount: expectedAmount, status, data: { paymentId: payment.id, orderId: payment.orderId, expectedAmount, transactionAmount, cashAmount, transactionCount: linkedTransactions.length, cashMovementCount: linkedCashMovements.length, paymentStatus: payment.status, issues } });
      }
      const orphanCashMovements = scopedCashMovements.filter((movement) => {
        const paymentId = movement.data?.paymentId || movement.referenceId;
        return !paymentId || !linkedPaymentIds.has(String(paymentId));
      });
      for (const movement of orphanCashMovements) {
        varianceCount += 1;
        const amount = Math.abs(Number(movement.amount || 0));
        const signedAmount = movement.data?.direction === "OUT" ? -amount : amount;
        cashTotal += signedAmount;
        items.push({ code: `CASH-${movement.id.slice(0, 8)}`, name: `Tiền mặt chưa ghép ${movement.id.slice(0, 8)}`, amount: signedAmount, status: "VARIANCE", data: { cashMovementId: movement.id, cashAmount: signedAmount, issues: ["UNLINKED_CASH_MOVEMENT"], direction: movement.data?.direction || null } });
      }
      const code = `REC${Date.now().toString().slice(-10)}`;
      const reconciliation = await manager.getRepository(RetailReconciliations).save(manager.getRepository(RetailReconciliations).create({
        tenantId, code, name: `Đối soát ${input.startDate} đến ${input.endDate}`, status: varianceCount ? "HAS_VARIANCE" : payments.length ? "MATCHED" : "NO_DATA", amount: expectedTotal, quantity: items.length,
        data: { startDate: input.startDate, endDate: input.endDate, paymentMethodId: input.paymentMethodId || null, expectedTotal, transactionTotal, cashTotal, paymentCount: payments.length, matchedCount, varianceCount, reconciledBy: userId, reconciledAt: new Date().toISOString() },
      }));
      const reconciliationItems = [];
      for (const item of items) reconciliationItems.push(await manager.getRepository(RetailReconciliationItems).save(manager.getRepository(RetailReconciliationItems).create({ tenantId, code: `${code}-${reconciliationItems.length + 1}`, name: item.name, status: item.status, referenceId: reconciliation.id, amount: item.amount, data: { reconciliationId: reconciliation.id, ...item.data } })));
      return ApiResponseHandler.createSuccess("Financial reconciliation completed", { reconciliation, reconciliationItems, summary: { startDate: input.startDate, endDate: input.endDate, paymentCount: payments.length, matchedCount, varianceCount, expectedTotal, transactionTotal, cashTotal } });
    });
  }

  async collectCustomerDebt(input: RetailCustomerDebtPaymentDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const customer = await manager.getRepository(RetailCustomer).createQueryBuilder("customer").where("customer.id = :id", { id: input.customerId }).andWhere("customer.tenant_id = :tenantId", { tenantId }).getOne();
      if (!customer) throw new BadRequestError(`Customer not found: ${input.customerId}`);
      if (customer.status !== "ACTIVE") throw new BadRequestError(`Customer is not active: ${input.customerId}`);
      const paymentMethod = input.paymentMethodId
        ? await manager.getRepository(RetailPaymentMethods).createQueryBuilder("paymentMethod").where("paymentMethod.id = :id", { id: input.paymentMethodId }).andWhere("paymentMethod.tenant_id = :tenantId", { tenantId }).getOne()
        : await manager.getRepository(RetailPaymentMethods).createQueryBuilder("paymentMethod").where("paymentMethod.code = :code", { code: input.paymentMethod || "CASH" }).andWhere("paymentMethod.tenant_id = :tenantId", { tenantId }).getOne();
      if (!paymentMethod) throw new BadRequestError(`Payment method not found: ${input.paymentMethodId || input.paymentMethod || "CASH"}`);
      const debtRepository = manager.getRepository(RetailCustomerDebts);
      const debts = await debtRepository.createQueryBuilder("debt").setLock("pessimistic_write").where("debt.tenant_id = :tenantId", { tenantId }).andWhere("debt.status = 'ACTIVE'").andWhere("debt.data ->> 'customerId' = :customerId", { customerId: input.customerId }).orderBy("debt.created_at", "ASC").getMany();
      const totalOutstanding = debts.reduce((sum, debt) => sum + Number((debt.data as Record<string, unknown>)?.balance || debt.amount || 0), 0);
      if (input.amount > totalOutstanding) throw new BadRequestError(`Payment exceeds customer outstanding debt: ${totalOutstanding}`);
      const code = input.code || `COL${Date.now().toString().slice(-10)}`;
      const payment = await manager.getRepository(RetailPayment).save(manager.getRepository(RetailPayment).create({ tenantId, orderId: null, customerId: input.customerId, paymentMethodId: paymentMethod.id, amount: input.amount, status: "PAID", externalReference: input.note || "CUSTOMER_DEBT", paidAt: new Date(), idempotencyKey: code }));
      await manager.getRepository(RetailCashMovements).save(manager.getRepository(RetailCashMovements).create({ tenantId, code: `CASH-IN-${code}`, name: `Thu công nợ ${customer.fullName}`, status: "COMPLETED", referenceId: payment.id, amount: input.amount, data: { direction: "IN", customerId: input.customerId, paymentId: payment.id, paymentMethodId: paymentMethod.id, createdBy: userId } }));
      let remaining = input.amount;
      const allocations: Array<{ debtId: string; amount: number }> = [];
      for (const debt of debts) {
        if (remaining <= 0) break;
        const balance = Number((debt.data as Record<string, unknown>)?.balance || debt.amount || 0);
        const allocated = Math.min(balance, remaining);
        if (allocated <= 0) continue;
        const nextBalance = balance - allocated;
        debt.amount = nextBalance;
        debt.status = nextBalance === 0 ? "SETTLED" : "ACTIVE";
        debt.data = { ...(debt.data || {}), balance: nextBalance, lastPaymentId: payment.id };
        await debtRepository.save(debt);
        await manager.getRepository(RetailCustomerDebtTransactions).save(manager.getRepository(RetailCustomerDebtTransactions).create({ tenantId, code: `${code}-${allocations.length + 1}`, name: `Thu công nợ ${customer.fullName}`, status: "COMPLETED", referenceId: debt.id, amount: allocated, data: { debtId: debt.id, customerId: input.customerId, paymentId: payment.id, direction: "PAYMENT", note: input.note || null } }));
        allocations.push({ debtId: debt.id, amount: allocated });
        remaining -= allocated;
      }
      const receipt = await manager.getRepository(RetailReceipts).save(manager.getRepository(RetailReceipts).create({ tenantId, code: `RCPT-${code}`, name: `Thu công nợ ${customer.fullName}`, status: "COMPLETED", referenceId: payment.id, amount: input.amount, data: { customerId: input.customerId, paymentId: payment.id, allocations, receivedBy: userId, note: input.note || null } }));
      return ApiResponseHandler.createSuccess("Customer debt collected", { payment, receipt, allocations, remainingDebt: totalOutstanding - input.amount });
    });
  }

  async paySupplierDebt(input: RetailSupplierDebtPaymentDto, tenantId: string, userId: string) {
    return DatabaseConfig.transaction(async (manager) => {
      const supplier = await manager.getRepository(RetailSuppliers).createQueryBuilder("supplier").where("supplier.id = :id", { id: input.supplierId }).andWhere("supplier.tenant_id = :tenantId", { tenantId }).getOne();
      if (!supplier) throw new BadRequestError(`Supplier not found: ${input.supplierId}`);
      if (supplier.status !== "ACTIVE") throw new BadRequestError(`Supplier is not active: ${input.supplierId}`);
      const paymentMethod = input.paymentMethodId
        ? await manager.getRepository(RetailPaymentMethods).createQueryBuilder("paymentMethod").where("paymentMethod.id = :id", { id: input.paymentMethodId }).andWhere("paymentMethod.tenant_id = :tenantId", { tenantId }).getOne()
        : await manager.getRepository(RetailPaymentMethods).createQueryBuilder("paymentMethod").where("paymentMethod.code = :code", { code: input.paymentMethod || "CASH" }).andWhere("paymentMethod.tenant_id = :tenantId", { tenantId }).getOne();
      if (!paymentMethod) throw new BadRequestError(`Payment method not found: ${input.paymentMethodId || input.paymentMethod || "CASH"}`);
      const debtRepository = manager.getRepository(RetailSupplierDebts);
      const debts = await debtRepository.createQueryBuilder("debt").setLock("pessimistic_write").where("debt.tenant_id = :tenantId", { tenantId }).andWhere("debt.status = 'ACTIVE'").andWhere("debt.data ->> 'supplierId' = :supplierId", { supplierId: input.supplierId }).orderBy("debt.created_at", "ASC").getMany();
      const totalOutstanding = debts.reduce((sum, debt) => sum + Number((debt.data || {}).balance || debt.amount || 0), 0);
      if (input.amount > totalOutstanding) throw new BadRequestError(`Payment exceeds supplier outstanding debt: ${totalOutstanding}`);
      const code = input.code || `SUPPAY${Date.now().toString().slice(-10)}`;
      let remaining = input.amount;
      const allocations: Array<{ debtId: string; amount: number }> = [];
      for (const debt of debts) {
        if (remaining <= 0) break;
        const balance = Number((debt.data || {}).balance || debt.amount || 0);
        const allocated = Math.min(balance, remaining);
        if (allocated <= 0) continue;
        const nextBalance = balance - allocated;
        debt.amount = nextBalance;
        debt.status = nextBalance === 0 ? "SETTLED" : "ACTIVE";
        debt.data = { ...(debt.data || {}), balance: nextBalance, lastPaymentCode: code };
        await debtRepository.save(debt);
        await manager.getRepository(RetailSupplierDebtTransactions).save(manager.getRepository(RetailSupplierDebtTransactions).create({ tenantId, code: `${code}-${allocations.length + 1}`, name: `Chi công nợ ${supplier.name || supplier.code || input.supplierId}`, status: "COMPLETED", referenceId: debt.id, amount: allocated, data: { supplierDebtId: debt.id, supplierId: input.supplierId, paymentMethodId: paymentMethod.id, direction: "PAYMENT", note: input.note || null } }));
        allocations.push({ debtId: debt.id, amount: allocated });
        remaining -= allocated;
      }
      const receipt = await manager.getRepository(RetailReceipts).save(manager.getRepository(RetailReceipts).create({ tenantId, code: `PAY-${code}`, name: `Chi công nợ ${supplier.name || supplier.code || input.supplierId}`, status: "COMPLETED", amount: input.amount, data: { supplierId: input.supplierId, paymentMethodId: paymentMethod.id, allocations, paidBy: userId, direction: "SUPPLIER_PAYMENT", note: input.note || null } }));
      await manager.getRepository(RetailCashMovements).save(manager.getRepository(RetailCashMovements).create({ tenantId, code: `CASH-OUT-${code}`, name: `Chi công nợ ${supplier.name || supplier.code || input.supplierId}`, status: "COMPLETED", referenceId: receipt.id, amount: -input.amount, data: { direction: "OUT", supplierId: input.supplierId, receiptId: receipt.id, paymentMethodId: paymentMethod.id, paidBy: userId } }));
      return ApiResponseHandler.createSuccess("Supplier debt paid", { receipt, allocations, remainingDebt: totalOutstanding - input.amount });
    });
  }

  private async reverseLoyalty(manager: EntityManager, customerId: string, orderId: string, amount: number, tenantId: string, code: string, userId: string) {
    const repository = manager.getRepository(RetailLoyaltyAccounts);
    const account = await repository.createQueryBuilder("loyalty_account").setLock("pessimistic_write").where("loyalty_account.tenant_id = :tenantId", { tenantId }).andWhere("loyalty_account.data ->> 'customerId' = :customerId", { customerId }).getOne();
    if (!account) return null;
    const accountData = account.data || {};
    const currentPoints = Number(accountData.points || account.quantity || 0);
    const pointRate = Math.max(1, Number(accountData.pointRate || 10000));
    const pointsToReverse = Math.min(currentPoints, Math.floor(amount / pointRate));
    if (pointsToReverse <= 0) return account;
    const nextPoints = currentPoints - pointsToReverse;
    account.quantity = nextPoints;
    account.data = { ...accountData, points: nextPoints, lastReversalOrderId: orderId };
    await repository.save(account);
    const transaction = await manager.getRepository(RetailLoyaltyTransactions).save(manager.getRepository(RetailLoyaltyTransactions).create({ tenantId, code, name: `Hoàn điểm đơn ${orderId}`, status: "COMPLETED", referenceId: account.id, amount: -pointsToReverse, quantity: -pointsToReverse, data: { loyaltyAccountId: account.id, customerId, orderId, direction: "REVERSE", points: pointsToReverse, amount, reversedBy: userId } }));
    return { account, transaction };
  }

  private definition(resource: string): RetailTableDefinition {
    const definition = RETAIL_RESOURCES[resource as RetailResource];
    if (!definition) throw new BadRequestError(`Unsupported retail resource: ${resource}`);
    return definition;
  }

  private getFields(definition: RetailTableDefinition) {
    const metadata = DatabaseConfig.getMetadata(definition.entity);
    const definitionsByTable = new Map(Object.values(RETAIL_RESOURCES).map((item) => [item.tableName, item]));
    const relationByColumn = new Map<string, RetailRelationDefinition>();

    for (const relation of metadata.relations) {
      for (const joinColumn of relation.joinColumns) {
        const target = definitionsByTable.get(relation.inverseEntityMetadata.tableName);
        if (!target) continue;
        relationByColumn.set(joinColumn.propertyName, {
          resource: target.resource,
          tableName: target.tableName,
          type: relation.relationType,
          foreignKeyName: relation.foreignKeys[0]?.name,
        });
      }
    }

    const inferredRelations: Record<string, RetailResource> = {
      tenantId: "tenants",
      storeId: "stores",
      branchId: "branches",
      warehouseId: "warehouses",
      userId: "users",
      employeeId: "employees",
      shiftId: "work-shifts",
      payrollPeriodId: "payroll-periods",
      categoryId: "categories",
      brandId: "brands",
      unitId: "units",
      productId: "products",
      variantId: "product-variants",
      orderId: "orders",
      customerId: "customers",
      paymentMethodId: "payment-methods",
      createdBy: "users",
    };
    const semanticReferenceResource = RETAIL_REFERENCE_RESOURCES[definition.resource];
    const semanticReferenceTarget = semanticReferenceResource ? RETAIL_RESOURCES[semanticReferenceResource] : undefined;

    return metadata.columns.map((column) => {
      const rawType = typeof column.type === "function" ? column.type.name : String(column.type);
      const inferredResource = inferredRelations[column.propertyName];
      const inferredTarget = inferredResource ? RETAIL_RESOURCES[inferredResource] : undefined;
      return {
        name: column.propertyName,
        databaseName: column.databaseName,
        type: rawType.toLowerCase(),
        nullable: column.isNullable,
        generated: column.isGenerated,
        primary: column.isPrimary,
        length: column.length ? Number(column.length) : undefined,
        precision: column.precision,
        scale: column.scale,
        enumValues: column.enum?.map(String),
        relation: relationByColumn.get(column.propertyName) || (column.propertyName === "referenceId" && semanticReferenceTarget ? {
          resource: semanticReferenceTarget.resource,
          tableName: semanticReferenceTarget.tableName,
          type: "polymorphic-reference",
        } : inferredTarget ? {
          resource: inferredTarget.resource,
          tableName: inferredTarget.tableName,
          type: "many-to-one",
        } : undefined),
        writable: definition.writable.includes(column.propertyName),
        required: definition.required.includes(column.propertyName),
      };
    });
  }

  private async assertReferences(definition: RetailTableDefinition, data: Record<string, unknown>, tenantId?: string): Promise<void> {
    const semanticReferenceResource = RETAIL_REFERENCE_RESOURCES[definition.resource];
    const semanticReferenceTarget = semanticReferenceResource ? RETAIL_RESOURCES[semanticReferenceResource] : undefined;
    const semanticReferenceId = data.referenceId;
    if (semanticReferenceTarget && semanticReferenceId !== undefined && semanticReferenceId !== null && semanticReferenceId !== "") {
      const referenceQuery = DatabaseConfig.getRepository(semanticReferenceTarget.entity).createQueryBuilder("reference")
        .where("reference.id = :id", { id: semanticReferenceId });
      if (semanticReferenceTarget.tenantScoped) referenceQuery.andWhere("reference.tenant_id = :tenantId", { tenantId });
      const reference = await referenceQuery.getOne();
      if (!reference) throw new BadRequestError(`referenceId references a missing ${semanticReferenceTarget.resource} record: ${String(semanticReferenceId)}`);
    }
    const relations = this.getRelationDefinitions(definition);
    for (const [field, target] of relations) {
      if (field === "referenceId" && semanticReferenceTarget) continue;
      const value = data[field];
      if (value === undefined || value === null || value === "" || field === "tenantId") continue;
      const query = DatabaseConfig.getRepository(target.entity).createQueryBuilder("related").where("related.id = :id", { id: value });
      if (target.tenantScoped) query.andWhere("related.tenant_id = :tenantId", { tenantId });
      const related = await query.getOne();
      if (!related) throw new BadRequestError(`${field} references a missing ${target.resource} record: ${String(value)}`);
    }
    const dataPayload = data.data;
    if (!dataPayload || typeof dataPayload !== "object" || Array.isArray(dataPayload)) return;
    for (const [field, resource] of Object.entries(RETAIL_DATA_RELATIONS[definition.resource] || {})) {
      const value = (dataPayload as Record<string, unknown>)[field];
      if (value === undefined || value === null || value === "") continue;
      const target = RETAIL_RESOURCES[resource];
      if (!target) continue;
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) {
        if (typeof item !== "string" || !item) continue;
        const query = DatabaseConfig.getRepository(target.entity).createQueryBuilder("dataRelated").where("dataRelated.id = :id", { id: item });
        if (target.tenantScoped) query.andWhere("dataRelated.tenant_id = :tenantId", { tenantId });
        const related = await query.getOne();
        if (!related) throw new BadRequestError(`data.${field} references a missing ${target.resource} record: ${item}`);
      }
    }
  }

  private getDataRelations(definition: RetailTableDefinition): Record<string, RetailRelationDefinition> {
    const relations = RETAIL_DATA_RELATIONS[definition.resource] || {};
    return Object.fromEntries(Object.entries(relations).map(([field, resource]) => {
      const target = RETAIL_RESOURCES[resource];
      return [field, { resource, tableName: target.tableName, type: "json-reference" } satisfies RetailRelationDefinition];
    }));
  }

  private getRelationDefinitions(definition: RetailTableDefinition): Map<string, RetailTableDefinition> {
    const metadata = DatabaseConfig.getMetadata(definition.entity);
    const definitionsByTable = new Map(Object.values(RETAIL_RESOURCES).map((item) => [item.tableName, item]));
    const relations = new Map<string, RetailTableDefinition>();
    for (const relation of metadata.relations) {
      const target = definitionsByTable.get(relation.inverseEntityMetadata.tableName);
      if (!target) continue;
      for (const joinColumn of relation.joinColumns) relations.set(joinColumn.propertyName, target);
    }

    const inferredRelations: Record<string, RetailResource> = {
      storeId: "stores",
      branchId: "branches",
      warehouseId: "warehouses",
      userId: "users",
      employeeId: "employees",
      shiftId: "work-shifts",
      payrollPeriodId: "payroll-periods",
      categoryId: "categories",
      brandId: "brands",
      unitId: "units",
      productId: "products",
      variantId: "product-variants",
      orderId: "orders",
      customerId: "customers",
      paymentMethodId: "payment-methods",
      createdBy: "users",
    };
    for (const column of metadata.columns) {
      const target = inferredRelations[column.propertyName] ? RETAIL_RESOURCES[inferredRelations[column.propertyName]] : undefined;
      if (target && !relations.has(column.propertyName)) relations.set(column.propertyName, target);
    }
    const semanticReferenceResource = RETAIL_REFERENCE_RESOURCES[definition.resource];
    const semanticReferenceTarget = semanticReferenceResource ? RETAIL_RESOURCES[semanticReferenceResource] : undefined;
    if (semanticReferenceTarget && metadata.columns.some((column) => column.propertyName === "referenceId")) {
      relations.set("referenceId", semanticReferenceTarget);
    }
    return relations;
  }

  private assertTenant(definition: RetailTableDefinition, tenantId?: string): void {
    if (definition.tenantScoped && !tenantId) {
      throw new BadRequestError("x-tenant-id is required for this resource");
    }
  }

  private prepare(definition: RetailTableDefinition, body: Record<string, unknown>, tenantId?: string): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const field of definition.writable) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    const missing = definition.required.filter((field) => data[field] === undefined || data[field] === null || data[field] === "");
    if (missing.length > 0) throw new BadRequestError(`Missing required fields: ${missing.join(", ")}`);
    if (definition.tenantScoped && tenantId) data.tenantId = tenantId;
    return data;
  }
}
