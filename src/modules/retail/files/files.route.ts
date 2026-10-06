import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailFilesController } from "./files.controller";
import { RETAIL_FILES_TYPES } from "./files.types";
import { filesBodySchema, filesIdParamsSchema, filesQuerySchema } from "./files.validator";

@injectable()
export class RetailFilesRouter {
  private router: Router;

  constructor(@inject(RETAIL_FILES_TYPES.Controller) private filesController: RetailFilesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "files": ["read"] }),
      zodValidate(filesQuerySchema, "query"),
      this.filesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "files": ["create"] }),
      zodValidate(filesBodySchema, "body"),
      this.filesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "files": ["read"] }),
      zodValidate(filesIdParamsSchema, "params"),
      this.filesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "files": ["update"] }),
      zodValidate(filesIdParamsSchema, "params"),
      zodValidate(filesBodySchema, "body"),
      this.filesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "files": ["delete"] }),
      zodValidate(filesIdParamsSchema, "params"),
      this.filesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
