import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailNumberSequencesController } from "./numberSequences.controller";
import { RETAIL_NUMBER_SEQUENCES_TYPES } from "./numberSequences.types";
import { numberSequencesBodySchema, numberSequencesIdParamsSchema, numberSequencesQuerySchema } from "./numberSequences.validator";

@injectable()
export class RetailNumberSequencesRouter {
  private router: Router;

  constructor(@inject(RETAIL_NUMBER_SEQUENCES_TYPES.Controller) private numberSequencesController: RetailNumberSequencesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "number-sequences": ["read"] }),
      zodValidate(numberSequencesQuerySchema, "query"),
      this.numberSequencesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "number-sequences": ["create"] }),
      zodValidate(numberSequencesBodySchema, "body"),
      this.numberSequencesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "number-sequences": ["read"] }),
      zodValidate(numberSequencesIdParamsSchema, "params"),
      this.numberSequencesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "number-sequences": ["update"] }),
      zodValidate(numberSequencesIdParamsSchema, "params"),
      zodValidate(numberSequencesBodySchema, "body"),
      this.numberSequencesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "number-sequences": ["delete"] }),
      zodValidate(numberSequencesIdParamsSchema, "params"),
      this.numberSequencesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
