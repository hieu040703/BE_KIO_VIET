import { injectable, inject } from "inversify";
import { OrderService } from "./order.service";
import { ORDER_TYPES } from "./order.types";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Request, Response } from "express";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { COMMON_TYPES } from "../common/common.types";
import { GOONG_MAP_TYPES } from "../goongMap/goongMap.types";
import { GoongMapService } from "../goongMap/goongMap.service";
import logger from "@/shared/utils/logger";

@injectable()
export class OrderController extends BaseController<OrderService> {
  constructor(
    @inject(ORDER_TYPES.OrderService) protected service: OrderService,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(GOONG_MAP_TYPES.GoongMapService) private goongMapService: GoongMapService,
  ) {
    super(service);
  }

  private runOrderCreationPostCommitSideEffects = (orderId: string, isUrgent: boolean): void => {
    const sideEffects = [
      {
        name: "customer-zalo-notification",
        execute: () => this.service.notifyOrderCreatedViaZalo(orderId),
      },
    ];

    if (isUrgent) {
      sideEffects.push({
        name: "urgent-branch-manager-confirmation-notification",
        execute: () => this.service.notifyUrgentOrderCreated(orderId),
      });
    }

    void Promise.allSettled(sideEffects.map(({ execute }) => Promise.resolve().then(execute)))
      .then((postCommitResults) => {
        postCommitResults.forEach((postCommitResult, index) => {
          if (postCommitResult.status === "rejected") {
            logger.error("Order creation post-commit side effect failed", {
              orderId,
              sideEffect: sideEffects[index].name,
              error:
                postCommitResult.reason instanceof Error
                  ? postCommitResult.reason.message
                  : String(postCommitResult.reason),
            });
          }
        });
      })
      .catch((error) => {
        logger.error("Order creation post-commit side effect handler failed", {
          orderId,
          error: error instanceof Error ? error.message : String(error),
        });
      });
  };

  create = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      // Hoặc nếu muốn quản lý transaction từ controller
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.create(req.body, req, tx.manager);
      });

      if (result.data?.id) {
        this.runOrderCreationPostCommitSideEffects(result.data.id, result.data.isUrgent === true);
      }

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  startOrder = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;

      console.log("orderId", orderId);

      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.startOrder(orderId, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  completeOrder = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;

      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.completeOrder(orderId, req, tx.manager);
      });

      const postCommitResults = await Promise.allSettled([
        this.service.notifyOrderCompleted(orderId),
        this.service.notifyOrderCompletedViaZalo(orderId),
        this.goongMapService.stopOrderTracking(orderId, "completed"),
      ]);

      const sideEffectNames = ["customer-notification", "customer-zalo-notification", "order-tracking"];
      postCommitResults.forEach((postCommitResult, index) => {
        if (postCommitResult.status === "rejected") {
          logger.error("Order completion post-commit side effect failed", {
            orderId,
            sideEffect: sideEffectNames[index],
            error:
              postCommitResult.reason instanceof Error
                ? postCommitResult.reason.message
                : String(postCommitResult.reason),
          });
        }
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  confirmOrderCompletion = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.confirmOrderCompletion(orderId, req, tx.manager);
      });

      if (result.data?.isNewlyConfirmed) {
        const [notificationResult] = await Promise.allSettled([
          this.service.notifyOrderCompletionConfirmed(orderId, req),
        ]);
        if (notificationResult.status === "rejected") {
          logger.error("Order completion confirmation notification failed", {
            orderId,
            error:
              notificationResult.reason instanceof Error
                ? notificationResult.reason.message
                : String(notificationResult.reason),
          });
        }
      }

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  private notifyBranchManagerConfirmationAfterCommit = async (orderId: string, result: any): Promise<void> => {
    if (!result.data?.isNewlyUpdated || !result.data.branchManagerConfirmedStatus) {
      return;
    }

    const [notificationResult] = await Promise.allSettled([
      this.service.notifyBranchManagerConfirmationStatus(orderId, result.data.branchManagerConfirmedStatus),
    ]);
    if (notificationResult.status === "rejected") {
      logger.error("Branch manager confirmation notification failed", {
        orderId,
        error:
          notificationResult.reason instanceof Error
            ? notificationResult.reason.message
            : String(notificationResult.reason),
      });
    }
  };

  confirmBranchManager = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.confirmBranchManager(orderId, req, tx.manager),
      );
      await this.notifyBranchManagerConfirmationAfterCommit(orderId, result);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  rejectBranchManager = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.rejectBranchManager(orderId, req, tx.manager),
      );
      await this.notifyBranchManagerConfirmationAfterCommit(orderId, result);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;

      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.cancelOrder(orderId, req, tx.manager);
      });

      await this.goongMapService.stopOrderTracking(orderId, "canceled");

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  exportBill = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;

      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.exportBill(orderId, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  confirmOrderPaymentAll = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.confirmOrderPaymentAll(req.params.id as string, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  getQrCodeBankTransfer = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;

      const result = await this.service.createQRCodeBankTransfer(orderId, req);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUnreadCommentCount = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;

      const result = await this.service.getUnreadCommentCount(orderId, req);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  makeCallToCustomer = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(400).json({ statusCode: 400, message: "User ID is required" });
      }

      const result = await this.transactionManager.withTransaction(async (tx) => {
        const order = await this.service.findById(orderId, req, tx.manager);
        return await this.service.makeCallToCustomer(order.data, userId, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllUnpaidOrdersByCustomer = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const customerId = req.params.customerId as string;

      const result = await this.service.getAllUnpaidOrdersByCustomer(customerId, req);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const orderId = req.params.id as string;
      const result = await this.service.update(orderId, req.body, req);

      const previousTimeAt = (req as any).existingOrder?.timeAt;
      const updatedTimeAt = result.data?.timeAt;
      const isTimeAtChanged =
        req.body?.timeAt !== undefined &&
        previousTimeAt &&
        updatedTimeAt &&
        new Date(previousTimeAt).getTime() !== new Date(updatedTimeAt).getTime();

      if (isTimeAtChanged) {
        void this.service.notifyOrderTimeAtChanged(orderId).catch((error) => {
          logger.error("Order time change notification failed", {
            orderId,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  checkIn = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.checkIn(id, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };
}
