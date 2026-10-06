import fs from "fs";
import path from "path";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { FilenameUtils } from "../utils/filename.utils";

export class UploadGlobalMiddleware {
  public static uploadFiles = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      let folderPath = "uploads/temp";

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, folderPath);
        },
        filename: (req, file, cb) => {
          // Fix encoding issue: Multer receives filename in Latin1, convert to UTF-8
          const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
          const uniqueFilename = FilenameUtils.generateUniqueFilename(originalName);
          cb(null, uniqueFilename);
        },
      });

      const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }).any();

      upload(req as any, res as any, async (err) => {
        if (err) {
          return next(err);
        }

        const files = req.files as Express.Multer.File[];
        let keys = req.body.keys;

        if (!Array.isArray(keys)) {
          keys = keys ? [keys] : [];
        }

        if (files.length !== keys.length) {
          return next(err);
        }

        try {
          let uploadedUrls: Record<string, string> = {};

          files.forEach((file, index) => {
            const fileUrl = file.path.replace(/\\/g, "/");
            uploadedUrls[keys[index]] = fileUrl;
          });

          res.status(200).json(uploadedUrls);
        } catch (error) {
          console.log("Lỗi trong quá trình xử lý upload:", error);
          return next(err);
        }
      });
    };
  };
}
