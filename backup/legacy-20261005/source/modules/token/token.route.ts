import { Router } from "express";
import { injectable, inject } from "inversify";
import { TokenController } from "./token.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateTokenSchema, UpdateTokenSchema, TokenQuerySchema, TokenParamsSchema } from "./token.validator";
import { TOKEN_TYPES } from "./token.types";

@injectable()
export class TokenRouter {
  private router: Router;

  constructor(@inject(TOKEN_TYPES.TokenController) private tokenController: TokenController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All token routes require authentication
    // this.router.use(authenticate);

    // GET /tokens - Get all tokens with filters
    this.router.get("/", zodValidate(TokenQuerySchema, "query"), this.tokenController.getAllWithPagination);

    // POST /tokens - Create new token
    this.router.post("/", zodValidate(CreateTokenSchema, "body"), this.tokenController.create);

    // GET /tokens/:id - Get token by ID
    this.router.get("/:id", zodValidate(TokenParamsSchema, "params"), this.tokenController.getById);

    // PUT /tokens/:id - Update token
    this.router.put(
      "/:id",
      zodValidate(TokenParamsSchema, "params"),
      zodValidate(UpdateTokenSchema, "body"),
      this.tokenController.update
    );

    // DELETE /tokens/:id - Delete token
    this.router.delete("/:id", zodValidate(TokenParamsSchema, "params"), this.tokenController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
