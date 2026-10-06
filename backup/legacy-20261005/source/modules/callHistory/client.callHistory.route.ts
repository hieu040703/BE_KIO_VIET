import { Router } from "express";
    import { injectable, inject } from "inversify";
    import { ClientCallHistoryController } from "./client.callHistory.controller";
    import { zodValidate } from "@/shared/middleware/validation.middleware";
    
    import { CreateCallHistorySchema, UpdateCallHistorySchema, CallHistoryQuerySchema, CallHistoryParamsSchema } from "./callHistory.validator";
    import { CALL_HISTORY_TYPES } from "./callHistory.types";

    @injectable()
    export class ClientCallHistoryRouter {
      private router: Router;

      constructor(@inject(CALL_HISTORY_TYPES.ClientCallHistoryController) private callHistoryController: ClientCallHistoryController) {
        this.router = Router();
        this.initializeRoutes();
      }

      private initializeRoutes(): void {
        // All callHistory routes require authentication
        // this.router.use(authenticate);

        // GET /callHistorys - Get all callHistorys with filters
        this.router.get("/", zodValidate(CallHistoryQuerySchema, "query"), this.callHistoryController.getAllWithPagination);

        // POST /callHistorys - Create new callHistory
        this.router.post("/", zodValidate(CreateCallHistorySchema, "body"), this.callHistoryController.create);

        // GET /callHistorys/:id - Get callHistory by ID
        this.router.get("/:id", zodValidate(CallHistoryParamsSchema, "params"), this.callHistoryController.getById);

        // PUT /callHistorys/:id - Update callHistory
        this.router.put(
          "/:id",
          zodValidate(CallHistoryParamsSchema, "params"),
          zodValidate(UpdateCallHistorySchema, "body"),
          this.callHistoryController.update
        );

        // DELETE /callHistorys/:id - Delete callHistory
        this.router.delete("/:id", zodValidate(CallHistoryParamsSchema, "params"), this.callHistoryController.delete);
      }

      public getRouter(): Router {
        return this.router;
      }
    }
    