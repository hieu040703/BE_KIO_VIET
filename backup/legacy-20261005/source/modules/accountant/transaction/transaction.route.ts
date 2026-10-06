import { Router } from "express";
    import { injectable, inject } from "inversify";
    import { TransactionController } from "./transaction.controller";
    import { zodValidate } from "@/shared/middleware/validation.middleware";
    
    import { CreateTransactionSchema, UpdateTransactionSchema, TransactionQuerySchema, TransactionParamsSchema } from "./transaction.validator";
    import { TRANSACTION_TYPES } from "./transaction.types";

    @injectable()
    export class TransactionRouter {
      private router: Router;

      constructor(@inject(TRANSACTION_TYPES.TransactionController) private transactionController: TransactionController) {
        this.router = Router();
        this.initializeRoutes();
      }

      private initializeRoutes(): void {
        // All transaction routes require authentication
        // this.router.use(authenticate);

        // GET /transactions - Get all transactions with filters
        this.router.get("/", zodValidate(TransactionQuerySchema, "query"), this.transactionController.getAllWithPagination);

        // POST /transactions - Create new transaction
        this.router.post("/", zodValidate(CreateTransactionSchema, "body"), this.transactionController.create);

        // GET /transactions/:id - Get transaction by ID
        this.router.get("/:id", zodValidate(TransactionParamsSchema, "params"), this.transactionController.getById);

        // PUT /transactions/:id - Update transaction
        this.router.put(
          "/:id",
          zodValidate(TransactionParamsSchema, "params"),
          zodValidate(UpdateTransactionSchema, "body"),
          this.transactionController.update
        );

        // DELETE /transactions/:id - Delete transaction
        this.router.delete("/:id", zodValidate(TransactionParamsSchema, "params"), this.transactionController.delete);
      }

      public getRouter(): Router {
        return this.router;
      }
    }
    