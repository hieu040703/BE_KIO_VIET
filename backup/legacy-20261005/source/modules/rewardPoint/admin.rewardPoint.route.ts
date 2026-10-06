import { Router } from "express";
    import { injectable, inject } from "inversify";
    import { AdminRewardPointController } from "./admin.rewardPoint.controller";
    import { zodValidate } from "@/shared/middleware/validation.middleware";
    
    import { CreateRewardPointSchema, UpdateRewardPointSchema, RewardPointQuerySchema, RewardPointParamsSchema } from "./rewardPoint.validator";
    import { REWARD_POINT_TYPES } from "./rewardPoint.types";

    @injectable()
    export class AdminRewardPointRouter {
      private router: Router;

      constructor(@inject(REWARD_POINT_TYPES.AdminRewardPointController) private rewardPointController: AdminRewardPointController) {
        this.router = Router();
        this.initializeRoutes();
      }

      private initializeRoutes(): void {
        // All rewardPoint routes require authentication
        // this.router.use(authenticate);

        // GET /rewardPoints - Get all rewardPoints with filters
        this.router.get("/", zodValidate(RewardPointQuerySchema, "query"), this.rewardPointController.getAllWithPagination);

        // POST /rewardPoints - Create new rewardPoint
        this.router.post("/", zodValidate(CreateRewardPointSchema, "body"), this.rewardPointController.create);

        // GET /rewardPoints/:id - Get rewardPoint by ID
        this.router.get("/:id", zodValidate(RewardPointParamsSchema, "params"), this.rewardPointController.getById);

        // PUT /rewardPoints/:id - Update rewardPoint
        this.router.put(
          "/:id",
          zodValidate(RewardPointParamsSchema, "params"),
          zodValidate(UpdateRewardPointSchema, "body"),
          this.rewardPointController.update
        );

        // DELETE /rewardPoints/:id - Delete rewardPoint
        this.router.delete("/:id", zodValidate(RewardPointParamsSchema, "params"), this.rewardPointController.delete);
      }

      public getRouter(): Router {
        return this.router;
      }
    }
    