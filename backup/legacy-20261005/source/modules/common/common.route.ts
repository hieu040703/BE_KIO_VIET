import { inject, injectable } from "inversify";
import { CommonController } from "./common.controller";
import { FileUploadController } from "./fileUpload.controller";
import { COMMON_TYPES } from "./common.types";
import { Router } from "express";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { GetDashboardStatsSchema } from "./common.validator";

@injectable()
export class CommonRouter {
  private router: Router;
  constructor(
    @inject(COMMON_TYPES.CommonController) private controller: CommonController,
    @inject(COMMON_TYPES.FileUploadController) private fileUploadController: FileUploadController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/code", this.controller.getCode);
    this.router.post("/test", this.controller.test);
    this.router.get("/dashboard", zodValidate(GetDashboardStatsSchema, "query"), this.controller.getDashboardStats);
    this.router.get("/hotline", this.controller.getHotline);

    // File upload routes
    this.router.get("/files/presigned-upload-url", this.fileUploadController.getPresignedUploadUrl);
    this.router.post("/files/confirm-upload", this.fileUploadController.confirmUpload);
    this.router.get("/files", this.fileUploadController.listFiles);
    this.router.get("/files/:id/download-url", this.fileUploadController.getDownloadUrl);
    this.router.get("/files/:id", this.fileUploadController.getFileDetail);
    this.router.delete("/files/:id", this.fileUploadController.deleteFile);
  }

  public getRouter(): Router {
    return this.router;
  }
}

const exampleExportPdfRequest = {
  content:
    "{content: <!DOCTYPE html><html><head><style>table, th, td {border: 1px solid black;border-collapse: collapse;}th, td {padding: 5px;}</style></head><body><table style='width:100%'>  <tr>    <th>Firstname</th>    <th>Lastname</th>     <th>Age</th>  </tr>  <tr>    <td>Jill</td>    <td>Smith</td>    <td>50</td>  </tr> <tr>    <td>Eve</td>    <td>Jackson</td>    <td>94</td>  </tr>  <tr>    <td>John</td>    <td>Doe</td>    <td>80</td>  </tr></table>",
  fileName: "sample.pdf", // Optional
};
