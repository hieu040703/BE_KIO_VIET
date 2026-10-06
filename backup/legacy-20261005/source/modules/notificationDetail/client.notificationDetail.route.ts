import { Router } from "express";
    import { injectable, inject } from "inversify";
    import { NotificationDetailController } from "./notificationDetail.controller";
    import { zodValidate } from "@/shared/middleware/validation.middleware";
    
    import { CreateNotificationDetailSchema, UpdateNotificationDetailSchema, NotificationDetailQuerySchema, NotificationDetailParamsSchema } from "./notificationDetail.validator";
    import { NOTIFICATION_DETAIL_TYPES } from "./notificationDetail.types";

    @injectable()
    export class ClientNotificationDetailRouter {
      private router: Router;

      constructor(@inject(NOTIFICATION_DETAIL_TYPES.NotificationDetailController) private notificationDetailController: NotificationDetailController) {
        this.router = Router();
        this.initializeRoutes();
      }

      private initializeRoutes(): void {
        // All notificationDetail routes require authentication
        // this.router.use(authenticate);

        // GET /notificationDetails - Get all notificationDetails with filters
        this.router.get("/", zodValidate(NotificationDetailQuerySchema, "query"), this.notificationDetailController.getAllWithPagination);

        // POST /notificationDetails - Create new notificationDetail
        this.router.post("/", zodValidate(CreateNotificationDetailSchema, "body"), this.notificationDetailController.create);

        // GET /notificationDetails/:id - Get notificationDetail by ID
        this.router.get("/:id", zodValidate(NotificationDetailParamsSchema, "params"), this.notificationDetailController.getById);

        // PUT /notificationDetails/:id - Update notificationDetail
        this.router.put(
          "/:id",
          zodValidate(NotificationDetailParamsSchema, "params"),
          zodValidate(UpdateNotificationDetailSchema, "body"),
          this.notificationDetailController.update
        );

        // DELETE /notificationDetails/:id - Delete notificationDetail
        this.router.delete("/:id", zodValidate(NotificationDetailParamsSchema, "params"), this.notificationDetailController.delete);
      }

      public getRouter(): Router {
        return this.router;
      }
    }
    