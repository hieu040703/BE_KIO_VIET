import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "../types/interfaces";

export const addUserId = (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      console.log("Adding userId to request body:", req.user);
      req.body.userId = req.user.userId;
      req.query.userId = req.user.userId.toString();
    }
    next();
  } catch (error) {
    next(error);
  }
};
