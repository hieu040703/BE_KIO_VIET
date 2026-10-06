import { Router } from "express";
    import { injectable, inject } from "inversify";
    import { CallNavigationController } from "./callNavigation.controller";
    import { zodValidate } from "@/shared/middleware/validation.middleware";
    
    import { CreateCallNavigationSchema, UpdateCallNavigationSchema, CallNavigationQuerySchema, CallNavigationParamsSchema } from "./callNavigation.validator";
    import { CALL_NAVIGATION_TYPES } from "./callNavigation.types";

    @injectable()
    export class CallNavigationRouter {
      private router: Router;

      constructor(@inject(CALL_NAVIGATION_TYPES.CallNavigationController) private callNavigationController: CallNavigationController) {
        this.router = Router();
        this.initializeRoutes();
      }

      private initializeRoutes(): void {
        // All callNavigation routes require authentication
        // this.router.use(authenticate);

        // GET /callNavigations - Get all callNavigations with filters
        this.router.get("/", zodValidate(CallNavigationQuerySchema, "query"), this.callNavigationController.getAllWithPagination);

        // POST /callNavigations - Create new callNavigation
        this.router.post("/", zodValidate(CreateCallNavigationSchema, "body"), this.callNavigationController.create);

        // GET /callNavigations/:id - Get callNavigation by ID
        this.router.get("/:id", zodValidate(CallNavigationParamsSchema, "params"), this.callNavigationController.getById);

        // PUT /callNavigations/:id - Update callNavigation
        this.router.put(
          "/:id",
          zodValidate(CallNavigationParamsSchema, "params"),
          zodValidate(UpdateCallNavigationSchema, "body"),
          this.callNavigationController.update
        );

        // DELETE /callNavigations/:id - Delete callNavigation
        this.router.delete("/:id", zodValidate(CallNavigationParamsSchema, "params"), this.callNavigationController.delete);
      }

      public getRouter(): Router {
        return this.router;
      }
    }
    