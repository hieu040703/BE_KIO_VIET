import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPromotionCustomerGroupsController } from "./promotionCustomerGroups.controller";
import { RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES } from "./promotionCustomerGroups.types";
import { promotionCustomerGroupsBodySchema, promotionCustomerGroupsIdParamsSchema, promotionCustomerGroupsQuerySchema } from "./promotionCustomerGroups.validator";

@injectable()
export class RetailPromotionCustomerGroupsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES.Controller) private promotionCustomerGroupsController: RetailPromotionCustomerGroupsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "promotion-customer-groups": ["read"] }),
      zodValidate(promotionCustomerGroupsQuerySchema, "query"),
      this.promotionCustomerGroupsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "promotion-customer-groups": ["create"] }),
      zodValidate(promotionCustomerGroupsBodySchema, "body"),
      this.promotionCustomerGroupsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "promotion-customer-groups": ["read"] }),
      zodValidate(promotionCustomerGroupsIdParamsSchema, "params"),
      this.promotionCustomerGroupsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "promotion-customer-groups": ["update"] }),
      zodValidate(promotionCustomerGroupsIdParamsSchema, "params"),
      zodValidate(promotionCustomerGroupsBodySchema, "body"),
      this.promotionCustomerGroupsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "promotion-customer-groups": ["delete"] }),
      zodValidate(promotionCustomerGroupsIdParamsSchema, "params"),
      this.promotionCustomerGroupsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
