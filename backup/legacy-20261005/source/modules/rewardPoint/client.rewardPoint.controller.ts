import { injectable, inject } from "inversify";
import { ClientRewardPointService } from "./client.rewardPoint.service";
import { REWARD_POINT_TYPES } from "./rewardPoint.types";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Request, Response } from "express";

@injectable()
export class ClientRewardPointController extends BaseController<ClientRewardPointService> {
  constructor(@inject(REWARD_POINT_TYPES.ClientRewardPointService) protected service: ClientRewardPointService) {
    super(service);
  }

  covertMoneyToPoint = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { amount } = req.body as { amount: number };
      if (typeof amount !== "number" || amount < 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const data = await this.service.covertMoneyToPoint(amount);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };
}
