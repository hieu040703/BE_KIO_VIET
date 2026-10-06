import { Router } from "express";
import { injectable, inject } from "inversify";
import multer from "multer";
import { ZaloController } from "./zalo.controller";
import { ZALO_TYPES } from "./zalo.types";
import { AdminZaloTemplateRouter } from "./zaloTemplate/zaloTemplate.route";
import { AdminZaloMessageHistoryRouter } from "./zaloMessageHistory/zaloMessageHistory.route";

// Dùng memoryStorage để đọc buffer trực tiếp, không lưu file tạm
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // Zalo giới hạn 1MB
  fileFilter: (_req, file, cb) => {
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
      cb(new Error("Only JPG and PNG images are supported"));
      return;
    }
    cb(null, true);
  },
});

@injectable()
export class ZaloRouter {
  private router: Router;

  constructor(@inject(ZALO_TYPES.ZaloController) private zaloController: ZaloController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /zalo/refresh-token - Dùng Refresh Token để lấy Access Token mới
    this.router.post("/refresh-token", this.zaloController.refreshToken);

    // POST /zalo/upload-image - Upload ảnh để dùng trong Template Message
    this.router.post("/upload-image", upload.single("file"), this.zaloController.uploadImage);

    // GET /zalo/templates - Lấy danh sách Template ZBS
    this.router.get("/templates", this.zaloController.getTemplateList);

    // GET /zalo/templates/:template_id - Lấy thông tin chi tiết Template ZBS
    this.router.get("/templates/:template_id", this.zaloController.getTemplateDetail);

    // POST /zalo/messages - Gửi tin ZBS Template Message (production)
    this.router.post("/messages", this.zaloController.sendMessage);

    // POST /zalo/messages/dev - Gửi tin ZBS Template Message (development mode)
    this.router.post("/messages/dev", this.zaloController.sendMessageDev);

    // POST /zalo/messages/uid - Gửi tin ZBS Template Message qua UID
    this.router.post("/messages/uid", this.zaloController.sendUidTemplateMessage);

    // GET /zalo/messages/status - Lấy trạng thái gửi tin ZBS qua SĐT
    this.router.get("/messages/status", this.zaloController.getMessageStatus);
  }

  getRouter(): Router {
    return this.router;
  }
}
