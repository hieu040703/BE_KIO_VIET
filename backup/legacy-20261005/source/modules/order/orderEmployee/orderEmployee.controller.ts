import { injectable, inject } from "inversify";
import { OrderEmployeeService } from "./orderEmployee.service";
import { ORDER_EMPLOYEE_TYPES } from "./orderEmployee.types";
import { BaseController } from "@/shared/base/BaseController";
import { Request, Response } from "express";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { OrderEmployeeStatusEnum } from "@/shared/constants/constance";
import logger from "@/shared/utils/logger";
import { GOONG_MAP_TYPES } from "@/modules/goongMap/goongMap.types";
import { GoongMapService } from "@/modules/goongMap/goongMap.service";
import { OrderEmployeeDeleteMeta } from "./orderEmployee.service";

@injectable()
export class OrderEmployeeController extends BaseController<OrderEmployeeService> {
  constructor(
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeService)
    protected service: OrderEmployeeService,
    @inject(COMMON_TYPES.TransactionManager)
    private transactionManager: TransactionManager,
    @inject(GOONG_MAP_TYPES.GoongMapService)
    private goongMapService: GoongMapService,
  ) {
    super(service);
  }

  create = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
      const data = await this.transactionManager.withTransaction((tx) => this.service.create(req.body, req, tx.manager));

      if (data.data?.orderId) {
        void this.goongMapService.notifyOrderAssigned(data.data.orderId).catch((error) => {
          logger.error("Order employee tracking notification failed", {
            orderId: data.data?.orderId,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }

      if (data.data?.orderId && data.data.id) {
        void this.service
          .notifyUrgentOrderEmployeeAdded(data.data.orderId, data.data.id)
          .catch((error) => {
            logger.error("Urgent order employee confirmation notification failed", {
              orderId: data.data?.orderId,
              orderEmployeeId: data.data?.id,
              error: error instanceof Error ? error.message : String(error),
            });
          });
      }

      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  confirmSalary = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
      return await this.transactionManager.withTransaction(async (tx) => {
        const id = req.params.id as string;
        const data = await this.service.confirmSalary(id, tx.manager);
        const response = ApiResponseHandler.updateSuccess(
          "Xác nhận mức lương thành công",
          data,
        );
        return res.status(response.statusCode).json(response);
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  private notifyAssignmentStatusAfterCommit = async (
    orderId: string,
    result: any,
  ): Promise<void> => {
    if (!result.data?.isNewlyUpdated || !result.data.orderEmployee) {
      return;
    }

    const [notificationResult] = await Promise.allSettled([
      this.service.notifyOrderEmployeeAssignmentStatus(
        orderId,
        result.data.orderEmployee,
        result.data.orderEmployee.status,
      ),
    ]);
    if (notificationResult.status === "rejected") {
      logger.error("Order employee assignment status notification failed", {
        orderId,
        orderEmployeeId: result.data.orderEmployee.id,
        error:
          notificationResult.reason instanceof Error
            ? notificationResult.reason.message
            : String(notificationResult.reason),
      });
    }
  };

  confirmAssignment = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response | undefined> => {
    try {
      const orderId = req.params.orderId as string;
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.confirmAssignment(
          orderId,
          req.params.id as string,
          req,
          tx.manager,
        ),
      );
      await this.notifyAssignmentStatusAfterCommit(orderId, result);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  rejectAssignment = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response | undefined> => {
    try {
      const orderId = req.params.orderId as string;
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.rejectAssignment(
          orderId,
          req.params.id as string,
          req,
          tx.manager,
        ),
      );
      await this.notifyAssignmentStatusAfterCommit(orderId, result);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  checkOut = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response | undefined> => {
    try {
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.checkOut(
          req.params.orderId as string,
          req.params.id as string,
          req,
          tx.manager,
        ),
      );

      const employeeId = req.user?.employeeId;
      if (employeeId) {
        const [notificationResult] = await Promise.allSettled([
          this.service.notifyOrderEmployeeCheckOut(req.params.orderId as string, employeeId),
        ]);
        if (notificationResult.status === "rejected") {
          logger.error("Order employee checkout notification failed", {
            orderId: req.params.orderId,
            orderEmployeeId: req.params.id,
            employeeId,
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
      return;
    }
  };

  updateAssignmentStatus = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response | undefined> => {
    try {
      const orderId = req.params.orderId as string;
      const result = await this.transactionManager.withTransaction((tx) =>
        this.service.updateAssignmentStatus(
          orderId,
          req.params.id as string,
          req.body.status as OrderEmployeeStatusEnum,
          req,
          tx.manager,
        ),
      );
      await this.notifyAssignmentStatusAfterCommit(orderId, result);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
      const orderEmployeeId = req.params.id as string;

      const { data, deleteMeta } = await this.transactionManager.withTransaction(async (tx) => {
        const deleteMeta = await this.service.getDeleteMeta(orderEmployeeId, tx.manager);
        const data = await this.service.delete(orderEmployeeId, req, tx.manager);

        return { data, deleteMeta };
      });

      if (deleteMeta) {
        const [notificationResult] = await Promise.allSettled([
          this.service.notifyOrderEmployeeRemoved(deleteMeta.orderId, deleteMeta.employeeId),
        ]);

        if (notificationResult.status === "rejected") {
          logger.error("Order employee removal notification failed", {
            orderId: deleteMeta.orderId,
            orderEmployeeId,
            employeeId: deleteMeta.employeeId,
            error:
              notificationResult.reason instanceof Error
                ? notificationResult.reason.message
                : String(notificationResult.reason),
          });
        }
      }

      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };

  updateManyData = async (
    req: Request,
    res: Response,
    next: (err?: any) => void,
  ): Promise<Response<any, Record<string, any>> | undefined> => {
    try {
      return await this.transactionManager.withTransaction(async (tx) => {
        const data = await this.service.updateManyData(
          req.body,
          req,
          tx.manager,
        );
        return res.status(data.statusCode).json(data);
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
