import { injectable, inject } from "inversify";
import { AttributeService } from "./attribute.service";
import { ATTRIBUTE_TYPES } from "./attribute.types";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Request, Response } from "express";

@injectable()
export class AttributeController extends BaseController<AttributeService> {
  constructor(@inject(ATTRIBUTE_TYPES.AttributeService) protected service: AttributeService) {
    super(service);
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Custom logic before creation can be added here
      const user = req.user?.userId;
      const data = await this.service.create(req.body);
      return res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };
}
