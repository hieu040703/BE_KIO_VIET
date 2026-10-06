import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { InvoiceRepository } from "./invoice.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { INVOICE_TYPES } from "./invoice.types";
import { COMMON_TYPES } from "../common/common.types";
import { Invoice } from "@/database/models/Invoice";
import { InvoiceRelations, InvoiceSelectFull } from "./invoice.select";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { InvoiceTypeEnum } from "@/shared/constants/constance";
import { Request } from "express";
import { DeepPartial } from "typeorm";
import { CreateInvoiceDto } from "./invoice.validator";
import { ORDER_TYPES } from "../order/order.types";
import { OrderRepository } from "../order/order.repository";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { ORDER_COMMENT_TYPES } from "../order/orderComment/orderComment.types";
import { OrderCommentService } from "../order/orderComment/orderComment.service";

@injectable()
export class InvoiceService extends BaseService<Invoice> {
  protected relations = InvoiceRelations;
  protected selectedFields = InvoiceSelectFull;
  constructor(
    @inject(INVOICE_TYPES.InvoiceRepository) private invoiceRepository: InvoiceRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentService) private orderCommentService: OrderCommentService,
  ) {
    super(invoiceRepository);
  }

  protected async attachMoreDataToSummary(summary: any, options: IFindOptions<Invoice>): Promise<any> {
    const totalInvoiceSales = await this.invoiceRepository.sumByOptions("taxAmount", {
      ...options,
      type: InvoiceTypeEnum.SALES,
    });
    const totalInvoicePurchases = await this.invoiceRepository.sumByOptions("taxAmount", {
      ...options,
      type: InvoiceTypeEnum.PURCHASE,
    });

    //tính số tiền thuế phải nộp = tổng thuế của hóa đơn bán - tổng thuế của hóa đơn mua
    const totalTaxPayable = (totalInvoiceSales || 0) - (totalInvoicePurchases || 0);

    return {
      ...summary,
      totalInvoiceSales: totalInvoiceSales || 0,
      totalInvoicePurchases: totalInvoicePurchases || 0,
      totalTaxPayable: totalTaxPayable,
    };
  }

  async validateBeforeCreate(data: CreateInvoiceDto, req?: Request, manager?: IEntityManager): Promise<void> {
    if (data.orderId) {
      const order = await this.orderRepository.findById(data.orderId, manager);
      if (!order) {
        throw new NotFoundError("Đơn hàng không tồn tại");
      }

      //? nếu đơn hàng chưa có thông tin thuế thì không thể tạo hóa đơn
      if (order.vat === null || order.vat === undefined) {
        throw new BadRequestError("Đơn hàng chưa có thông tin thuế, không thể tạo hóa đơn");
      }

      //? nếu có đơn hàng thì tổng tiền của hóa đơn phải khớp với tổng tiền của đơn hàng
      if (order.amount !== data.totalAfterTax) {
        throw new BadRequestError("Tổng tiền của hóa đơn không khớp với tổng tiền của đơn hàng");
      }
    }
  }

  async actionAfterCreate(data: Invoice, req?: Request, manager?: IEntityManager): Promise<void> {
    //? cập nhật trạng thái đã được lập hóa đơn cho đơn hàng nếu có
    if (data.orderId) {
      await this.orderRepository.update(data.orderId, { isInvoiced: true }, manager);

      await this.orderCommentService.create(
        {
          orderId: data.orderId,
          userId: null,
          content: `Hợp đồng đã được lập hóa đơn.`,
        },
        undefined,
        manager,
      );
    }
  }
}
