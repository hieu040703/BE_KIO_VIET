import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailGoodsReceiptItemsController } from "./goodsReceiptItems.controller";
import { RETAIL_GOODS_RECEIPT_ITEMS_TYPES } from "./goodsReceiptItems.types";
import { goodsReceiptItemsBodySchema, goodsReceiptItemsIdParamsSchema, goodsReceiptItemsQuerySchema } from "./goodsReceiptItems.validator";

@injectable()
export class RetailGoodsReceiptItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_GOODS_RECEIPT_ITEMS_TYPES.Controller) private goodsReceiptItemsController: RetailGoodsReceiptItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "goods-receipt-items": ["read"] }),
      zodValidate(goodsReceiptItemsQuerySchema, "query"),
      this.goodsReceiptItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "goods-receipt-items": ["create"] }),
      zodValidate(goodsReceiptItemsBodySchema, "body"),
      this.goodsReceiptItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "goods-receipt-items": ["read"] }),
      zodValidate(goodsReceiptItemsIdParamsSchema, "params"),
      this.goodsReceiptItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "goods-receipt-items": ["update"] }),
      zodValidate(goodsReceiptItemsIdParamsSchema, "params"),
      zodValidate(goodsReceiptItemsBodySchema, "body"),
      this.goodsReceiptItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "goods-receipt-items": ["delete"] }),
      zodValidate(goodsReceiptItemsIdParamsSchema, "params"),
      this.goodsReceiptItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
