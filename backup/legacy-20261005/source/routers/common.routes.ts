import { Router } from "express";

import { AUTH_TYPES } from "@/modules/auth/auth.types";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { FILE_TYPES } from "@/modules/file";
import { EMPLOYEE_TYPES } from "@/modules/employee/employee.types";
import { GOOGLE_MAP_TYPES } from "@/modules/googleMap/googleMap.types";
import { GOONG_MAP_TYPES } from "@/modules/goongMap/goongMap.types";
import { STRINGEE_TYPES } from "@/modules/stringee";

import { UploadGlobalMiddleware } from "../shared/middleware/uploadGlobal.middleware";
import { container } from "../modules/container";
import { AuthRouter } from "@/modules/auth/auth.route";
import { CommonRouter } from "@/modules/common/common.route";
import { FileRouter } from "@/modules/file";
import { CommonEmployeeRouter } from "@/modules/employee/common.employee.route";
import { CommonGoogleMapRouter } from "@/modules/googleMap/common.googleMap.route";
import { GoongMapRouter } from "@/modules/goongMap/goongMap.route";
import { StringeeRouter } from "@/modules/stringee";

const router = Router();

router.post("/uploads", UploadGlobalMiddleware.uploadFiles(), (req, res) => {
  res.status(200).json(res.locals.uploadedUrls);
});

const authRouter = container.get<AuthRouter>(AUTH_TYPES.AuthRouter);
router.use("/auth", authRouter.getRouter());

const commonRouter = container.get<CommonRouter>(COMMON_TYPES.CommonRouter);
router.use("/common", commonRouter.getRouter());

const fileRouter = container.get<FileRouter>(FILE_TYPES.FileRouter);
router.use("/files", fileRouter.getRouter());

const commonEmployeeRouter = container.get<CommonEmployeeRouter>(EMPLOYEE_TYPES.CommonEmployeeRouter);
router.use("/employees", commonEmployeeRouter.getRouter());

const commonGoogleMapRouter = container.get<CommonGoogleMapRouter>(GOOGLE_MAP_TYPES.CommonGoogleMapRouter);
router.use("/google-maps", commonGoogleMapRouter.getRouter());

const goongMapRouter = container.get<GoongMapRouter>(GOONG_MAP_TYPES.GoongMapRouter);
router.use("/goong-map", goongMapRouter.getRouter());

const stringeeRouter = container.get<StringeeRouter>(STRINGEE_TYPES.StringeeRouter);
router.use("/stringee", stringeeRouter.getRouter());

export default router;
