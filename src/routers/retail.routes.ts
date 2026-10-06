import { Router, Request } from "express";
import { container } from "@/modules/container";
import { RETAIL_TYPES } from "@/modules/retail/retail.types";
import { RetailRouter } from "@/modules/retail/retail.route";
import { retailGeneratedRoutes } from "@/modules/retail/retail-generated.container";
import { authenticate } from "@/shared/middleware/auth.middleware";

const router = Router();
const retailRouter = container.get<RetailRouter>(RETAIL_TYPES.RetailRouter);

router.use(authenticate);

router.use((req: Request & { tenantId?: string }, _res, next) => {
  const tenantId = req.header("x-tenant-id");
  if (tenantId) req.tenantId = tenantId;
  next();
});

for (const route of retailGeneratedRoutes) {
  router.use(`/${route.resource}`, container.get<any>(route.token).getRouter());
}

router.use("/", retailRouter.getRouter());

export default router;
