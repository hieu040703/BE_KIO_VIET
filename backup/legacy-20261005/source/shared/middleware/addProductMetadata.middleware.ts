import { Request, Response, NextFunction } from "express";

export const addMaterialMetadata = (req: Request, res: Response, next: NextFunction) => {
  // req.body.type = ProductTypeEnum.MATERIAL;
  // req.query.type = ProductTypeEnum.MATERIAL;
  // if (req.body.details && req.body.details.length > 0) {
  //   req.body.details = req.body.details.map((detail: any) => ({ ...detail, type: ProductTypeEnum.MATERIAL }));
  // }

  console.log("req body", req.body);
  next();
};

export const addAssetMetadata = (req: Request, res: Response, next: NextFunction) => {
  // req.body.type = ProductTypeEnum.ASSET;
  // req.query.type = ProductTypeEnum.ASSET;
  // if (req.body.details && req.body.details.length > 0) {
  //   req.body.details = req.body.details.map((detail: any) => ({ ...detail, type: ProductTypeEnum.ASSET }));
  // }
  next();
};
