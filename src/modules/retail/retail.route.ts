import { Router } from "express";
import { inject, injectable } from "inversify";
import { RetailController } from "./retail.controller";
import { RETAIL_TYPES } from "./retail.types";
import { RetailAttendancePunchSchema, RetailBodySchema, RetailCashSessionCloseSchema, RetailCashSessionOpenSchema, RetailCheckoutSchema, RetailCustomerDebtPaymentSchema, RetailExchangeSchema, RetailGiftCardIssueSchema, RetailGiftCardRedeemSchema, RetailGoodsReceiptSchema, RetailIdParamsSchema, RetailInventoryAdjustmentSchema, RetailInventoryTransferSchema, RetailOrderCancelParamsSchema, RetailOrderCancelSchema, RetailOrderDeliverSchema, RetailOrderShipSchema, RetailPayrollGenerateSchema, RetailPurchaseOrderCreateSchema, RetailPurchaseReturnSchema, RetailReconciliationSchema, RetailResourceParamsSchema, RetailSalesReturnSchema, RetailStockCountSchema, RetailSupplierDebtPaymentSchema, RetailVoucherIssueSchema, RetailVoucherRedeemSchema } from "./retail.validator";
import { z } from "zod";

@injectable()
export class RetailRouter {
  private readonly router: Router;

  constructor(@inject(RETAIL_TYPES.RetailController) private readonly controller: RetailController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/checkout", this.validateCheckout, this.controller.checkout);
    this.router.post("/cash-sessions/open", this.validateCashSessionOpen, this.controller.openCashSession);
    this.router.post("/cash-sessions/:id/close", this.validateOrderCancelParams, this.validateCashSessionClose, this.controller.closeCashSession);
    this.router.post("/attendance/punch", this.validateAttendancePunch, this.controller.punchAttendance);
    this.router.post("/payroll/generate", this.validatePayrollGenerate, this.controller.generatePayroll);
    this.router.post("/gift-cards/issue", this.validateGiftCardIssue, this.controller.issueGiftCard);
    this.router.post("/gift-cards/redeem", this.validateGiftCardRedeem, this.controller.redeemGiftCard);
    this.router.post("/vouchers/issue", this.validateVoucherIssue, this.controller.issueVoucher);
    this.router.post("/vouchers/redeem", this.validateVoucherRedeem, this.controller.redeemVoucher);
    this.router.post("/inventory/adjust", this.validateInventoryAdjustment, this.controller.adjustInventory);
    this.router.post("/inventory/count", this.validateStockCount, this.controller.countInventory);
    this.router.post("/inventory/transfer", this.validateInventoryTransfer, this.controller.transferInventory);
    this.router.post("/purchasing/receive", this.validateGoodsReceipt, this.controller.receiveGoods);
    this.router.post("/purchasing/orders", this.validatePurchaseOrderCreate, this.controller.createPurchaseOrder);
    this.router.post("/purchasing/return", this.validatePurchaseReturn, this.controller.returnGoods);
    this.router.post("/orders/:id/cancel", this.validateOrderCancelParams, this.validateOrderCancel, this.controller.cancelOrder);
    this.router.post("/orders/:id/ship", this.validateOrderCancelParams, this.validateOrderShip, this.controller.shipOrder);
    this.router.post("/orders/:id/deliver", this.validateOrderCancelParams, this.validateOrderDeliver, this.controller.deliverOrder);
    this.router.post("/orders/:id/return", this.validateOrderCancelParams, this.validateSalesReturn, this.controller.returnOrder);
    this.router.post("/orders/:id/exchange", this.validateOrderCancelParams, this.validateExchange, this.controller.exchangeOrder);
    this.router.post("/customers/debt/collect", this.validateCustomerDebtPayment, this.controller.collectCustomerDebt);
    this.router.post("/suppliers/debt/pay", this.validateSupplierDebtPayment, this.controller.paySupplierDebt);
    this.router.post("/financial/reconcile", this.validateReconciliation, this.controller.reconcileFinancials);
    this.router.get("/resources", this.controller.resources);
    this.router.get("/:resource", this.controller.list);
    this.router.post("/:resource", this.validateBody, this.controller.create);
    this.router.get("/:resource/:id", this.validateId, this.controller.findById);
    this.router.put("/:resource/:id", this.validateId, this.validateBody, this.controller.update);
    this.router.delete("/:resource/:id", this.validateId, this.controller.delete);
  }

  private validateBody = (req: any, _res: any, next: any): void => {
    const result = RetailBodySchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateCheckout = (req: any, _res: any, next: any): void => {
    const result = RetailCheckoutSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateCashSessionOpen = (req: any, _res: any, next: any): void => {
    const result = RetailCashSessionOpenSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateCashSessionClose = (req: any, _res: any, next: any): void => {
    const result = RetailCashSessionCloseSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateAttendancePunch = (req: any, _res: any, next: any): void => {
    const result = RetailAttendancePunchSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validatePayrollGenerate = (req: any, _res: any, next: any): void => {
    const result = RetailPayrollGenerateSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateGiftCardIssue = (req: any, _res: any, next: any): void => {
    const result = RetailGiftCardIssueSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateGiftCardRedeem = (req: any, _res: any, next: any): void => {
    const result = RetailGiftCardRedeemSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateVoucherIssue = (req: any, _res: any, next: any): void => {
    const result = RetailVoucherIssueSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateVoucherRedeem = (req: any, _res: any, next: any): void => {
    const result = RetailVoucherRedeemSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateInventoryAdjustment = (req: any, _res: any, next: any): void => {
    const result = RetailInventoryAdjustmentSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateStockCount = (req: any, _res: any, next: any): void => {
    const result = RetailStockCountSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateInventoryTransfer = (req: any, _res: any, next: any): void => {
    const result = RetailInventoryTransferSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateGoodsReceipt = (req: any, _res: any, next: any): void => {
    const result = RetailGoodsReceiptSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validatePurchaseOrderCreate = (req: any, _res: any, next: any): void => {
    const result = RetailPurchaseOrderCreateSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validatePurchaseReturn = (req: any, _res: any, next: any): void => {
    const result = RetailPurchaseReturnSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateOrderCancelParams = (req: any, _res: any, next: any): void => {
    const result = RetailOrderCancelParamsSchema.safeParse(req.params);
    if (!result.success) return next(result.error);
    next();
  };

  private validateOrderCancel = (req: any, _res: any, next: any): void => {
    const result = RetailOrderCancelSchema.safeParse(req.body || {});
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateOrderShip = (req: any, _res: any, next: any): void => {
    const result = RetailOrderShipSchema.safeParse(req.body || {});
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateOrderDeliver = (req: any, _res: any, next: any): void => {
    const result = RetailOrderDeliverSchema.safeParse(req.body || {});
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateSalesReturn = (req: any, _res: any, next: any): void => {
    const result = RetailSalesReturnSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateExchange = (req: any, _res: any, next: any): void => {
    const result = RetailExchangeSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateCustomerDebtPayment = (req: any, _res: any, next: any): void => {
    const result = RetailCustomerDebtPaymentSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateSupplierDebtPayment = (req: any, _res: any, next: any): void => {
    const result = RetailSupplierDebtPaymentSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateReconciliation = (req: any, _res: any, next: any): void => {
    const result = RetailReconciliationSchema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };

  private validateId = (req: any, _res: any, next: any): void => {
    const result = RetailIdParamsSchema.safeParse(req.params);
    if (!result.success) return next(result.error);
    next();
  };

  public getRouter(): Router {
    return this.router;
  }
}
