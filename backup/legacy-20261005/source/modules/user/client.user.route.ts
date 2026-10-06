import { Router } from "express";
import { injectable, inject } from "inversify";
import { UserController } from "./user.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateUserSchema, UserQuerySchema, UserParamsSchema, UpdateManagerSchema } from "./user.validator";
import { USER_TYPES } from "./user.types";

@injectable()
export class ClientUserRouter {
  private router: Router;

  constructor(@inject(USER_TYPES.UserController) private userController: UserController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All user routes require authentication
    // this.router.use(authenticate);

    // GET /users - Get all users with filters
    this.router.get("/", zodValidate(UserQuerySchema, "query"), this.userController.getAllWithPagination);

    // POST /users - Create a new user
    this.router.post("/", zodValidate(CreateUserSchema, "body"), this.userController.createManage);

    // PUT /users/:id - Update user by ID
    this.router.put(
      "/:id",
      zodValidate(UserParamsSchema, "params"),
      zodValidate(UpdateManagerSchema, "body"),
      this.userController.updateManager
    );

    // GET /users/:id - Get user by ID
    this.router.get("/:id", zodValidate(UserParamsSchema, "params"), this.userController.getById);

    // DELETE /users/:id - Delete user by ID
    this.router.delete("/:id", zodValidate(UserParamsSchema, "params"), this.userController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
