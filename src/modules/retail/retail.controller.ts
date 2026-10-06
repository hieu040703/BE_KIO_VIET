import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { RETAIL_TYPES } from "./retail.types";
import { RetailService } from "./retail.service";
import { RetailQuerySchema } from "./retail.validator";
import { RetailAttendancePunchDto, RetailAttendancePunchSchema, RetailCashSessionCloseDto, RetailCashSessionCloseSchema, RetailCashSessionOpenDto, RetailCashSessionOpenSchema, RetailCheckoutDto, RetailCheckoutSchema, RetailCustomerDebtPaymentDto, RetailCustomerDebtPaymentSchema, RetailExchangeDto, RetailExchangeSchema, RetailGiftCardIssueDto, RetailGiftCardIssueSchema, RetailGiftCardRedeemDto, RetailGiftCardRedeemSchema, RetailGoodsReceiptDto, RetailGoodsReceiptSchema, RetailInventoryAdjustmentDto, RetailInventoryAdjustmentSchema, RetailInventoryTransferDto, RetailInventoryTransferSchema, RetailOrderCancelDto, RetailOrderCancelSchema, RetailOrderDeliverDto, RetailOrderDeliverSchema, RetailOrderShipDto, RetailOrderShipSchema, RetailPayrollGenerateDto, RetailPayrollGenerateSchema, RetailPurchaseOrderCreateDto, RetailPurchaseOrderCreateSchema, RetailPurchaseReturnDto, RetailPurchaseReturnSchema, RetailReconciliationDto, RetailReconciliationSchema, RetailSalesReturnDto, RetailSalesReturnSchema, RetailStockCountDto, RetailStockCountSchema, RetailSupplierDebtPaymentDto, RetailSupplierDebtPaymentSchema, RetailVoucherIssueDto, RetailVoucherIssueSchema, RetailVoucherRedeemDto, RetailVoucherRedeemSchema } from "./retail.validator";

type RetailRequest = Request & { tenantId?: string; user?: { userId: string } };

@injectable()
export class RetailController {
  constructor(@inject(RETAIL_TYPES.RetailService) private readonly service: RetailService) {}

  checkout = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailCheckoutSchema.parse(req.body) as RetailCheckoutDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.checkout(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  openCashSession = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailCashSessionOpenSchema.parse(req.body) as RetailCashSessionOpenDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.openCashSession(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  closeCashSession = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailCashSessionCloseSchema.parse(req.body) as RetailCashSessionCloseDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(200).json(await this.service.closeCashSession(String(req.params.id), body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  punchAttendance = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailAttendancePunchSchema.parse(req.body) as RetailAttendancePunchDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.punchAttendance(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  generatePayroll = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailPayrollGenerateSchema.parse(req.body) as RetailPayrollGenerateDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.generatePayroll(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  issueGiftCard = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailGiftCardIssueSchema.parse(req.body) as RetailGiftCardIssueDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.issueGiftCard(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  redeemGiftCard = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailGiftCardRedeemSchema.parse(req.body) as RetailGiftCardRedeemDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(200).json(await this.service.redeemGiftCard(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  issueVoucher = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailVoucherIssueSchema.parse(req.body) as RetailVoucherIssueDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.issueVoucher(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  redeemVoucher = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailVoucherRedeemSchema.parse(req.body) as RetailVoucherRedeemDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(200).json(await this.service.redeemVoucher(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  adjustInventory = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailInventoryAdjustmentSchema.parse(req.body) as RetailInventoryAdjustmentDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.adjustInventory(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  countInventory = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailStockCountSchema.parse(req.body) as RetailStockCountDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.countInventory(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  transferInventory = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailInventoryTransferSchema.parse(req.body) as RetailInventoryTransferDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.transferInventory(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  receiveGoods = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailGoodsReceiptSchema.parse(req.body) as RetailGoodsReceiptDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.receiveGoods(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  createPurchaseOrder = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailPurchaseOrderCreateSchema.parse(req.body) as RetailPurchaseOrderCreateDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.createPurchaseOrder(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  returnGoods = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailPurchaseReturnSchema.parse(req.body) as RetailPurchaseReturnDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.returnGoods(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  cancelOrder = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailOrderCancelSchema.parse(req.body) as RetailOrderCancelDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(200).json(await this.service.cancelOrder(String(req.params.id), body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  shipOrder = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailOrderShipSchema.parse(req.body || {}) as RetailOrderShipDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.shipOrder(String(req.params.id), body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  deliverOrder = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailOrderDeliverSchema.parse(req.body || {}) as RetailOrderDeliverDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(200).json(await this.service.deliverOrder(String(req.params.id), body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  returnOrder = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailSalesReturnSchema.parse(req.body) as RetailSalesReturnDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.returnOrder(String(req.params.id), body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  exchangeOrder = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailExchangeSchema.parse(req.body) as RetailExchangeDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.exchangeOrder(String(req.params.id), body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  collectCustomerDebt = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailCustomerDebtPaymentSchema.parse(req.body) as RetailCustomerDebtPaymentDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.collectCustomerDebt(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  paySupplierDebt = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailSupplierDebtPaymentSchema.parse(req.body) as RetailSupplierDebtPaymentDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.paySupplierDebt(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  reconcileFinancials = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const body = RetailReconciliationSchema.parse(req.body) as RetailReconciliationDto;
      if (!req.tenantId || !req.user?.userId) return next(new Error("Authenticated tenant is required"));
      res.status(201).json(await this.service.reconcileFinancials(body, req.tenantId, req.user.userId));
    } catch (error) {
      next(error);
    }
  };

  private resource(req: Request): string {
    return String(req.params.resource);
  }

  resources = (_req: Request, res: Response) => res.status(200).json({ success: true, data: this.service.getDefinitions() });

  list = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      const parsedQuery = RetailQuerySchema.safeParse(req.query);
      if (!parsedQuery.success) return next(parsedQuery.error);
      const query = parsedQuery.data;
      res.status(200).json(await this.service.list(this.resource(req), query, req.tenantId));
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await this.service.findById(this.resource(req), String(req.params.id), req.tenantId));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(await this.service.create(this.resource(req), req.body, req.tenantId));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await this.service.update(this.resource(req), String(req.params.id), req.body, req.tenantId));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: RetailRequest, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(await this.service.delete(this.resource(req), String(req.params.id), req.tenantId));
    } catch (error) {
      next(error);
    }
  };
}
