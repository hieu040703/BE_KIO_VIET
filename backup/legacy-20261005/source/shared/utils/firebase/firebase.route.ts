import { inject, injectable } from "inversify";
import { FirebaseUtils } from "./firebase.utils";
import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import { COMMON_TYPES } from "@/modules/common/common.types";

@injectable()
export class FirebaseRouter {
  private router: Router;
  @inject(COMMON_TYPES.FirebaseUtils) protected firebaseUtils: FirebaseUtils;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /users - Get all users with filters
    this.router.post("/test", async (req: Request, res: Response, next: NextFunction) => {
      // Implement your logic here
      try {
        const { topic, title, content, token } = req.body;

        if (topic) {
          await FirebaseUtils.SentFirebaseWithTopic({
            topic,
            title,
            content,
          });
        }

        if (token) {
          await FirebaseUtils.SentFirebaseWithToken({
            token,
            title,
            content,
          });
        }

        return res.status(200).json({ message: "Notification sent successfully" });
      } catch (error) {
        next(error);
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
