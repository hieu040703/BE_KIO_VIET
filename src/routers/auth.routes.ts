import { Router } from "express";
import { container } from "@/modules/container";
import { AUTH_TYPES } from "@/modules/auth/auth.types";
import { AuthRouter } from "@/modules/auth/auth.route";

const router = Router();
router.use(container.get<AuthRouter>(AUTH_TYPES.Router).getRouter());

export default router;
