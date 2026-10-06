import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailGoodsReceiptsController } from "./goodsReceipts.controller";
import { RETAIL_GOODS_RECEIPTS_TYPES } from "./goodsReceipts.types";
import { goodsReceiptsBodySchema, goodsReceiptsIdParamsSchema, goodsReceiptsQuerySchema } from "./goodsReceipts.validator";

@injectable()
export class RetailGoodsReceiptsRouter {
  private router: Router;

  constructor(@inject(RETAIL_GOODS_RECEIPTS_TYPES.Controller) private goodsReceiptsController: RetailGoodsReceiptsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "goods-receipts": ["read"] }),
      zodValidate(goodsReceiptsQuerySchema, "query"),
      this.goodsReceiptsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "goods-receipts": ["create"] }),
      zodValidate(goodsReceiptsBodySchema, "body"),
      this.goodsReceiptsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "goods-receipts": ["read"] }),
      zodValidate(goodsReceiptsIdParamsSchema, "params"),
      this.goodsReceiptsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "goods-receipts": ["update"] }),
      zodValidate(goodsReceiptsIdParamsSchema, "params"),
      zodValidate(goodsReceiptsBodySchema, "body"),
      this.goodsReceiptsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "goods-receipts": ["delete"] }),
      zodValidate(goodsReceiptsIdParamsSchema, "params"),
      this.goodsReceiptsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
